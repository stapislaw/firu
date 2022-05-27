import { ipcRenderer } from "electron";
import { IWindowData } from "../i-window-data";

/**
 * Controls data in renderer process.
 */
export class FiruDOMData {
  private ready = false;
  private resolve: Function | null = null;
  public data: IWindowData = {};

  constructor() {
    // Request data from main process
    ipcRenderer.invoke("firu-data").then((data) => this.parseResponse(data));
  }

  /**
   * Returns promise triggered when data is loaded.
   * Can be called only once in single renderer process.
   *
   * @returns promise triggered when data loaded
   */
  public whenReady(): Promise<void> {
    if (this.resolve !== null)
      throw new Error("Function whenReady can be called only once");

    return new Promise((resolve) => {
      if (this.ready) resolve();
      else this.resolve = resolve;
    });
  }

  /**
   * Parses response from IPC.
   *
   * @param ipcData - IPC response data
   */
  private parseResponse(ipcData: string) {
    try {
      const response = JSON.parse(ipcData);
      Object.keys(response.data).forEach((key) => {
        this.data[key] = response.data[key];
      });
      response.functions.forEach((key: string) => {
        this.data[key] = this.getDataFunction(key);
      });
    } catch (e) {
      console.error(
        "Unexpected error happened, while parsing response data.",
        e
      );
    }

    this.ready = true;
    if (this.resolve !== null) this.resolve();
  }

  /**
   * Returns function which sends request to main process.
   * @param name - function name
   */
  private getDataFunction(name: string) {
    return async function () {
      let requestReturn = await ipcRenderer.invoke(
        "firu-data-function",
        name,
        JSON.stringify([...arguments])
      );
      requestReturn = JSON.parse(requestReturn);
      if (requestReturn.hasReturn == false) return undefined;
      else return requestReturn.returnData;
    };
  }
}
