import Polarbear from "../Polarbear";
import { vNode } from "../globals";
import computeEvent from "../attributes/Events";
import { getProp } from "../data/DataFns";
import computeBinding from "../attributes/Bindval";
import { createEl } from "./CreateElement";

export const renderElem = (instance: Polarbear, {tagName, attrs = {}, events = {}, conditionalCase, loopCase, boundData, children = []}: vNode) => {
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
    const {eventName, fn, otherEventModifiers} = computeEvent(instance, k, v);
    $el.addEventListener(eventName, fn, otherEventModifiers);
  }

  loopCase = loopCase ? parseInt(loopCase as string) : null;

  const loopCaseRenderedChildren: any = [];

  // Render and append element children
  for (const child of children) {
    const $child = render(instance, child);

    if (loopCase !== null) {
      loopCaseRenderedChildren.push(child);
    } else {
      if (Array.isArray($child)) {
        $child.forEach(el => {
          $el.appendChild(renderElem(instance, el) as HTMLElement);
        });
      } else {
        $el.appendChild($child);
      }
    }
  }

  if (loopCase) {
    return Array.from(new Array(loopCase), (v, i) => {
      return createEl(tagName, {
        attrs,
        boundData,
        events,
        conditionalCase,
        loopCase: null,
        children: [
          "hello" + i,
          ...loopCaseRenderedChildren
        ]
      });
    });
  }

  if (boundData && $el instanceof HTMLInputElement) {
    const {prop, opts} = boundData;

    $el.value = getProp(instance, prop);

    const {eventName, fn} = computeBinding(instance, prop, opts);
    $el.addEventListener(eventName, fn);
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
