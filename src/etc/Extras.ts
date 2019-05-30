export const isFunction = (functionToCheck: any): boolean => {
  return functionToCheck && {}.toString.call(functionToCheck) === "[object Function]";
};