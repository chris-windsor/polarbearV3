import Polarbear from "../Polarbear";
import { keyCodes } from "../etc/KeyCodes";
import { possibleEventList } from "../etc/ElementEvents";
import { parse } from "../parser/CodeParser";

export default function computeEvent(instance: Polarbear, event: string, callbackFn: string): any {
  // Split raw event into its name and possible modifiers
  const eventComponents: string[] = event.split(".");

  const eventName: string = eventComponents[0];
  const eventModifiers: string[] = eventComponents.splice(1);

  // Check for valid event name before attempting to add it to an element
  if (!possibleEventList.includes(eventName)) {
    console.error(`Unknown event name: '${eventName}'.`);
    return;
  }

  // Get list of common keys that we want to reference by name instead of keycodes
  const commonKeyCodeNames: string[] = Object.keys(keyCodes);

  // Get the list of other event modifiers that we want to check for
  const otherEventModifiers: { [key: string]: boolean } = {
    "capture": false,
    "passive": false,
    "prevent": false,
    "once": false
  };

  // List of conditional evaluations that will be joined together to check within the event callback
  let conditionalChecks: (string | number)[] = [];

  // Iterate over event modifiers and compute their responsibility
  eventModifiers.forEach((em: string) => {
    if (Object.keys(otherEventModifiers)
              .includes(em)) {
      // Change modifier to true if it is a present modifier
      otherEventModifiers[em] = true;
    } else if (commonKeyCodeNames.includes(em)) {
      // Add the resolved key-code value to the conditional checks
      conditionalChecks.push(`$event.keyCode === ${keyCodes[em]}`);
    } else {
      // Attempt to convert the modifier to a number
      const parsedModifier: number = Number(em);
      if (!isNaN(parsedModifier)) {
        // If the modifier is a valid number, add it as a key-code conditional check
        conditionalChecks.push(`$event.keyCode === ${parsedModifier}`);
      } else {
        // If not then just add the literal key value to a key conditional check
        conditionalChecks.push(`$event.key === '${em}'`);
      }
    }
  });

  // Create a conditional string to evaluate within the function call before evaluating actual code
  const conditionalRule: string = `if (!(${conditionalChecks.join("||")})) { return; }`;

  // Parse the received code into usable code for the event listener
  const finalCode: string = parse(instance, callbackFn);

  // Return generated event
  return {
    eventName,
    fn: (e: Event) => {
      // Create strict evaluated function call
      return Function(`
      "use strict";
      const $event = arguments[0];
      ${otherEventModifiers["prevent"] ? `$event.preventDefault();` : ""}
      ${conditionalChecks.length > 0 ? conditionalRule : ""}
      ${finalCode}
      `)
        .call(instance, e);
    },
    otherEventModifiers
  };
}
