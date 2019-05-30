export namespace Regexes {
  /*
   * Matches interpolation content (mustache syntax)
   *
   * Input:
   * `Some content with interpolation content... {{age + 10}}. Some other content {{favColor}}`
   *
   * Match:
   * {{age + 10}}
   */
  export const interpolation: RegExp = /({{.*?}})/;

  /*
   * Matches all mustache syntax interpolation within a string
   * rather than the first occurrence found
   *
   * Input:
   * `Team 1 score: {{score1}}. Team 2 score: {{score2}}.`
   *
   * Matches:
   * {{score1}}
   * {{score2}}
   */
  export const globalInterpolation: RegExp = /({{.*?}})/g;

  /*
   * Matches first found property or function inside interpolation matches
   *
   * Input:
   * `{{sayHello() + name}}`
   *
   * Match:
   * sayHello
   */
  export const innerInterpolation: RegExp = /[\w\.]+/;

  /*
   * Matches only functions in inside interpolation matches
   *
   * Input:
   * `{{sayHello() + name}}`
   *
   * Match:
   * sayHello()
   */
  export const innerFunctionInterpolation: RegExp = /\w+\(\)/;

  /*
   * Matches function calls inside interpolation matches
   *
   * Input:
   * `console.log(name + ' is cool. Their age is: ' + age)`
   *
   * Matches:
   * console.log
   * name
   * age
   */
  export const interpolationContent: RegExp = /[A-z]+((\.\w+)+)?(?=([^'\\]*(\\.|'([^'\\]*\\.)*[^'\\]*'))*[^']*$)/g;

  /*
   * Matches filters in interpolation matches
   *
   * Input:
   * `{{sayHello() + name | upper | reverse}}`
   *
   * Matches:
   * | upper | reverse
   */
  export const filterMatch: RegExp = /(\|)(\s+)?\w+(.*)?\b(?=([^'\\]*(\\.|'([^'\\]*\\.)*[^'\\]*'))*[^']*$)/;
  export const filter2Match: RegExp = /(\|)(\s+)?\w+(\.\w+)?(.*)?\b(?=([^'\\]*(\\.|'([^'\\]*\\.)*[^'\\]*'))*[^']*$)/;
  export const filterNames: RegExp = /\w+(\.\w+)?/g;

  // export const funcParseReg: RegExp = /([$\w.]+?(?=\())(?=([^'\\]*(\\.|'([^'\\]*\\.)*[^'\\]*'))*[^']*$)/g;
  // export const propParseReg: RegExp = /\w+(?=([^'\\]*(\\.|'([^'\\]*\\.)*[^'\\]*'))*[^']*$)/g;
}