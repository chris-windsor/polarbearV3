import Polarbear from "../Polarbear";
import { getProp, setProp } from "./DataFns";

export default function observe(instance: Polarbear, obj: { [key: string]: any }, parent?: string): void {
  for (const prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      // Remap property path if it is a nested property
      const propPath = parent ? `${parent}.${prop}` : prop;

      // Retrieve property value from its original object
      const propertyVal = getProp(obj, prop);

      // Get the literal type of the retrieved property
      const valueType = propertyVal.constructor;

      if (valueType === Object) {
        // Set property to be empty object since its children will need to be separately observed
        setProp(instance.$data, propPath, {});
        setProp(instance, propPath, {});

        // Observe child properties of object
        observe(instance, propertyVal, propPath);
      } else if (valueType === Array) {
        // Store reference array in instance data property
        setProp(instance.$data, propPath, propertyVal);

        // TODO: implement watcher update for arrays
        const arrProxy = new Proxy(getProp(instance.$data, propPath), {
          // Proxy trap for value deletion
          deleteProperty(target: any, property: any): boolean {
            console.log(`deleting ${String(property)} from ${target}`);
            instance.render();
            return true;
          },
          // Proxy trap for updating or adding values
          set(target: any, property: any, value: any): boolean {
            target[property] = value;
            console.log(`${target} ${value} ${String(property)}`);
            instance.render();
            return true;
          }
        });

        // Set array proxy to actual root property so that proxy traps are triggered on property reference
        setProp(instance, propPath, arrProxy);
      } else {
        // Store reference property on instance data property
        setProp(instance.$data, propPath, propertyVal);

        // Set property on root of instance or on child object of instance root
        const definitionLocation = parent ? getProp(instance, parent) : instance;

        // Define property getters and setters on instance
        Object.defineProperty(definitionLocation, prop, {
          get(): any {
            // Retrieve value from alternative reference so that there is not an infinite loop
            return getProp(instance.$data, propPath);
          },
          set(v: any): void {
            // Get the property's previous value before reassigning it
            const oldVal = getProp(instance.$data, propPath);
            // Set alternative reference so that there is not an infinite loop
            setProp(instance.$data, propPath, v);
            // Now that the value has been updated we want to call the watcher if it exists
            if (instance.$watchers[propPath]) {
              // Pass through the instance reference and the property's old value and new value
              instance.$watchers[propPath].apply(instance, [oldVal, v]);
            }
            instance.render();
          }
        });
      }
    }
  }
};
