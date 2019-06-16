import Polarbear from "../Polarbear";
import { getProp } from "../data/DataFns";
import resolveType from "../etc/ResolveType";
import normalizeString from "../etc/NormalizeString";

export default function computeLoop(instance: Polarbear, statement: string) {
  const loopComponents: string[] = statement.split(/\sin\s/);

  if (loopComponents.length > 1) {
    const specifics = loopComponents[0].trim()
                                       .split(",");
    const iterableName: string = loopComponents[1].trim();
    let iterable = getProp(instance.$data, iterableName) || iterableName;

    let keyName, valName, idxName, count;

    const type = resolveType(iterable);

    if (specifics.length === 1) {
      keyName = normalizeString(specifics[0]);
    } else if (specifics.length === 2) {
      keyName = normalizeString(specifics[0]);
      idxName = normalizeString(specifics[1]);
    } else if (specifics.length === 3) {
      keyName = normalizeString(specifics[0]);
      valName = normalizeString(specifics[1]);
      idxName = normalizeString(specifics[2]);
    } else {
      console.error(`Unable to parse loop statement: '${statement}'.`);
    }

    switch (type) {
      case "array":
        count = iterable.length;
        break;
      case "object":
        iterable = Object.entries(iterable);
        count = Object.keys(iterable).length;
        break;
      case "number":
        count = parseInt(iterable);
        break;
      default:
        console.error(`Unknown iterable type for '${iterableName}'.`);
        break;
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
    console.error(`Unable to parse loop statement: '${statement}'.`);
  }
}
