import { IWindowData } from "./i-window-data";

export interface IWindowOptions {
  alwaysOnTop?: boolean;
  backgroundColor?: string;
  closable?: boolean;
  data?: IWindowData;
  devTools?: boolean;
  frameless?: boolean;
  height?: number;
  icon?: string;
  kioskMode?: boolean;
  maximizable?: boolean;
  minimizable?: boolean;
  movable?: boolean;
  resizable?: boolean;
  showMenu?: boolean;
  show?: boolean;
  thickFrame?: boolean;
  title?: string;
  width?: number;
  x?: number;
  y?: number;
}
