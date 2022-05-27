type primitive = boolean | null | undefined | number | string | symbol;

type primitiveObject = {
  [key: string]: primitive | primitiveObject;
};

export type IWindowData = {
  [key: string]: primitive | Function | primitiveObject | primitive[];
};

/**
 * Check if element is of type `primitive`.
 *
 * @param val - variable to check
 * @returns `true` if variable of type `primitive`, otherwise `false`
 */
export function isPrimitive(val: unknown) {
  return (
    val === null ||
    val === undefined ||
    typeof val === "boolean" ||
    typeof val === "number" ||
    typeof val === "string" ||
    typeof val === "symbol"
  );
}

/**
 * Check if element is an object and of type `primitiveObject`.
 * @param obj - variable to check
 * @returns `true` if object of type `primitiveObject`, otherwise `false`
 */
export function isPrimitiveObject(obj: unknown) {
  if (typeof obj !== "object") return false;

  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === "object" && !isPrimitiveObject(obj[key])) {
      return false;
    } else if (!isPrimitive(obj[key])) {
      return false;
    }
  });

  return true;
}
