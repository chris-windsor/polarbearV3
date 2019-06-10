import { vNode } from "../globals";
import Polarbear from "../Polarbear";
import { Regexes } from "../etc/Regexes";
import createEl from "./CreateElement";

export default function hydrate(instance: Polarbear, node: (vNode | string)) {
  const nodeCopy = JSON.parse(JSON.stringify(node));
  const data = instance.$data;

  let newRootChildren: (vNode | string)[] = [];

  nodeCopy.children.map((e: (vNode | string), i: number) => {
    if (typeof e !== "string" && e.loopCase) {
      const {tagName, attrs = {}, events = {}, conditionalCase, loopCase, boundData, refName, children = []} = e;

      const preHydratedChildren = hydrate(instance, {
        tagName, attrs, events, conditionalCase, loopCase: null, boundData, refName, children
      });

      const newChildren = Array.from(new Array(parseInt(loopCase as string)), (v, j) => {
        return createEl(tagName, {
          attrs,
          events,
          conditionalCase,
          loopCase: null,
          boundData,
          refName: null,
          children: [preHydratedChildren]
        });
      });

      newRootChildren.push(...newChildren);
    } else {
      if ((e).toString() === "[object Object]") {
        newRootChildren.push(hydrate(instance, e as vNode));
      } else {
        const parsed = computeContent(instance, e as string);

        newRootChildren.push(Function(`
            "use strict";
            return \`${parsed}\`;
            `)
          .call(data));
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
        // TODO: check for actual property vs built-ins using getter
        return `this.${s}`;
      });

      // TODO: fix this nonsense
      return innerContent.replace("{{", "${")
                         .replace("}}", "}");
    });
  }

  return content;
};
