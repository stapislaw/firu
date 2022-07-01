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

/**
 * Create and add `base` element to document head.
 *
 * @param href - `href` of base
 */
const addBase = (href: any) => {
  if (typeof href === "string") {
    const base = document.createElement("base");
    base.href = href;
    document.head.append(base);
  }
};

ipcRenderer.invoke("firu-info").then((value) => {
  requireIfString(value.preload);
  document.addEventListener("DOMContentLoaded", () => {
    requireIfString(value.path);
    addBase(value.base);
  });
});
