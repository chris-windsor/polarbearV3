import Polarbear from "../Polarbear";
import { setProp } from "../data/DataFns";

export default function computeBinding(instance: Polarbear, prop: string, modifiers: string[]) {
  // Decide whether to bind the value on the element's input or change event
  let eventName: string = "input";
  if (modifiers.includes("lazy")) eventName = "change";

  // Decide whether to return the element's value as a number
  let returnAsNumber: boolean = false;
  if (modifiers.includes("number")) returnAsNumber = true;

  // Decide whether to trim the element's value
  let trimReturnValue: boolean = false;
  if (modifiers.includes("trim")) trimReturnValue = true;

  // Return generated event
  return {
    eventName,
    fn: (e: Event) => {
      // Retrieve element value from event's target element
      let elementValue: any = (e.target as HTMLInputElement).value;

      // Parse value to number if the bindval has 'number' flag
      elementValue = returnAsNumber ? isNaN(parseFloat(elementValue)) ? elementValue : parseFloat(elementValue) : elementValue;

      // Trim string if the bindval has 'trim' flag
      elementValue = trimReturnValue ? elementValue.trim() : elementValue;

      // Update the property on the instance
      setProp(instance, prop, elementValue);
    }
  };
}
