import { ipcMain } from "electron";
import { FiruWindow } from "./firu-window";

interface WindowInfo {
  path: string;
  preload: string | undefined;
  base: string;
}

/**
 * Controls window info in main process. Stores window info from every `FiruWindow` and handles request from renderer process via IPC.
 */
class FiruWindowInfo {
  private _info: Map<number, WindowInfo> = new Map();

  constructor() {
    ipcMain.handle("firu-info", (e) => this.handleInfoRequest(e));
  }

  /**
   * Adds window info to controller.
   *
   * @param window - firu window
   * @param path - path to script file
   * @param preload - path to preload file or undefined
   */
  public addInfo(
    window: FiruWindow,
    path: string,
    preload: string | undefined,
    base: string
  ): void {
    this._info.set(window.webContents.id, {
      path,
      preload,
      base,
    });
  }

  /**
   * Handles info request from IPC
   *
   * @param e - ipc event
   * @returns proper window info
   */
  private handleInfoRequest(
    e: Electron.IpcMainInvokeEvent
  ): WindowInfo | undefined {
    const info = this._info.get(e.sender.id);
    return info;
  }
}

export const windowInfo: FiruWindowInfo = new FiruWindowInfo();
