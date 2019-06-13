import traverse from "./dom/Traverse";
import observe from "./data/Observe";
import { possibleEventList } from "./etc/ElementEvents";
import { renderElem } from "./vdom/Render";
import diff from "./vdom/Diff";
import hydrate from "./vdom/Hydrate";

type funcProp = { [key: string]: Function };

interface PolarbearParams {
  created?: Function; // Instance created lifecycle hook
  data?: { [key: string]: any }; // Instance data properties
  el?: string; // App container element selector
  events?: funcProp; // Global document events
  filters?: funcProp; // Content interpolation filters
  methods?: funcProp; // Instance methods
  mounted?: Function; // Instance mounted lifecycle hook
  watch?: funcProp; // Property watchers
}

export default class Polarbear {
  // Root app container selector
  $appContainerSel: string;

  // Root app container element
  $appContainerEl: HTMLElement;

  // Virtual dom
  $masterVDom: any;
  $currentVDom: any;

  // References to document elements that are used for edge cases
  $refs: { [key: string]: Element } = {};

  // Filter functions for use with interpolation elements
  $filters: funcProp = {};

  // Data properties for instance
  $data: { [key: string]: any } = {};

  // Property watchers for calling functions on property changes
  $watchers: { [key: string]: Function } = {};

  // Allows for other instance properties to be created
  [key: string]: any;

  // TODO: remove
  $initial: boolean = true;

  $appEl: HTMLElement;

  constructor(params: PolarbearParams) {
    // Call created method if it exists
    // Instance has just been created. Nothing else has happened yet
    if (params.created) params.created();

    // Get app container selector so that it may be continuous referenced for mounting
    this.$appContainerSel = params.el;

    // Grab root app element
    this.$appContainerEl = document.querySelector(this.$appContainerSel);

    // Traverse app DOM and copy into VDOM
    this.$masterVDom = traverse(this.$appContainerEl);
    this.$currentVDom = {};

    // Create observables for all of the data attributes
    observe(this, params.data);

    // Migrate methods to root level of instance so that they may be easily used
    if (params.methods) {
      for (const method in params.methods) {
        if (params.methods.hasOwnProperty(method)) {
          // Remap created methods to root level
          this[method] = params.methods[method];
        }
      }
    }

    // Initialize all document level events if they exist
    if (params.events) {
      for (const event in params.events) {
        if (params.events.hasOwnProperty(event) && possibleEventList.includes(event)) {
          // Add document level event callbacks for chosen events
          // TODO: probably change this to be on the app container rather than document
          document.addEventListener(event, (e: Event) => params.events[event](e));
        }
      }
    }

    // Copy over filter functions into instance
    if (params.filters) {
      for (const filter in params.filters) {
        if (params.filters.hasOwnProperty(filter)) {
          // Copy filter to the instance
          this.$filters[filter] = params.filters[filter];
        }
      }
    }


    // Perform initial render
    this.render();

    // Initialize property watchers
    if (params.watch) {
      for (const prop in params.watch) {
        if (params.watch.hasOwnProperty(prop)) {
          // Copy the watcher's callback function to the instance
          this.$watchers[prop] = params.watch[prop];
        }
      }
    }

    // Call mounted method if it exists
    // Instance has finished generation
    if (params.mounted) params.mounted.call(this);
  }

  render() {
    const r1 = performance.now();
    if (this.$initial) {
      this.$currentVDom = hydrate(this, this.$masterVDom);

      this.$appEl = mount(renderElem(this, this.$currentVDom), this.$appContainerEl);

      this.$initial = false;
    } else {
      const temp = hydrate(this, this.$masterVDom);

      const patch = diff(this, this.$currentVDom, temp);

      this.$appEl = patch(this.$appEl);

      this.$currentVDom = temp;
    }

    const r2 = performance.now();
    console.log(`Render took ${(r2 - r1).toFixed(1)}ms`);
  }
}

function mount($node: HTMLElement, $target: HTMLElement) {
  $target.replaceWith($node);
  return $node;
}

(window as any).Polarbear = Polarbear;
