import Polarbear from "../Polarbear";
import { Regexes } from "../etc/Regexes";

export const parse = (instance: Polarbear, code: string): string => {
  return code.replace(Regexes.innerInterpolation, (func): string => {
    // Strip parenthesis from function name to check if the function is in the instance
    const functionName: string = func.substr(0, func.length - 2);

    // TODO: fix this garbage
    return `this.${func}()`;
    if (instance[functionName]) {
      // Return usable function call if function exists in instance
    } else {
      // Return original function call if function is not related to instance
      return func;
    }
  });
};
