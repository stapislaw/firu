import ReactDOM from "react-dom";
import { FiruDOMData } from "./firu-dom-data";

/**
 * Maintain firu renderer process functions.
 */
class FiruDOM {
  private dataController;
  private readyPromise: Promise<void>;

  constructor() {
    this.dataController = new FiruDOMData();
    this.readyPromise = new Promise((resolve) => {
      this.dataController.whenReady().then(() => {
        resolve();
      });
    });
  }

  /**
   * Returns data controller which allows to main process data.
   *
   * @returns renderer process data controller
   */
  get data(): object {
    return this.dataController;
  }

  /**
   * Returns promise triggered when data is loaded.
   * Can be called only once in single renderer process.
   *
   * @returns promise triggered when data loaded
   */
  public whenReady(): Promise<void> {
    return this.readyPromise;
  }

  /**
   * When firu data loaded, reates empty div and render given element to it using `ReactDOM.renderer`.
   *
   * @param element - element to render
   */
  public render(element): void {
    this.whenReady().then(() => {
      const container = document.createElement("div");
      document.body.appendChild(container);
      ReactDOM.render(element, container);
    });
  }
}

// Constructs only in renderer process
let firuDOM = undefined;
if (typeof document !== "undefined") firuDOM = new FiruDOM();
export const firu: FiruDOM = firuDOM;
