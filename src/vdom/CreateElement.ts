import { vNodeOpts } from "../globals";

export default function createEl(tagName: string, {attrs = {}, events = {}, conditionalCase = "", loopCase = "", boundData = {}, refName = "", children = []}: vNodeOpts) {
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
}
