import { Regexes } from "../etc/Regexes";
import { createEl } from "../vdom/CreateElement";

export const traverse = (node: HTMLElement) => {
  let children: {}[] = [];
  let attrs: { [key: string]: string } = {};
  let events: { [key: string]: string } = {};
  let conditionalCase: string = "";

  Array.from(node.childNodes)
       .forEach((e: HTMLElement) => {
         if (e.nodeType === 1) {
           children.push(traverse(e));
         } else {
           children.push((e as any).data);
         }
       });

  for (let i = 0; i < node.attributes.length; i++) {
    const {name, value} = node.attributes[i];

    if (name.startsWith("@")) {
      // Process event attributes
      const ev = name.slice(1);
      events[ev] = value
    } else if (name.startsWith("bindval")) {
      // Process value binding attribute

    } else if (name === "loopfor") {
      // Process loop attribute

    } else if (name === "ref") {
      // Process reference attribute

    } else if (name === "showif") {
      // Process conditional if attribute
      const computedCondition: string = value.replace(Regexes.interpolationContent, (s: string) => {
        // TODO: check for actual property vs built-ins using getter
        return `this.${s}`;
      });
      conditionalCase = computedCondition;
    } else if (name === "showelse") {
      // Process conditional else attribute
      // @ts-ignore
      const computedCondition: string = node.previousElementSibling.attributes["showif"].value.replace(Regexes.interpolationContent, (s: string) => {
        // TODO: check for actual property vs built-ins using getter
        return `this.${s}`;
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
    children
  });
};
