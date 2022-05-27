import { ipcMain } from "electron";
import { FiruWindow } from "./firu-window";
import { IWindowData } from "./i-window-data";

/**
 * Controls data in main process. Stores data from every `FiruWindow` and handles request from renderer process via IPC.
 */
export class FiruNativeData {
  private dataMap: Map<number, Object>;
  private functionsMap: Map<number, Object>;

  constructor() {
    this.dataMap = new Map<number, Object>();
    this.functionsMap = new Map<number, Object>();

    ipcMain.handle("firu-data", (e) => this.handleDataRequest(e));
    ipcMain.handle("firu-data-function", (e, ...args) =>
      this.handleFunctionRequest(e, ...args)
    );
  }

  /**
   * Adds window data to controller.
   *
   * @param window - window with data to add
   * @param data - data from given FiruWindow
   */
  public addData(window: FiruWindow, data: IWindowData): void {
    const contentsID = window.webContents.id;

    let functions = {};
    let primitiveData = {};

    //Adds values to correct objects.
    Object.keys(data).forEach((key) => {
      const value = data[key];
      // Bind function `this` to FiruWindow.
      if (typeof value === "function") functions[key] = value.bind(window);
      else primitiveData[key] = value;
    });

    //Adds primitive and function data to proper maps.
    this.dataMap.set(contentsID, primitiveData);
    this.functionsMap.set(contentsID, functions);
  }

  /**
   * Removes window data from controller.
   *
   * @param window - window with data to remove
   */
  public freeData(window: FiruWindow): void {
    try {
      const id = window.webContents.id;
      this.dataMap.delete(id);
      this.functionsMap.delete(id);
    } catch (e) {
      console.error("Unexpected error while removing window data.");
    }
  }

  /**
   * Handles IPC request for data. Returns primitive data and key attributes of functions.
   *
   * @param e - ipc event
   * @returns string containing JSON with primitive data and functions key attributes.
   */
  private async handleDataRequest(e: Electron.IpcMainInvokeEvent) {
    let primitiveData = this.dataMap.get(e.sender.id) || {};
    let functions = this.functionsMap.get(e.sender.id) || {};
    return JSON.stringify({
      data: primitiveData,
      functions: Object.keys(functions),
    });
  }

  /**
   * Handles IPC request for function call. Returns JSON string with function return.
   *
   * @param e - ipc event
   * @param args - ipc arguments
   * @returns string containing JSON with return of function.
   */
  private async handleFunctionRequest(e: Electron.IpcMainInvokeEvent, ...args) {
    let returnData = null;
    try {
      const name = args[0]; // Function name
      const functionArgs = JSON.parse(args[1]); // Function arguments

      // Calling function
      returnData = this.functionsMap.get(e.sender.id)[name](...functionArgs);
    } catch (e) {
      console.error(
        "Unexpected error happened, when parsing request arguments",
        e
      );
    }

    // Wait when return is promise.
    if (returnData instanceof Promise) {
      returnData = await returnData;
    }

    let functionReturn = {};
    if (returnData) {
      functionReturn = { hasReturn: true, returnData: returnData };
    } else {
      functionReturn = { hasReturn: false };
    }

    try {
      functionReturn = JSON.stringify(functionReturn);
    } catch (e) {
      console.error(
        "Unexpected error happened, when parsing function return",
        e
      );
    }

    return functionReturn;
  }
}

let controller = undefined;
if (typeof document === "undefined") controller = new FiruNativeData();
export const nativeDataController: FiruNativeData = controller;
