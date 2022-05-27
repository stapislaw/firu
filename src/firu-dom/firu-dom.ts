import ReactDOM from "react-dom";
import { FiruDOMData } from "./firu-dom-data";

class FiruDOM {
  private static instance: FiruDOM;
  private dataController;
  private readyPromise: Promise<void>;

  private constructor() {
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
  get data(): Object {
    return this.dataController.data;
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
  public render(element: any): void {
    this.whenReady().then(() => {
      const container = document.createElement("div");
      document.body.appendChild(container);
      ReactDOM.render(element, container);
    });
  }

  public static getInstance(): FiruDOM {
    if (!FiruDOM.instance) {
      FiruDOM.instance = new FiruDOM();
    }
    return FiruDOM.instance;
  }
}

export const firu = FiruDOM.getInstance();
