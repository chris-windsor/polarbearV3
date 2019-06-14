import Polarbear from "../Polarbear";
import { Regexes } from "../etc/Regexes";

export const parse = (instance: Polarbear, code: string): string => {
  return code.replace(Regexes.innerInterpolation, (func): string => {
    // Check if the function already has call parameters
    const hasCall = code.match(Regexes.innerFunctionInterpolation);

    if (instance[func]) {
      // Return usable function call if function exists in instance
      return hasCall ? `this.${func}` : `this.${func}()`;
    } else {
      // Return original function call if function is not related to instance
      return func;
    }
  });
};
