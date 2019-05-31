// Type definitions for Polarbear
// Definitions by: Chris Windsor

type strObj = { [key: string]: string }

type vNodeOpts = {
  attrs: strObj
  events: strObj
  conditionalCase: string,
  boundData: { [key: string]: any }
  children: (vNode | string)[]
}

export interface vNode extends vNodeOpts {
  tagName: string
}
