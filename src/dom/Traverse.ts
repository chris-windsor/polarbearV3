import { Regexes } from "../etc/Regexes";
import createEl from "../vdom/CreateElement";
import { strObj, vNode } from "../globals";
import { getProp } from "../data/DataFns";
import Polarbear from "../Polarbear";

export default function traverse(instance: Polarbear, node: HTMLElement) {
  let attrs: strObj = {};
  let events: strObj = {};
  let conditionalCase: string = "";
  let loopCase: string = "";
  let boundData: { [key: string]: any } = {};
  let refName: string = "";
  let children: vNode[] = [];

  Array.from(node.childNodes)
       .forEach((e: HTMLElement) => {
         if (e.nodeType === 1) {
           children.push((traverse(instance, e) as vNode));
         } else {
           children.push((e as any).data);
         }
       });

  for (let i = 0; i < node.attributes.length; i++) {
    const {name, value} = node.attributes[i];

    if (name.startsWith("@")) {
      // Process event attributes
      const ev = name.slice(1);
      events[ev] = value;
    } else if (name.startsWith("bindval")) {
      // Process value binding attribute
      const specs = name.split(".");
      boundData = {
        prop: value,
        opts: specs.slice(1)
      };
    } else if (name === "loopfor") {
      // Process loop attribute
      loopCase = String(value);
    } else if (name === "ref") {
      // Process reference attribute
      refName = String(value);
    } else if (name === "showif") {
      // Process conditional if attribute
      const computedCondition: string = value.replace(Regexes.interpolationContent, (s: string) => {
        return getProp(instance.$data, s) !== undefined ? `this.${s}` : s;
      });
      conditionalCase = computedCondition;
    } else if (name === "showelse") {
      // Process conditional else attribute
      // @ts-ignore
      const computedCondition: string = node.previousElementSibling.attributes["showif"].value.replace(Regexes.interpolationContent, (s: string) => {
        return getProp(instance.$data, s) !== undefined ? `this.${s}` : s;
      });
      conditionalCase = `!(${computedCondition})`;
    } else {
      // Found no matching attributes related to Polarbear
      attrs[name] = value;
    }
  }

  return createEl(node.tagName, {
    attrs,
    events,
    conditionalCase,
    loopCase,
    boundData,
    refName,
    children
  });
};
