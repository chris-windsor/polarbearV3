/*
 * Code adapted from: https://github.com/ycmjason-talks/2018-11-21-manc-web-meetup-4
 * */

import Polarbear from "../Polarbear";
import { vNode } from "../globals";
import { render, renderElem } from "./Render";
import createEl from "./CreateElement";

const zip = (xs: (vNode | string)[], ys: ((vNode | string)[] | NodeListOf<ChildNode>)) => {
  const zipped = [];
  for (let i = 0; i < Math.max(xs.length, ys.length); i++) {
    zipped.push([xs[i], ys[i]]);
  }
  return zipped;
};

const diffAttrs = (oldAttrs: {}, newAttrs: {}) => {
  const patches: any[] = [];

  const attrs = Object.assign(oldAttrs, newAttrs);

  // set new attributes
  for (const [k, v] of Object.entries(attrs)) {
    patches.push(($node: HTMLElement) => {
      $node.setAttribute(k, (v as any));
      return $node;
    });
  }

  return ($node: HTMLElement) => {
    for (const patch of patches) {
      patch($node);
    }
  };
};

const diffChildren = (instance: Polarbear, oldVChildren: (vNode | string)[], newVChildren: (vNode | string)[]) => {
  const childPatches: any[] = [];
  oldVChildren.forEach((oldVChild: (vNode | string), i: number) => {
    childPatches.push(diff(instance, oldVChild, newVChildren[i]));
  });

  const additionalPatches: any[] = [];
  for (const additionalVChild of newVChildren.slice(oldVChildren.length)) {
    additionalPatches.push(($node: HTMLElement) => {
      $node.appendChild(render(instance, additionalVChild));
      return $node;
    });
  }

  return ($parent: HTMLElement) => {
    for (const [patch, child] of zip(childPatches, $parent.childNodes)) {
      if (patch !== undefined && child !== undefined) {
        (patch as any)(child);
      }
    }

    for (const patch of additionalPatches) {
      patch($parent);
    }

    return $parent;
  };
};

export default function diff(instance: Polarbear, vOldNode: (vNode | string), vNewNode: (vNode | string)) {
  if (vNewNode === undefined) {
    return ($node: HTMLElement): undefined => {
      $node.remove();
      return undefined;
    };
  }

  if (typeof vOldNode === "string" ||
    typeof vNewNode === "string") {
    if (vOldNode !== vNewNode) {
      return ($node: HTMLElement) => {
        const $newNode = render(instance, vNewNode);
        $node.replaceWith($newNode);
        return $newNode;
      };
    } else {
      return ($node: HTMLElement): undefined => undefined;
    }
  }

  if (vOldNode.tagName !== vNewNode.tagName) {
    return ($node: HTMLElement) => {
      const $newNode = render(instance, vNewNode);
      $node.replaceWith($newNode);
      return $newNode;
    };
  }

  if (vNewNode.conditionalCase !== "") {
    return ($node: HTMLElement) => {
      const $newNode = render(instance, vNewNode);
      if ($node.nodeType !== $newNode.nodeType) {
        $node.replaceWith($newNode);
        return $newNode;
      }
    };
  }

  if (vNewNode.loopCase !== vOldNode.loopCase) {
    const $newNode = renderElem(instance, createEl(vNewNode.tagName, {
      loopCase: undefined,
      children: render(instance, vNewNode)
    }));
    return ($node: HTMLElement) => {
      $node.replaceWith($newNode);
      return $newNode;
    };
  }

  const patchAttrs = diffAttrs(vOldNode.attrs, vNewNode.attrs);
  const patchChildren = diffChildren(instance, vOldNode.children, vNewNode.children);

  return ($node: HTMLElement) => {
    if ($node.nodeType === 1) {
      patchAttrs($node);
      patchChildren($node);
    }
    return $node;
  };
};
