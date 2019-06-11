import Polarbear from "../Polarbear";
import { getProp } from "../data/DataFns";

export default function computeLoop(instance: Polarbear, statement: string) {
  const loopComponents: string[] = statement.split(/\sin\s/);

  if (loopComponents.length > 1) {
    const specifics = loopComponents[0].trim()
                                       .split(",");
    let iterable = getProp(instance.$data, loopComponents[1].trim());

    let keyName, valName, idxName, count, type;

    console.log(specifics);

    if (specifics.length === 1) {
      keyName = specifics[0].trim();
    } else if (specifics.length === 2) {
      keyName = specifics[0].substr(1)
                            .trim();
      idxName = specifics[1].substr(0, specifics[1].length - 1)
                            .trim();
    } else if (specifics.length === 3) {
      keyName = specifics[0].substr(1)
                            .trim();
      valName = specifics[1].trim();
      idxName = specifics[2].substr(0, specifics[2].length - 1)
                            .trim();
    } else {
      // ERROR: too many vars
    }


    // TODO: use global type checking methods
    // TODO: implement number iterable
    if (Array.isArray(iterable)) {
      type = "array";
      count = iterable.length;
    } else if ((iterable).toString() === "[object Object]") {
      type = "object";
      iterable = Object.entries(iterable);
      count = Object.keys(iterable).length;
    } else {
      type = "number";
      count = parseInt(iterable);
    }

    return {
      keyName,
      valName,
      idxName,
      iterable,
      count,
      type
    };
  } else {
    // ERROR: invalid loop specification
  }
}
