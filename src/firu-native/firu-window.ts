import { dirname, join, relative, normalize } from "path";
import { app, BrowserWindow, WebContents } from "electron";
import { nativeDataController } from "./firu-native-data";
import { IWindowOptions } from "../i-window-options";
import { isPrimitive, isPrimitiveObject, IWindowData } from "../i-window-data";
import { windowInfo } from "./firu-window-info";

const INDEX_PATH = relative(
  app.getAppPath(),
  join(module.path, "../../index.html")
);

/**
 * Allows to create Electron's BrowserWindow with empty page and load script.
 */
export class FiruWindow {
  private window: BrowserWindow;

  /**
   * Construct new FiruWindow.
   *
   * @param scriptPath - relative path to script file starting from directory of project main file
   * @param options - window options
   */
  constructor(scriptPath: string, options: IWindowOptions) {
    this.window = this.buildBrowserWindow(options);
    try {
      this.initWindowInfo(scriptPath, options);
      this.setFiruData(options);
    } catch (e) {
      console.error("Firu error:", e);
    }
  }

  /** Try to close the window. */
  public close(): void {
    this.window.close();
  }

  /** Force closing the window. */
  public destroy(): void {
    this.window.destroy();
  }

  /** Hides the window. */
  public hide(): void {
    this.window.hide();
  }

  /** Minimizes the window. */
  public minimize(): void {
    this.window.minimize();
  }

  /** Maximizes the window. This will also show (but not focus) the window if it isn't being displayed already. */
  public maximize(): void {
    this.window.maximize();
  }

  /** Triggers callback when window is resized (also maximized and unmaximized). */
  public set onResized(callback: (width: number, height: number) => void) {
    const resizeCallback = () => {
      const size = this.window.getSize();
      callback(size[0], size[1]);
    };
    this.window.on("resized", resizeCallback);
    this.window.on("maximize", resizeCallback);
    this.window.on("unmaximize", resizeCallback);
  }

  /** Triggers callback when window is moved to a new position. */
  public set onMoved(callback: (x: number, y: number) => void) {
    this.window.on("moved", () => {
      const position = this.window.getPosition();
      callback(position[0], position[1]);
    });
  }

  /** Set the window's menu bar.*/
  public setMenu(menu: Electron.Menu): void {
    this.window.setMenu(menu);
  }

  /** Show and gives focus to the window. */
  public show(): void {
    this.window.show();
  }

  public get webContents(): WebContents {
    return this.window.webContents;
  }

  public whenReadyToShow(callback: () => void): void {
    this.window.on("ready-to-show", callback);
  }

  /**
   * Adds window info to FiruWindowInfo controller.
   *
   * @param scriptPath - path to script file
   * @param options - window options
   */
  private initWindowInfo(scriptPath: string, options: IWindowOptions): void {
    // Path sanitization
    let path = this.sanitizePath(scriptPath);
    if (path === null) {
      throw new Error("Invalid scriptPath.");
    }

    // Preload sanitization if exists.
    let preload = undefined;
    if (typeof options.preload === "string") {
      preload = this.sanitizePath(options.preload);
    }
    if (preload === null) {
      throw new Error("Invalid preload.");
    }

    if (require.main) {
      path = join(relative(__dirname, require.main.path), path);
      if (preload) {
        preload = join(relative(__dirname, require.main.path), preload);
      }
    }

    windowInfo.addInfo(this, path, preload);
  }

  /**
   * Builds new BrowserWindow without content(about:blank) and loads given script in it.
   *
   * @param scriptPath - relative path to script file starting from directory of project main file
   * @param options - window options
   * @returns created BrowserWindow
   */
  private buildBrowserWindow(options: IWindowOptions): BrowserWindow {
    // Creating blank BrowserWindow
    const win = new BrowserWindow(this.buildBrowserWindowOptions(options));
    win.loadFile(INDEX_PATH);

    // Remove window menu if necessary
    if (options.showMenu === false) win.removeMenu();

    // Open devTools if necessary
    if (options.devTools === true) win.webContents.openDevTools();

    return win;
  }

  /**
   * Rewrite FiruWindow options to BrowserWindow constructor options.
   *
   * @param options - FiruWindow options
   * @returns BrowserWindow options
   */
  private buildBrowserWindowOptions(
    options: IWindowOptions
  ): Electron.BrowserWindowConstructorOptions {
    const get = function <T>(val: T, def: T): T {
      if (val !== undefined) return val;
      else return def;
    };

    return {
      alwaysOnTop: get(options.alwaysOnTop, false),
      backgroundColor: get(options.backgroundColor, "#fff"),
      closable: get(options.closable, true),
      frame: get(!options.frameless, false),
      height: options.height,
      kiosk: get(options.kioskMode, false),
      maximizable: get(options.maximizable, true),
      minimizable: get(options.minimizable, true),
      movable: get(options.movable, true),
      resizable: get(options.resizable, true),
      thickFrame: get(options.thickFrame, true),
      title: options.title,
      show: get(options.show, true),
      webPreferences: {
        devTools: get(options.devTools, false),
        nodeIntegration: get(options.nodeIntegration, false),
        contextIsolation: get(options.contextIsolation, true),
        preload: join(__dirname, "firu-preload.js"),
      },
      width: options.width,
      x: options.x,
      y: options.y,
    };
  }

  /**
   * Sanitize path and check for directory traversal.
   *
   * @param path - path to sanitize
   * @returns sanitized path
   */
  private sanitizePath(path: string): string | null {
    const correct = path.indexOf("\0") === -1 && /^[\.a-z0-9\\\/]+$/.test(path);
    if (!correct || require.main === undefined) {
      return null;
    }
    path = normalize(path).replace(/^(\.\.(\/|\\|$))+/, "");
    const mainFolder = dirname(require.main.filename);
    const root = relative(app.getAppPath(), mainFolder);
    if (join(root, path).indexOf(root) !== 0) {
      return null;
    }
    return path.replaceAll("\\", "/");
  }

  /**
   * Validates window data and add it to native data controller.
   *
   * @param options - window options.
   */
  private setFiruData(options: IWindowOptions) {
    if (typeof options === "object" && "data" in options) {
      if (options.data !== undefined && this.validateWindowData(options.data)) {
        nativeDataController.addData(this, options.data);
      } else {
        console.error("Invalid FiruWindow data.");
      }
    }
  }

  /**
   * Validate given data with IWindowData specification.
   *
   * @param data - data to validate
   * @returns `true` if data is correct, otherwise `false`.
   */
  private validateWindowData(data: IWindowData): boolean {
    if (typeof data !== "object") return false;

    // Check object keys
    Object.keys(data).forEach((key) => {
      if (
        !(
          isPrimitive(data[key]) ||
          isPrimitiveObject(data[key]) ||
          typeof data[key] === "function"
        )
      ) {
        return false;
      }
    });

    // All corect.
    return true;
  }
}
