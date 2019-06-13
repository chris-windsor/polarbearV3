import { vNode } from "../globals";
import Polarbear from "../Polarbear";
import { Regexes } from "../etc/Regexes";
import createEl from "./CreateElement";
import computeLoop from "../attributes/Loopfor";
import { getProp } from "../data/DataFns";
import resolveType from "../etc/ResolveType";

export default function hydrate(instance: Polarbear, node: (vNode | string), extraData?: { [key: string]: any }) {
  const nodeCopy = JSON.parse(JSON.stringify(node));
  const data = instance.$data;

  let newRootChildren: (vNode | string)[] = [];

  nodeCopy.children.map((e: (vNode | string)) => {
    if (typeof e !== "string" && e.loopCase) {
      const {tagName, attrs = {}, events = {}, conditionalCase, loopCase, boundData, refName, children = []} = e;

      const {keyName, valName, idxName, iterable, count, type} = computeLoop(instance, loopCase);

      const newChildren = Array.from(new Array(count), (v, j) => {
        return createEl(tagName, {
          attrs,
          events,
          conditionalCase,
          loopCase: null,
          boundData,
          refName: null,
          // TODO: only re-hydrate the nodes if their data has changed or the loop iteration has changed
          children: [hydrate(instance, {
            tagName, attrs, events, conditionalCase, loopCase: null, boundData, refName, children
          }, {
            [keyName || '$KEYNAME']: type === "array" ? iterable[j]: type === "object" ? iterable[j][0] : j,
            [valName || '$VALNAME']: type === "array" ? null: type === "object" ? iterable[j][1]: j,
            [idxName || '$IDXNAME']: j
          })]
        });
      });

      newRootChildren.push(...newChildren);
    } else {
      if (resolveType(e) === "object") {
        newRootChildren.push(hydrate(instance, e as vNode, extraData));
      } else {
        const parsed = computeContent(instance, e as string);

        newRootChildren.push(Function(`
            "use strict";
            const $EXTRA_DATA = arguments[0];
            return \`${parsed}\`;
            `)
          .call(data, extraData || {}));
      }
    }
  });

  nodeCopy.children = newRootChildren;

  return nodeCopy;
}

const computeContent = (instance: Polarbear, content: string) => {
  // Attempt to find interpolation calls within an elements text content
  const interpolationMatches: RegExpMatchArray = content.match(Regexes.globalInterpolation);

  // If there is no interpolation calls then just break out
  if (!interpolationMatches) {
    return content;
  }

  for (let i = 0; i < interpolationMatches.length; i++) {
    // Replace every interpolation call with its computed evaluation
    content = content.replace(interpolationMatches[i], (cur: string) => {
      // Replace each property or function call within the interpolation with a reference to the instance
      const innerContent = cur.replace(Regexes.interpolationContent, (s: string) => {
        if (getProp(instance.$data, s) !== undefined) {
          return `this.${s}`;
        } else {
          return `$EXTRA_DATA.${s}`;
        }
      });

      return innerContent.replace("{{", "${")
                         .replace("}}", "}");
    });
  }

  return content;
};
