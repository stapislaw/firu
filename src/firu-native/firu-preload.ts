import { ipcRenderer } from "electron";

/**
 * Require file is path is string.
 *
 * @param path - path to require
 */
const requireIfString = (path: any) => {
  if (typeof path === "string") {
    require("./" + path);
  }
};

ipcRenderer.invoke("firu-info").then((value) => {
  requireIfString(value.preload);
  document.addEventListener("DOMContentLoaded", () => {
    requireIfString(value.path);
  });
});
