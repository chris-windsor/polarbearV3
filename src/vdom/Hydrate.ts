import { vNode } from "../globals";
import Polarbear from "../Polarbear";
import { Regexes } from "../etc/Regexes";

export default function hydrate(instance: Polarbear, node: vNode) {
  const nodeCopy = JSON.parse(JSON.stringify(node));
  const data = instance.$data;

  Array.from(nodeCopy.children)
       .forEach((e: (vNode | string), i: number) => {
         if ((e).toString() === "[object Object]") {
           nodeCopy.children[i] = hydrate(instance, e as vNode);
         } else {
           const parsed = computeContent(instance, e as string);

           nodeCopy.children[i] = Function(`
            "use strict";
            return \`${parsed}\`;
            `)
             .call(data);
         }
       });
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
      return innerContent.replace('{{', "${").replace("}}", "}")
    });
  }

  return content;
};
