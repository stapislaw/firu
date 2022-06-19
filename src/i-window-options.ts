import { IWindowData } from "./i-window-data";

export interface IWindowOptions {
  alwaysOnTop?: boolean;
  backgroundColor?: string;
  closable?: boolean;
  contextIsolation?: boolean;
  data?: IWindowData;
  devTools?: boolean;
  frameless?: boolean;
  height?: number;
  icon?: string;
  kioskMode?: boolean;
  maximizable?: boolean;
  minimizable?: boolean;
  movable?: boolean;
  nodeIntegration?: boolean;
  preload?: string;
  resizable?: boolean;
  showMenu?: boolean;
  show?: boolean;
  thickFrame?: boolean;
  title?: string;
  width?: number;
  x?: number;
  y?: number;
}
