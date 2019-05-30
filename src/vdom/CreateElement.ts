type vNodeOpts = {
  attrs: { [key: string]: string }
  events: { [key: string]: string }
  conditionalCase: string
  children: {}[]
}

export const createEl = (tagName: string, {attrs = {}, events = {}, conditionalCase = "", children = []}: vNodeOpts) => {
  return {
    tagName,
    attrs,
    events,
    conditionalCase,
    children
  };
};
