// Type definitions for Polarbear
// Definitions by: Chris Windsor

type strObj = { [key: string]: string }

type vNodeOpts = {
  attrs: strObj
  events: strObj
  conditionalCase: string
  loopCase: string | number
  boundData: { [key: string]: any }
  refName: string
  children: (vNode | string)[]
}

export interface vNode extends vNodeOpts {
  tagName: string
}
