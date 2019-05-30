// Type definitions for Polarbear
// Definitions by: Chris Windsor

export interface vNode {
  tagName: string
  attrs: { [key: string]: string }
  events: { [key: string]: string }
  conditionalCase: string
  children: vNode[]
}
