import { vNodeOpts } from "../globals";

export const createEl = (tagName: string, {attrs = {}, events = {}, conditionalCase = "", loopCase = "", boundData = {}, refName = "", children = []}: vNodeOpts) => {
  return {
    tagName,
    attrs,
    events,
    conditionalCase,
    loopCase,
    boundData,
    refName,
    children
  };
};
