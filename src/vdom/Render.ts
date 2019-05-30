import Polarbear from "../Polarbear";
import { vNode } from "../globals";
import computeEvent from "../attributes/Events";
import { Regexes } from "../etc/Regexes";
import innerInterpolation = Regexes.innerInterpolation;

export const renderElem = (instance: Polarbear, {tagName, attrs, events, conditionalCase, children}: vNode) => {
  // Evaluate conditional statement for the element
  const conditionalEval: boolean = Boolean(Function(`"use strict";return ${conditionalCase};`)
    .call(instance));

  // Create a comment element if the conditional statement is false
  if (conditionalCase && conditionalEval === false) {
    return document.createComment(" ");
  }

  // Create a base element with specified tag type
  const $el = document.createElement(tagName);

  // Add element attributes
  for (const [k, v] of Object.entries(attrs)) {
    $el.setAttribute(k, v);
  }

  // Add element events
  for (const [k, v] of Object.entries(events)) {
    // $el.addEventListener(k, (v as any));
    const { eventName, fn, otherEventModifiers } = computeEvent(instance, k, v);
    $el.addEventListener(eventName, fn, otherEventModifiers);
  }

  // Render and append element children
  for (const child of children) {
    const $child = render(instance, child);
    $el.appendChild($child);
  }

  // Return the created element
  return $el;
};

const render = (instance: Polarbear, vNode: vNode | string) => {
  if (typeof vNode === "string") {
    return document.createTextNode(vNode);
  }
  return renderElem(instance, vNode);
};
