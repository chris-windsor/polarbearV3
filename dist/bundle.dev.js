(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports = function (it) {
  if (typeof it != 'function') {
    throw TypeError(String(it) + ' is not a function');
  } return it;
};

},{}],2:[function(require,module,exports){
var wellKnownSymbol = require('../internals/well-known-symbol');
var create = require('../internals/object-create');
var hide = require('../internals/hide');

var UNSCOPABLES = wellKnownSymbol('unscopables');
var ArrayPrototype = Array.prototype;

// Array.prototype[@@unscopables]
// https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables
if (ArrayPrototype[UNSCOPABLES] == undefined) {
  hide(ArrayPrototype, UNSCOPABLES, create(null));
}

// add a key to Array.prototype[@@unscopables]
module.exports = function (key) {
  ArrayPrototype[UNSCOPABLES][key] = true;
};

},{"../internals/hide":36,"../internals/object-create":53,"../internals/well-known-symbol":89}],3:[function(require,module,exports){
'use strict';
var codePointAt = require('../internals/string-at');

// `AdvanceStringIndex` abstract operation
// https://tc39.github.io/ecma262/#sec-advancestringindex
module.exports = function (S, index, unicode) {
  return index + (unicode ? codePointAt(S, index, true).length : 1);
};

},{"../internals/string-at":78}],4:[function(require,module,exports){
var isObject = require('../internals/is-object');

module.exports = function (it) {
  if (!isObject(it)) {
    throw TypeError(String(it) + ' is not an object');
  } return it;
};

},{"../internals/is-object":45}],5:[function(require,module,exports){
'use strict';
var arrayMethods = require('../internals/array-methods');
var sloppyArrayMethod = require('../internals/sloppy-array-method');

var internalForEach = arrayMethods(0);
var SLOPPY_METHOD = sloppyArrayMethod('forEach');

// `Array.prototype.forEach` method implementation
// https://tc39.github.io/ecma262/#sec-array.prototype.foreach
module.exports = SLOPPY_METHOD ? function forEach(callbackfn /* , thisArg */) {
  return internalForEach(this, callbackfn, arguments[1]);
} : [].forEach;

},{"../internals/array-methods":9,"../internals/sloppy-array-method":76}],6:[function(require,module,exports){
'use strict';
var bind = require('../internals/bind-context');
var toObject = require('../internals/to-object');
var callWithSafeIterationClosing = require('../internals/call-with-safe-iteration-closing');
var isArrayIteratorMethod = require('../internals/is-array-iterator-method');
var toLength = require('../internals/to-length');
var createProperty = require('../internals/create-property');
var getIteratorMethod = require('../internals/get-iterator-method');

// `Array.from` method
// https://tc39.github.io/ecma262/#sec-array.from
module.exports = function from(arrayLike /* , mapfn = undefined, thisArg = undefined */) {
  var O = toObject(arrayLike);
  var C = typeof this == 'function' ? this : Array;
  var argumentsLength = arguments.length;
  var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
  var mapping = mapfn !== undefined;
  var index = 0;
  var iteratorMethod = getIteratorMethod(O);
  var length, result, step, iterator;
  if (mapping) mapfn = bind(mapfn, argumentsLength > 2 ? arguments[2] : undefined, 2);
  // if the target is not iterable or it's an array with the default iterator - use a simple case
  if (iteratorMethod != undefined && !(C == Array && isArrayIteratorMethod(iteratorMethod))) {
    iterator = iteratorMethod.call(O);
    result = new C();
    for (;!(step = iterator.next()).done; index++) {
      createProperty(result, index, mapping
        ? callWithSafeIterationClosing(iterator, mapfn, [step.value, index], true)
        : step.value
      );
    }
  } else {
    length = toLength(O.length);
    result = new C(length);
    for (;length > index; index++) {
      createProperty(result, index, mapping ? mapfn(O[index], index) : O[index]);
    }
  }
  result.length = index;
  return result;
};

},{"../internals/bind-context":11,"../internals/call-with-safe-iteration-closing":12,"../internals/create-property":21,"../internals/get-iterator-method":32,"../internals/is-array-iterator-method":42,"../internals/to-length":83,"../internals/to-object":84}],7:[function(require,module,exports){
var toIndexedObject = require('../internals/to-indexed-object');
var toLength = require('../internals/to-length');
var toAbsoluteIndex = require('../internals/to-absolute-index');

// `Array.prototype.{ indexOf, includes }` methods implementation
// false -> Array#indexOf
// https://tc39.github.io/ecma262/#sec-array.prototype.indexof
// true  -> Array#includes
// https://tc39.github.io/ecma262/#sec-array.prototype.includes
module.exports = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIndexedObject($this);
    var length = toLength(O.length);
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare
      if (value != value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
      if (O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};

},{"../internals/to-absolute-index":80,"../internals/to-indexed-object":81,"../internals/to-length":83}],8:[function(require,module,exports){
var fails = require('../internals/fails');
var wellKnownSymbol = require('../internals/well-known-symbol');

var SPECIES = wellKnownSymbol('species');

module.exports = function (METHOD_NAME) {
  return !fails(function () {
    var array = [];
    var constructor = array.constructor = {};
    constructor[SPECIES] = function () {
      return { foo: 1 };
    };
    return array[METHOD_NAME](Boolean).foo !== 1;
  });
};

},{"../internals/fails":28,"../internals/well-known-symbol":89}],9:[function(require,module,exports){
var bind = require('../internals/bind-context');
var IndexedObject = require('../internals/indexed-object');
var toObject = require('../internals/to-object');
var toLength = require('../internals/to-length');
var arraySpeciesCreate = require('../internals/array-species-create');

// `Array.prototype.{ forEach, map, filter, some, every, find, findIndex }` methods implementation
// 0 -> Array#forEach
// https://tc39.github.io/ecma262/#sec-array.prototype.foreach
// 1 -> Array#map
// https://tc39.github.io/ecma262/#sec-array.prototype.map
// 2 -> Array#filter
// https://tc39.github.io/ecma262/#sec-array.prototype.filter
// 3 -> Array#some
// https://tc39.github.io/ecma262/#sec-array.prototype.some
// 4 -> Array#every
// https://tc39.github.io/ecma262/#sec-array.prototype.every
// 5 -> Array#find
// https://tc39.github.io/ecma262/#sec-array.prototype.find
// 6 -> Array#findIndex
// https://tc39.github.io/ecma262/#sec-array.prototype.findIndex
module.exports = function (TYPE, specificCreate) {
  var IS_MAP = TYPE == 1;
  var IS_FILTER = TYPE == 2;
  var IS_SOME = TYPE == 3;
  var IS_EVERY = TYPE == 4;
  var IS_FIND_INDEX = TYPE == 6;
  var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
  var create = specificCreate || arraySpeciesCreate;
  return function ($this, callbackfn, that) {
    var O = toObject($this);
    var self = IndexedObject(O);
    var boundFunction = bind(callbackfn, that, 3);
    var length = toLength(self.length);
    var index = 0;
    var target = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined;
    var value, result;
    for (;length > index; index++) if (NO_HOLES || index in self) {
      value = self[index];
      result = boundFunction(value, index, O);
      if (TYPE) {
        if (IS_MAP) target[index] = result; // map
        else if (result) switch (TYPE) {
          case 3: return true;              // some
          case 5: return value;             // find
          case 6: return index;             // findIndex
          case 2: target.push(value);       // filter
        } else if (IS_EVERY) return false;  // every
      }
    }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : target;
  };
};

},{"../internals/array-species-create":10,"../internals/bind-context":11,"../internals/indexed-object":39,"../internals/to-length":83,"../internals/to-object":84}],10:[function(require,module,exports){
var isObject = require('../internals/is-object');
var isArray = require('../internals/is-array');
var wellKnownSymbol = require('../internals/well-known-symbol');

var SPECIES = wellKnownSymbol('species');

// `ArraySpeciesCreate` abstract operation
// https://tc39.github.io/ecma262/#sec-arrayspeciescreate
module.exports = function (originalArray, length) {
  var C;
  if (isArray(originalArray)) {
    C = originalArray.constructor;
    // cross-realm fallback
    if (typeof C == 'function' && (C === Array || isArray(C.prototype))) C = undefined;
    else if (isObject(C)) {
      C = C[SPECIES];
      if (C === null) C = undefined;
    }
  } return new (C === undefined ? Array : C)(length === 0 ? 0 : length);
};

},{"../internals/is-array":43,"../internals/is-object":45,"../internals/well-known-symbol":89}],11:[function(require,module,exports){
var aFunction = require('../internals/a-function');

// optional / simple context binding
module.exports = function (fn, that, length) {
  aFunction(fn);
  if (that === undefined) return fn;
  switch (length) {
    case 0: return function () {
      return fn.call(that);
    };
    case 1: return function (a) {
      return fn.call(that, a);
    };
    case 2: return function (a, b) {
      return fn.call(that, a, b);
    };
    case 3: return function (a, b, c) {
      return fn.call(that, a, b, c);
    };
  }
  return function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};

},{"../internals/a-function":1}],12:[function(require,module,exports){
var anObject = require('../internals/an-object');

// call something on iterator step with safe closing on error
module.exports = function (iterator, fn, value, ENTRIES) {
  try {
    return ENTRIES ? fn(anObject(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch (error) {
    var returnMethod = iterator['return'];
    if (returnMethod !== undefined) anObject(returnMethod.call(iterator));
    throw error;
  }
};

},{"../internals/an-object":4}],13:[function(require,module,exports){
var wellKnownSymbol = require('../internals/well-known-symbol');

var ITERATOR = wellKnownSymbol('iterator');
var SAFE_CLOSING = false;

try {
  var called = 0;
  var iteratorWithReturn = {
    next: function () {
      return { done: !!called++ };
    },
    'return': function () {
      SAFE_CLOSING = true;
    }
  };
  iteratorWithReturn[ITERATOR] = function () {
    return this;
  };
  // eslint-disable-next-line no-throw-literal
  Array.from(iteratorWithReturn, function () { throw 2; });
} catch (error) { /* empty */ }

module.exports = function (exec, SKIP_CLOSING) {
  if (!SKIP_CLOSING && !SAFE_CLOSING) return false;
  var ITERATION_SUPPORT = false;
  try {
    var object = {};
    object[ITERATOR] = function () {
      return {
        next: function () {
          return { done: ITERATION_SUPPORT = true };
        }
      };
    };
    exec(object);
  } catch (error) { /* empty */ }
  return ITERATION_SUPPORT;
};

},{"../internals/well-known-symbol":89}],14:[function(require,module,exports){
var toString = {}.toString;

module.exports = function (it) {
  return toString.call(it).slice(8, -1);
};

},{}],15:[function(require,module,exports){
var classofRaw = require('../internals/classof-raw');
var wellKnownSymbol = require('../internals/well-known-symbol');

var TO_STRING_TAG = wellKnownSymbol('toStringTag');
// ES3 wrong here
var CORRECT_ARGUMENTS = classofRaw(function () { return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (error) { /* empty */ }
};

// getting tag from ES6+ `Object.prototype.toString`
module.exports = function (it) {
  var O, tag, result;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (tag = tryGet(O = Object(it), TO_STRING_TAG)) == 'string' ? tag
    // builtinTag case
    : CORRECT_ARGUMENTS ? classofRaw(O)
    // ES3 arguments fallback
    : (result = classofRaw(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : result;
};

},{"../internals/classof-raw":14,"../internals/well-known-symbol":89}],16:[function(require,module,exports){
var has = require('../internals/has');
var ownKeys = require('../internals/own-keys');
var getOwnPropertyDescriptorModule = require('../internals/object-get-own-property-descriptor');
var definePropertyModule = require('../internals/object-define-property');

module.exports = function (target, source) {
  var keys = ownKeys(source);
  var defineProperty = definePropertyModule.f;
  var getOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (!has(target, key)) defineProperty(target, key, getOwnPropertyDescriptor(source, key));
  }
};

},{"../internals/has":34,"../internals/object-define-property":55,"../internals/object-get-own-property-descriptor":56,"../internals/own-keys":66}],17:[function(require,module,exports){
var wellKnownSymbol = require('../internals/well-known-symbol');

var MATCH = wellKnownSymbol('match');

module.exports = function (METHOD_NAME) {
  var regexp = /./;
  try {
    '/./'[METHOD_NAME](regexp);
  } catch (e) {
    try {
      regexp[MATCH] = false;
      return '/./'[METHOD_NAME](regexp);
    } catch (f) { /* empty */ }
  } return false;
};

},{"../internals/well-known-symbol":89}],18:[function(require,module,exports){
var fails = require('../internals/fails');

module.exports = !fails(function () {
  function F() { /* empty */ }
  F.prototype.constructor = null;
  return Object.getPrototypeOf(new F()) !== F.prototype;
});

},{"../internals/fails":28}],19:[function(require,module,exports){
'use strict';
var IteratorPrototype = require('../internals/iterators-core').IteratorPrototype;
var create = require('../internals/object-create');
var createPropertyDescriptor = require('../internals/create-property-descriptor');
var setToStringTag = require('../internals/set-to-string-tag');
var Iterators = require('../internals/iterators');

var returnThis = function () { return this; };

module.exports = function (IteratorConstructor, NAME, next) {
  var TO_STRING_TAG = NAME + ' Iterator';
  IteratorConstructor.prototype = create(IteratorPrototype, { next: createPropertyDescriptor(1, next) });
  setToStringTag(IteratorConstructor, TO_STRING_TAG, false, true);
  Iterators[TO_STRING_TAG] = returnThis;
  return IteratorConstructor;
};

},{"../internals/create-property-descriptor":20,"../internals/iterators":49,"../internals/iterators-core":48,"../internals/object-create":53,"../internals/set-to-string-tag":73}],20:[function(require,module,exports){
module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};

},{}],21:[function(require,module,exports){
'use strict';
var toPrimitive = require('../internals/to-primitive');
var definePropertyModule = require('../internals/object-define-property');
var createPropertyDescriptor = require('../internals/create-property-descriptor');

module.exports = function (object, key, value) {
  var propertyKey = toPrimitive(key);
  if (propertyKey in object) definePropertyModule.f(object, propertyKey, createPropertyDescriptor(0, value));
  else object[propertyKey] = value;
};

},{"../internals/create-property-descriptor":20,"../internals/object-define-property":55,"../internals/to-primitive":85}],22:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var createIteratorConstructor = require('../internals/create-iterator-constructor');
var getPrototypeOf = require('../internals/object-get-prototype-of');
var setPrototypeOf = require('../internals/object-set-prototype-of');
var setToStringTag = require('../internals/set-to-string-tag');
var hide = require('../internals/hide');
var redefine = require('../internals/redefine');
var wellKnownSymbol = require('../internals/well-known-symbol');
var IS_PURE = require('../internals/is-pure');
var Iterators = require('../internals/iterators');
var IteratorsCore = require('../internals/iterators-core');

var IteratorPrototype = IteratorsCore.IteratorPrototype;
var BUGGY_SAFARI_ITERATORS = IteratorsCore.BUGGY_SAFARI_ITERATORS;
var ITERATOR = wellKnownSymbol('iterator');
var KEYS = 'keys';
var VALUES = 'values';
var ENTRIES = 'entries';

var returnThis = function () { return this; };

module.exports = function (Iterable, NAME, IteratorConstructor, next, DEFAULT, IS_SET, FORCED) {
  createIteratorConstructor(IteratorConstructor, NAME, next);

  var getIterationMethod = function (KIND) {
    if (KIND === DEFAULT && defaultIterator) return defaultIterator;
    if (!BUGGY_SAFARI_ITERATORS && KIND in IterablePrototype) return IterablePrototype[KIND];
    switch (KIND) {
      case KEYS: return function keys() { return new IteratorConstructor(this, KIND); };
      case VALUES: return function values() { return new IteratorConstructor(this, KIND); };
      case ENTRIES: return function entries() { return new IteratorConstructor(this, KIND); };
    } return function () { return new IteratorConstructor(this); };
  };

  var TO_STRING_TAG = NAME + ' Iterator';
  var INCORRECT_VALUES_NAME = false;
  var IterablePrototype = Iterable.prototype;
  var nativeIterator = IterablePrototype[ITERATOR]
    || IterablePrototype['@@iterator']
    || DEFAULT && IterablePrototype[DEFAULT];
  var defaultIterator = !BUGGY_SAFARI_ITERATORS && nativeIterator || getIterationMethod(DEFAULT);
  var anyNativeIterator = NAME == 'Array' ? IterablePrototype.entries || nativeIterator : nativeIterator;
  var CurrentIteratorPrototype, methods, KEY;

  // fix native
  if (anyNativeIterator) {
    CurrentIteratorPrototype = getPrototypeOf(anyNativeIterator.call(new Iterable()));
    if (IteratorPrototype !== Object.prototype && CurrentIteratorPrototype.next) {
      if (!IS_PURE && getPrototypeOf(CurrentIteratorPrototype) !== IteratorPrototype) {
        if (setPrototypeOf) {
          setPrototypeOf(CurrentIteratorPrototype, IteratorPrototype);
        } else if (typeof CurrentIteratorPrototype[ITERATOR] != 'function') {
          hide(CurrentIteratorPrototype, ITERATOR, returnThis);
        }
      }
      // Set @@toStringTag to native iterators
      setToStringTag(CurrentIteratorPrototype, TO_STRING_TAG, true, true);
      if (IS_PURE) Iterators[TO_STRING_TAG] = returnThis;
    }
  }

  // fix Array#{values, @@iterator}.name in V8 / FF
  if (DEFAULT == VALUES && nativeIterator && nativeIterator.name !== VALUES) {
    INCORRECT_VALUES_NAME = true;
    defaultIterator = function values() { return nativeIterator.call(this); };
  }

  // define iterator
  if ((!IS_PURE || FORCED) && IterablePrototype[ITERATOR] !== defaultIterator) {
    hide(IterablePrototype, ITERATOR, defaultIterator);
  }
  Iterators[NAME] = defaultIterator;

  // export additional methods
  if (DEFAULT) {
    methods = {
      values: getIterationMethod(VALUES),
      keys: IS_SET ? defaultIterator : getIterationMethod(KEYS),
      entries: getIterationMethod(ENTRIES)
    };
    if (FORCED) for (KEY in methods) {
      if (BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME || !(KEY in IterablePrototype)) {
        redefine(IterablePrototype, KEY, methods[KEY]);
      }
    } else $({ target: NAME, proto: true, forced: BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME }, methods);
  }

  return methods;
};

},{"../internals/create-iterator-constructor":19,"../internals/export":27,"../internals/hide":36,"../internals/is-pure":46,"../internals/iterators":49,"../internals/iterators-core":48,"../internals/object-get-prototype-of":59,"../internals/object-set-prototype-of":63,"../internals/redefine":67,"../internals/set-to-string-tag":73,"../internals/well-known-symbol":89}],23:[function(require,module,exports){
var fails = require('../internals/fails');

// Thank's IE8 for his funny defineProperty
module.exports = !fails(function () {
  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
});

},{"../internals/fails":28}],24:[function(require,module,exports){
var global = require('../internals/global');
var isObject = require('../internals/is-object');

var document = global.document;
// typeof document.createElement is 'object' in old IE
var exist = isObject(document) && isObject(document.createElement);

module.exports = function (it) {
  return exist ? document.createElement(it) : {};
};

},{"../internals/global":33,"../internals/is-object":45}],25:[function(require,module,exports){
// iterable DOM collections
// flag - `iterable` interface - 'entries', 'keys', 'values', 'forEach' methods
module.exports = {
  CSSRuleList: 0,
  CSSStyleDeclaration: 0,
  CSSValueList: 0,
  ClientRectList: 0,
  DOMRectList: 0,
  DOMStringList: 0,
  DOMTokenList: 1,
  DataTransferItemList: 0,
  FileList: 0,
  HTMLAllCollection: 0,
  HTMLCollection: 0,
  HTMLFormElement: 0,
  HTMLSelectElement: 0,
  MediaList: 0,
  MimeTypeArray: 0,
  NamedNodeMap: 0,
  NodeList: 1,
  PaintRequestList: 0,
  Plugin: 0,
  PluginArray: 0,
  SVGLengthList: 0,
  SVGNumberList: 0,
  SVGPathSegList: 0,
  SVGPointList: 0,
  SVGStringList: 0,
  SVGTransformList: 0,
  SourceBufferList: 0,
  StyleSheetList: 0,
  TextTrackCueList: 0,
  TextTrackList: 0,
  TouchList: 0
};

},{}],26:[function(require,module,exports){
// IE8- don't enum bug keys
module.exports = [
  'constructor',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toLocaleString',
  'toString',
  'valueOf'
];

},{}],27:[function(require,module,exports){
var global = require('../internals/global');
var getOwnPropertyDescriptor = require('../internals/object-get-own-property-descriptor').f;
var hide = require('../internals/hide');
var redefine = require('../internals/redefine');
var setGlobal = require('../internals/set-global');
var copyConstructorProperties = require('../internals/copy-constructor-properties');
var isForced = require('../internals/is-forced');

/*
  options.target      - name of the target object
  options.global      - target is the global object
  options.stat        - export as static methods of target
  options.proto       - export as prototype methods of target
  options.real        - real prototype method for the `pure` version
  options.forced      - export even if the native feature is available
  options.bind        - bind methods to the target, required for the `pure` version
  options.wrap        - wrap constructors to preventing global pollution, required for the `pure` version
  options.unsafe      - use the simple assignment of property instead of delete + defineProperty
  options.sham        - add a flag to not completely full polyfills
  options.enumerable  - export as enumerable property
  options.noTargetGet - prevent calling a getter on target
*/
module.exports = function (options, source) {
  var TARGET = options.target;
  var GLOBAL = options.global;
  var STATIC = options.stat;
  var FORCED, target, key, targetProperty, sourceProperty, descriptor;
  if (GLOBAL) {
    target = global;
  } else if (STATIC) {
    target = global[TARGET] || setGlobal(TARGET, {});
  } else {
    target = (global[TARGET] || {}).prototype;
  }
  if (target) for (key in source) {
    sourceProperty = source[key];
    if (options.noTargetGet) {
      descriptor = getOwnPropertyDescriptor(target, key);
      targetProperty = descriptor && descriptor.value;
    } else targetProperty = target[key];
    FORCED = isForced(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced);
    // contained in target
    if (!FORCED && targetProperty !== undefined) {
      if (typeof sourceProperty === typeof targetProperty) continue;
      copyConstructorProperties(sourceProperty, targetProperty);
    }
    // add a flag to not completely full polyfills
    if (options.sham || (targetProperty && targetProperty.sham)) {
      hide(sourceProperty, 'sham', true);
    }
    // extend global
    redefine(target, key, sourceProperty, options);
  }
};

},{"../internals/copy-constructor-properties":16,"../internals/global":33,"../internals/hide":36,"../internals/is-forced":44,"../internals/object-get-own-property-descriptor":56,"../internals/redefine":67,"../internals/set-global":72}],28:[function(require,module,exports){
module.exports = function (exec) {
  try {
    return !!exec();
  } catch (error) {
    return true;
  }
};

},{}],29:[function(require,module,exports){
'use strict';
var hide = require('../internals/hide');
var redefine = require('../internals/redefine');
var fails = require('../internals/fails');
var wellKnownSymbol = require('../internals/well-known-symbol');
var regexpExec = require('../internals/regexp-exec');

var SPECIES = wellKnownSymbol('species');

var REPLACE_SUPPORTS_NAMED_GROUPS = !fails(function () {
  // #replace needs built-in support for named groups.
  // #match works fine because it just return the exec results, even if it has
  // a "grops" property.
  var re = /./;
  re.exec = function () {
    var result = [];
    result.groups = { a: '7' };
    return result;
  };
  return ''.replace(re, '$<a>') !== '7';
});

// Chrome 51 has a buggy "split" implementation when RegExp#exec !== nativeExec
// Weex JS has frozen built-in prototypes, so use try / catch wrapper
var SPLIT_WORKS_WITH_OVERWRITTEN_EXEC = !fails(function () {
  var re = /(?:)/;
  var originalExec = re.exec;
  re.exec = function () { return originalExec.apply(this, arguments); };
  var result = 'ab'.split(re);
  return result.length !== 2 || result[0] !== 'a' || result[1] !== 'b';
});

module.exports = function (KEY, length, exec, sham) {
  var SYMBOL = wellKnownSymbol(KEY);

  var DELEGATES_TO_SYMBOL = !fails(function () {
    // String methods call symbol-named RegEp methods
    var O = {};
    O[SYMBOL] = function () { return 7; };
    return ''[KEY](O) != 7;
  });

  var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL && !fails(function () {
    // Symbol-named RegExp methods call .exec
    var execCalled = false;
    var re = /a/;
    re.exec = function () { execCalled = true; return null; };

    if (KEY === 'split') {
      // RegExp[@@split] doesn't call the regex's exec method, but first creates
      // a new one. We need to return the patched regex when creating the new one.
      re.constructor = {};
      re.constructor[SPECIES] = function () { return re; };
    }

    re[SYMBOL]('');
    return !execCalled;
  });

  if (
    !DELEGATES_TO_SYMBOL ||
    !DELEGATES_TO_EXEC ||
    (KEY === 'replace' && !REPLACE_SUPPORTS_NAMED_GROUPS) ||
    (KEY === 'split' && !SPLIT_WORKS_WITH_OVERWRITTEN_EXEC)
  ) {
    var nativeRegExpMethod = /./[SYMBOL];
    var methods = exec(SYMBOL, ''[KEY], function (nativeMethod, regexp, str, arg2, forceStringMethod) {
      if (regexp.exec === regexpExec) {
        if (DELEGATES_TO_SYMBOL && !forceStringMethod) {
          // The native String method already delegates to @@method (this
          // polyfilled function), leasing to infinite recursion.
          // We avoid it by directly calling the native @@method method.
          return { done: true, value: nativeRegExpMethod.call(regexp, str, arg2) };
        }
        return { done: true, value: nativeMethod.call(str, regexp, arg2) };
      }
      return { done: false };
    });
    var stringMethod = methods[0];
    var regexMethod = methods[1];

    redefine(String.prototype, KEY, stringMethod);
    redefine(RegExp.prototype, SYMBOL, length == 2
      // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
      // 21.2.5.11 RegExp.prototype[@@split](string, limit)
      ? function (string, arg) { return regexMethod.call(string, this, arg); }
      // 21.2.5.6 RegExp.prototype[@@match](string)
      // 21.2.5.9 RegExp.prototype[@@search](string)
      : function (string) { return regexMethod.call(string, this); }
    );
    if (sham) hide(RegExp.prototype[SYMBOL], 'sham', true);
  }
};

},{"../internals/fails":28,"../internals/hide":36,"../internals/redefine":67,"../internals/regexp-exec":69,"../internals/well-known-symbol":89}],30:[function(require,module,exports){
var fails = require('../internals/fails');
var whitespaces = require('../internals/whitespaces');

var non = '\u200B\u0085\u180E';

// check that a method works with the correct list
// of whitespaces and has a correct name
module.exports = function (METHOD_NAME) {
  return fails(function () {
    return !!whitespaces[METHOD_NAME]() || non[METHOD_NAME]() != non || whitespaces[METHOD_NAME].name !== METHOD_NAME;
  });
};

},{"../internals/fails":28,"../internals/whitespaces":90}],31:[function(require,module,exports){
var shared = require('../internals/shared');

module.exports = shared('native-function-to-string', Function.toString);

},{"../internals/shared":75}],32:[function(require,module,exports){
var classof = require('../internals/classof');
var Iterators = require('../internals/iterators');
var wellKnownSymbol = require('../internals/well-known-symbol');

var ITERATOR = wellKnownSymbol('iterator');

module.exports = function (it) {
  if (it != undefined) return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};

},{"../internals/classof":15,"../internals/iterators":49,"../internals/well-known-symbol":89}],33:[function(require,module,exports){
(function (global){
var O = 'object';
var check = function (it) {
  return it && it.Math == Math && it;
};

// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
module.exports =
  // eslint-disable-next-line no-undef
  check(typeof globalThis == O && globalThis) ||
  check(typeof window == O && window) ||
  check(typeof self == O && self) ||
  check(typeof global == O && global) ||
  // eslint-disable-next-line no-new-func
  Function('return this')();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],34:[function(require,module,exports){
var hasOwnProperty = {}.hasOwnProperty;

module.exports = function (it, key) {
  return hasOwnProperty.call(it, key);
};

},{}],35:[function(require,module,exports){
module.exports = {};

},{}],36:[function(require,module,exports){
var DESCRIPTORS = require('../internals/descriptors');
var definePropertyModule = require('../internals/object-define-property');
var createPropertyDescriptor = require('../internals/create-property-descriptor');

module.exports = DESCRIPTORS ? function (object, key, value) {
  return definePropertyModule.f(object, key, createPropertyDescriptor(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};

},{"../internals/create-property-descriptor":20,"../internals/descriptors":23,"../internals/object-define-property":55}],37:[function(require,module,exports){
var global = require('../internals/global');

var document = global.document;

module.exports = document && document.documentElement;

},{"../internals/global":33}],38:[function(require,module,exports){
var DESCRIPTORS = require('../internals/descriptors');
var fails = require('../internals/fails');
var createElement = require('../internals/document-create-element');

// Thank's IE8 for his funny defineProperty
module.exports = !DESCRIPTORS && !fails(function () {
  return Object.defineProperty(createElement('div'), 'a', {
    get: function () { return 7; }
  }).a != 7;
});

},{"../internals/descriptors":23,"../internals/document-create-element":24,"../internals/fails":28}],39:[function(require,module,exports){
// fallback for non-array-like ES3 and non-enumerable old V8 strings
var fails = require('../internals/fails');
var classof = require('../internals/classof-raw');

var split = ''.split;

module.exports = fails(function () {
  // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
  // eslint-disable-next-line no-prototype-builtins
  return !Object('z').propertyIsEnumerable(0);
}) ? function (it) {
  return classof(it) == 'String' ? split.call(it, '') : Object(it);
} : Object;

},{"../internals/classof-raw":14,"../internals/fails":28}],40:[function(require,module,exports){
var isObject = require('../internals/is-object');
var setPrototypeOf = require('../internals/object-set-prototype-of');

module.exports = function (that, target, C) {
  var S = target.constructor;
  var P;
  if (S !== C && typeof S == 'function' && (P = S.prototype) !== C.prototype && isObject(P) && setPrototypeOf) {
    setPrototypeOf(that, P);
  } return that;
};

},{"../internals/is-object":45,"../internals/object-set-prototype-of":63}],41:[function(require,module,exports){
var NATIVE_WEAK_MAP = require('../internals/native-weak-map');
var global = require('../internals/global');
var isObject = require('../internals/is-object');
var hide = require('../internals/hide');
var objectHas = require('../internals/has');
var sharedKey = require('../internals/shared-key');
var hiddenKeys = require('../internals/hidden-keys');

var WeakMap = global.WeakMap;
var set, get, has;

var enforce = function (it) {
  return has(it) ? get(it) : set(it, {});
};

var getterFor = function (TYPE) {
  return function (it) {
    var state;
    if (!isObject(it) || (state = get(it)).type !== TYPE) {
      throw TypeError('Incompatible receiver, ' + TYPE + ' required');
    } return state;
  };
};

if (NATIVE_WEAK_MAP) {
  var store = new WeakMap();
  var wmget = store.get;
  var wmhas = store.has;
  var wmset = store.set;
  set = function (it, metadata) {
    wmset.call(store, it, metadata);
    return metadata;
  };
  get = function (it) {
    return wmget.call(store, it) || {};
  };
  has = function (it) {
    return wmhas.call(store, it);
  };
} else {
  var STATE = sharedKey('state');
  hiddenKeys[STATE] = true;
  set = function (it, metadata) {
    hide(it, STATE, metadata);
    return metadata;
  };
  get = function (it) {
    return objectHas(it, STATE) ? it[STATE] : {};
  };
  has = function (it) {
    return objectHas(it, STATE);
  };
}

module.exports = {
  set: set,
  get: get,
  has: has,
  enforce: enforce,
  getterFor: getterFor
};

},{"../internals/global":33,"../internals/has":34,"../internals/hidden-keys":35,"../internals/hide":36,"../internals/is-object":45,"../internals/native-weak-map":51,"../internals/shared-key":74}],42:[function(require,module,exports){
var wellKnownSymbol = require('../internals/well-known-symbol');
var Iterators = require('../internals/iterators');

var ITERATOR = wellKnownSymbol('iterator');
var ArrayPrototype = Array.prototype;

// check on default Array iterator
module.exports = function (it) {
  return it !== undefined && (Iterators.Array === it || ArrayPrototype[ITERATOR] === it);
};

},{"../internals/iterators":49,"../internals/well-known-symbol":89}],43:[function(require,module,exports){
var classof = require('../internals/classof-raw');

// `IsArray` abstract operation
// https://tc39.github.io/ecma262/#sec-isarray
module.exports = Array.isArray || function isArray(arg) {
  return classof(arg) == 'Array';
};

},{"../internals/classof-raw":14}],44:[function(require,module,exports){
var fails = require('../internals/fails');

var replacement = /#|\.prototype\./;

var isForced = function (feature, detection) {
  var value = data[normalize(feature)];
  return value == POLYFILL ? true
    : value == NATIVE ? false
    : typeof detection == 'function' ? fails(detection)
    : !!detection;
};

var normalize = isForced.normalize = function (string) {
  return String(string).replace(replacement, '.').toLowerCase();
};

var data = isForced.data = {};
var NATIVE = isForced.NATIVE = 'N';
var POLYFILL = isForced.POLYFILL = 'P';

module.exports = isForced;

},{"../internals/fails":28}],45:[function(require,module,exports){
module.exports = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};

},{}],46:[function(require,module,exports){
module.exports = false;

},{}],47:[function(require,module,exports){
var isObject = require('../internals/is-object');
var classof = require('../internals/classof-raw');
var wellKnownSymbol = require('../internals/well-known-symbol');

var MATCH = wellKnownSymbol('match');

// `IsRegExp` abstract operation
// https://tc39.github.io/ecma262/#sec-isregexp
module.exports = function (it) {
  var isRegExp;
  return isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : classof(it) == 'RegExp');
};

},{"../internals/classof-raw":14,"../internals/is-object":45,"../internals/well-known-symbol":89}],48:[function(require,module,exports){
'use strict';
var getPrototypeOf = require('../internals/object-get-prototype-of');
var hide = require('../internals/hide');
var has = require('../internals/has');
var wellKnownSymbol = require('../internals/well-known-symbol');
var IS_PURE = require('../internals/is-pure');

var ITERATOR = wellKnownSymbol('iterator');
var BUGGY_SAFARI_ITERATORS = false;

var returnThis = function () { return this; };

// `%IteratorPrototype%` object
// https://tc39.github.io/ecma262/#sec-%iteratorprototype%-object
var IteratorPrototype, PrototypeOfArrayIteratorPrototype, arrayIterator;

if ([].keys) {
  arrayIterator = [].keys();
  // Safari 8 has buggy iterators w/o `next`
  if (!('next' in arrayIterator)) BUGGY_SAFARI_ITERATORS = true;
  else {
    PrototypeOfArrayIteratorPrototype = getPrototypeOf(getPrototypeOf(arrayIterator));
    if (PrototypeOfArrayIteratorPrototype !== Object.prototype) IteratorPrototype = PrototypeOfArrayIteratorPrototype;
  }
}

if (IteratorPrototype == undefined) IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
if (!IS_PURE && !has(IteratorPrototype, ITERATOR)) hide(IteratorPrototype, ITERATOR, returnThis);

module.exports = {
  IteratorPrototype: IteratorPrototype,
  BUGGY_SAFARI_ITERATORS: BUGGY_SAFARI_ITERATORS
};

},{"../internals/has":34,"../internals/hide":36,"../internals/is-pure":46,"../internals/object-get-prototype-of":59,"../internals/well-known-symbol":89}],49:[function(require,module,exports){
arguments[4][35][0].apply(exports,arguments)
},{"dup":35}],50:[function(require,module,exports){
var fails = require('../internals/fails');

module.exports = !!Object.getOwnPropertySymbols && !fails(function () {
  // Chrome 38 Symbol has incorrect toString conversion
  // eslint-disable-next-line no-undef
  return !String(Symbol());
});

},{"../internals/fails":28}],51:[function(require,module,exports){
var global = require('../internals/global');
var nativeFunctionToString = require('../internals/function-to-string');

var WeakMap = global.WeakMap;

module.exports = typeof WeakMap === 'function' && /native code/.test(nativeFunctionToString.call(WeakMap));

},{"../internals/function-to-string":31,"../internals/global":33}],52:[function(require,module,exports){
'use strict';
var DESCRIPTORS = require('../internals/descriptors');
var fails = require('../internals/fails');
var objectKeys = require('../internals/object-keys');
var getOwnPropertySymbolsModule = require('../internals/object-get-own-property-symbols');
var propertyIsEnumerableModule = require('../internals/object-property-is-enumerable');
var toObject = require('../internals/to-object');
var IndexedObject = require('../internals/indexed-object');

var nativeAssign = Object.assign;

// 19.1.2.1 Object.assign(target, source, ...)
// should work with symbols and should have deterministic property order (V8 bug)
module.exports = !nativeAssign || fails(function () {
  var A = {};
  var B = {};
  // eslint-disable-next-line no-undef
  var symbol = Symbol();
  var alphabet = 'abcdefghijklmnopqrst';
  A[symbol] = 7;
  alphabet.split('').forEach(function (chr) { B[chr] = chr; });
  return nativeAssign({}, A)[symbol] != 7 || objectKeys(nativeAssign({}, B)).join('') != alphabet;
}) ? function assign(target, source) { // eslint-disable-line no-unused-vars
  var T = toObject(target);
  var argumentsLength = arguments.length;
  var index = 1;
  var getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
  var propertyIsEnumerable = propertyIsEnumerableModule.f;
  while (argumentsLength > index) {
    var S = IndexedObject(arguments[index++]);
    var keys = getOwnPropertySymbols ? objectKeys(S).concat(getOwnPropertySymbols(S)) : objectKeys(S);
    var length = keys.length;
    var j = 0;
    var key;
    while (length > j) {
      key = keys[j++];
      if (!DESCRIPTORS || propertyIsEnumerable.call(S, key)) T[key] = S[key];
    }
  } return T;
} : nativeAssign;

},{"../internals/descriptors":23,"../internals/fails":28,"../internals/indexed-object":39,"../internals/object-get-own-property-symbols":58,"../internals/object-keys":61,"../internals/object-property-is-enumerable":62,"../internals/to-object":84}],53:[function(require,module,exports){
var anObject = require('../internals/an-object');
var defineProperties = require('../internals/object-define-properties');
var enumBugKeys = require('../internals/enum-bug-keys');
var hiddenKeys = require('../internals/hidden-keys');
var html = require('../internals/html');
var documentCreateElement = require('../internals/document-create-element');
var sharedKey = require('../internals/shared-key');
var IE_PROTO = sharedKey('IE_PROTO');

var PROTOTYPE = 'prototype';
var Empty = function () { /* empty */ };

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var createDict = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = documentCreateElement('iframe');
  var length = enumBugKeys.length;
  var lt = '<';
  var script = 'script';
  var gt = '>';
  var js = 'java' + script + ':';
  var iframeDocument;
  iframe.style.display = 'none';
  html.appendChild(iframe);
  iframe.src = String(js);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(lt + script + gt + 'document.F=Object' + lt + '/' + script + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while (length--) delete createDict[PROTOTYPE][enumBugKeys[length]];
  return createDict();
};

// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
module.exports = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    Empty[PROTOTYPE] = anObject(O);
    result = new Empty();
    Empty[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = createDict();
  return Properties === undefined ? result : defineProperties(result, Properties);
};

hiddenKeys[IE_PROTO] = true;

},{"../internals/an-object":4,"../internals/document-create-element":24,"../internals/enum-bug-keys":26,"../internals/hidden-keys":35,"../internals/html":37,"../internals/object-define-properties":54,"../internals/shared-key":74}],54:[function(require,module,exports){
var DESCRIPTORS = require('../internals/descriptors');
var definePropertyModule = require('../internals/object-define-property');
var anObject = require('../internals/an-object');
var objectKeys = require('../internals/object-keys');

module.exports = DESCRIPTORS ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject(O);
  var keys = objectKeys(Properties);
  var length = keys.length;
  var i = 0;
  var key;
  while (length > i) definePropertyModule.f(O, key = keys[i++], Properties[key]);
  return O;
};

},{"../internals/an-object":4,"../internals/descriptors":23,"../internals/object-define-property":55,"../internals/object-keys":61}],55:[function(require,module,exports){
var DESCRIPTORS = require('../internals/descriptors');
var IE8_DOM_DEFINE = require('../internals/ie8-dom-define');
var anObject = require('../internals/an-object');
var toPrimitive = require('../internals/to-primitive');

var nativeDefineProperty = Object.defineProperty;

exports.f = DESCRIPTORS ? nativeDefineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if (IE8_DOM_DEFINE) try {
    return nativeDefineProperty(O, P, Attributes);
  } catch (error) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};

},{"../internals/an-object":4,"../internals/descriptors":23,"../internals/ie8-dom-define":38,"../internals/to-primitive":85}],56:[function(require,module,exports){
var DESCRIPTORS = require('../internals/descriptors');
var propertyIsEnumerableModule = require('../internals/object-property-is-enumerable');
var createPropertyDescriptor = require('../internals/create-property-descriptor');
var toIndexedObject = require('../internals/to-indexed-object');
var toPrimitive = require('../internals/to-primitive');
var has = require('../internals/has');
var IE8_DOM_DEFINE = require('../internals/ie8-dom-define');

var nativeGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

exports.f = DESCRIPTORS ? nativeGetOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
  O = toIndexedObject(O);
  P = toPrimitive(P, true);
  if (IE8_DOM_DEFINE) try {
    return nativeGetOwnPropertyDescriptor(O, P);
  } catch (error) { /* empty */ }
  if (has(O, P)) return createPropertyDescriptor(!propertyIsEnumerableModule.f.call(O, P), O[P]);
};

},{"../internals/create-property-descriptor":20,"../internals/descriptors":23,"../internals/has":34,"../internals/ie8-dom-define":38,"../internals/object-property-is-enumerable":62,"../internals/to-indexed-object":81,"../internals/to-primitive":85}],57:[function(require,module,exports){
// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
var internalObjectKeys = require('../internals/object-keys-internal');
var enumBugKeys = require('../internals/enum-bug-keys');

var hiddenKeys = enumBugKeys.concat('length', 'prototype');

exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return internalObjectKeys(O, hiddenKeys);
};

},{"../internals/enum-bug-keys":26,"../internals/object-keys-internal":60}],58:[function(require,module,exports){
exports.f = Object.getOwnPropertySymbols;

},{}],59:[function(require,module,exports){
var has = require('../internals/has');
var toObject = require('../internals/to-object');
var sharedKey = require('../internals/shared-key');
var CORRECT_PROTOTYPE_GETTER = require('../internals/correct-prototype-getter');

var IE_PROTO = sharedKey('IE_PROTO');
var ObjectPrototype = Object.prototype;

// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
module.exports = CORRECT_PROTOTYPE_GETTER ? Object.getPrototypeOf : function (O) {
  O = toObject(O);
  if (has(O, IE_PROTO)) return O[IE_PROTO];
  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectPrototype : null;
};

},{"../internals/correct-prototype-getter":18,"../internals/has":34,"../internals/shared-key":74,"../internals/to-object":84}],60:[function(require,module,exports){
var has = require('../internals/has');
var toIndexedObject = require('../internals/to-indexed-object');
var arrayIncludes = require('../internals/array-includes');
var hiddenKeys = require('../internals/hidden-keys');

var arrayIndexOf = arrayIncludes(false);

module.exports = function (object, names) {
  var O = toIndexedObject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) !has(hiddenKeys, key) && has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (has(O, key = names[i++])) {
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};

},{"../internals/array-includes":7,"../internals/has":34,"../internals/hidden-keys":35,"../internals/to-indexed-object":81}],61:[function(require,module,exports){
var internalObjectKeys = require('../internals/object-keys-internal');
var enumBugKeys = require('../internals/enum-bug-keys');

// 19.1.2.14 / 15.2.3.14 Object.keys(O)
module.exports = Object.keys || function keys(O) {
  return internalObjectKeys(O, enumBugKeys);
};

},{"../internals/enum-bug-keys":26,"../internals/object-keys-internal":60}],62:[function(require,module,exports){
'use strict';
var nativePropertyIsEnumerable = {}.propertyIsEnumerable;
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

// Nashorn ~ JDK8 bug
var NASHORN_BUG = getOwnPropertyDescriptor && !nativePropertyIsEnumerable.call({ 1: 2 }, 1);

exports.f = NASHORN_BUG ? function propertyIsEnumerable(V) {
  var descriptor = getOwnPropertyDescriptor(this, V);
  return !!descriptor && descriptor.enumerable;
} : nativePropertyIsEnumerable;

},{}],63:[function(require,module,exports){
var validateSetPrototypeOfArguments = require('../internals/validate-set-prototype-of-arguments');

// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
module.exports = Object.setPrototypeOf || ('__proto__' in {} ? function () {
  var correctSetter = false;
  var test = {};
  var setter;
  try {
    setter = Object.getOwnPropertyDescriptor(Object.prototype, '__proto__').set;
    setter.call(test, []);
    correctSetter = test instanceof Array;
  } catch (error) { /* empty */ }
  return function setPrototypeOf(O, proto) {
    validateSetPrototypeOfArguments(O, proto);
    if (correctSetter) setter.call(O, proto);
    else O.__proto__ = proto;
    return O;
  };
}() : undefined);

},{"../internals/validate-set-prototype-of-arguments":87}],64:[function(require,module,exports){
var DESCRIPTORS = require('../internals/descriptors');
var objectKeys = require('../internals/object-keys');
var toIndexedObject = require('../internals/to-indexed-object');
var propertyIsEnumerable = require('../internals/object-property-is-enumerable').f;

// TO_ENTRIES: true  -> Object.entries
// TO_ENTRIES: false -> Object.values
module.exports = function (it, TO_ENTRIES) {
  var O = toIndexedObject(it);
  var keys = objectKeys(O);
  var length = keys.length;
  var i = 0;
  var result = [];
  var key;
  while (length > i) {
    key = keys[i++];
    if (!DESCRIPTORS || propertyIsEnumerable.call(O, key)) {
      result.push(TO_ENTRIES ? [key, O[key]] : O[key]);
    }
  }
  return result;
};

},{"../internals/descriptors":23,"../internals/object-keys":61,"../internals/object-property-is-enumerable":62,"../internals/to-indexed-object":81}],65:[function(require,module,exports){
'use strict';
var classof = require('../internals/classof');
var wellKnownSymbol = require('../internals/well-known-symbol');

var TO_STRING_TAG = wellKnownSymbol('toStringTag');
var test = {};

test[TO_STRING_TAG] = 'z';

// `Object.prototype.toString` method implementation
// https://tc39.github.io/ecma262/#sec-object.prototype.tostring
module.exports = String(test) !== '[object z]' ? function toString() {
  return '[object ' + classof(this) + ']';
} : test.toString;

},{"../internals/classof":15,"../internals/well-known-symbol":89}],66:[function(require,module,exports){
var global = require('../internals/global');
var getOwnPropertyNamesModule = require('../internals/object-get-own-property-names');
var getOwnPropertySymbolsModule = require('../internals/object-get-own-property-symbols');
var anObject = require('../internals/an-object');

var Reflect = global.Reflect;

// all object keys, includes non-enumerable and symbols
module.exports = Reflect && Reflect.ownKeys || function ownKeys(it) {
  var keys = getOwnPropertyNamesModule.f(anObject(it));
  var getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
  return getOwnPropertySymbols ? keys.concat(getOwnPropertySymbols(it)) : keys;
};

},{"../internals/an-object":4,"../internals/global":33,"../internals/object-get-own-property-names":57,"../internals/object-get-own-property-symbols":58}],67:[function(require,module,exports){
var global = require('../internals/global');
var shared = require('../internals/shared');
var hide = require('../internals/hide');
var has = require('../internals/has');
var setGlobal = require('../internals/set-global');
var nativeFunctionToString = require('../internals/function-to-string');
var InternalStateModule = require('../internals/internal-state');

var getInternalState = InternalStateModule.get;
var enforceInternalState = InternalStateModule.enforce;
var TEMPLATE = String(nativeFunctionToString).split('toString');

shared('inspectSource', function (it) {
  return nativeFunctionToString.call(it);
});

(module.exports = function (O, key, value, options) {
  var unsafe = options ? !!options.unsafe : false;
  var simple = options ? !!options.enumerable : false;
  var noTargetGet = options ? !!options.noTargetGet : false;
  if (typeof value == 'function') {
    if (typeof key == 'string' && !has(value, 'name')) hide(value, 'name', key);
    enforceInternalState(value).source = TEMPLATE.join(typeof key == 'string' ? key : '');
  }
  if (O === global) {
    if (simple) O[key] = value;
    else setGlobal(key, value);
    return;
  } else if (!unsafe) {
    delete O[key];
  } else if (!noTargetGet && O[key]) {
    simple = true;
  }
  if (simple) O[key] = value;
  else hide(O, key, value);
// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
})(Function.prototype, 'toString', function toString() {
  return typeof this == 'function' && getInternalState(this).source || nativeFunctionToString.call(this);
});

},{"../internals/function-to-string":31,"../internals/global":33,"../internals/has":34,"../internals/hide":36,"../internals/internal-state":41,"../internals/set-global":72,"../internals/shared":75}],68:[function(require,module,exports){
var classof = require('./classof-raw');
var regexpExec = require('./regexp-exec');

// `RegExpExec` abstract operation
// https://tc39.github.io/ecma262/#sec-regexpexec
module.exports = function (R, S) {
  var exec = R.exec;
  if (typeof exec === 'function') {
    var result = exec.call(R, S);
    if (typeof result !== 'object') {
      throw TypeError('RegExp exec method returned something other than an Object or null');
    }
    return result;
  }

  if (classof(R) !== 'RegExp') {
    throw TypeError('RegExp#exec called on incompatible receiver');
  }

  return regexpExec.call(R, S);
};


},{"./classof-raw":14,"./regexp-exec":69}],69:[function(require,module,exports){
'use strict';
var regexpFlags = require('./regexp-flags');

var nativeExec = RegExp.prototype.exec;
// This always refers to the native implementation, because the
// String#replace polyfill uses ./fix-regexp-well-known-symbol-logic.js,
// which loads this file before patching the method.
var nativeReplace = String.prototype.replace;

var patchedExec = nativeExec;

var UPDATES_LAST_INDEX_WRONG = (function () {
  var re1 = /a/;
  var re2 = /b*/g;
  nativeExec.call(re1, 'a');
  nativeExec.call(re2, 'a');
  return re1.lastIndex !== 0 || re2.lastIndex !== 0;
})();

// nonparticipating capturing group, copied from es5-shim's String#split patch.
var NPCG_INCLUDED = /()??/.exec('')[1] !== undefined;

var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED;

if (PATCH) {
  patchedExec = function exec(str) {
    var re = this;
    var lastIndex, reCopy, match, i;

    if (NPCG_INCLUDED) {
      reCopy = new RegExp('^' + re.source + '$(?!\\s)', regexpFlags.call(re));
    }
    if (UPDATES_LAST_INDEX_WRONG) lastIndex = re.lastIndex;

    match = nativeExec.call(re, str);

    if (UPDATES_LAST_INDEX_WRONG && match) {
      re.lastIndex = re.global ? match.index + match[0].length : lastIndex;
    }
    if (NPCG_INCLUDED && match && match.length > 1) {
      // Fix browsers whose `exec` methods don't consistently return `undefined`
      // for NPCG, like IE8. NOTE: This doesn' work for /(.?)?/
      nativeReplace.call(match[0], reCopy, function () {
        for (i = 1; i < arguments.length - 2; i++) {
          if (arguments[i] === undefined) match[i] = undefined;
        }
      });
    }

    return match;
  };
}

module.exports = patchedExec;

},{"./regexp-flags":70}],70:[function(require,module,exports){
'use strict';
var anObject = require('../internals/an-object');

// `RegExp.prototype.flags` getter implementation
// https://tc39.github.io/ecma262/#sec-get-regexp.prototype.flags
module.exports = function () {
  var that = anObject(this);
  var result = '';
  if (that.global) result += 'g';
  if (that.ignoreCase) result += 'i';
  if (that.multiline) result += 'm';
  if (that.unicode) result += 'u';
  if (that.sticky) result += 'y';
  return result;
};

},{"../internals/an-object":4}],71:[function(require,module,exports){
// `RequireObjectCoercible` abstract operation
// https://tc39.github.io/ecma262/#sec-requireobjectcoercible
module.exports = function (it) {
  if (it == undefined) throw TypeError("Can't call method on " + it);
  return it;
};

},{}],72:[function(require,module,exports){
var global = require('../internals/global');
var hide = require('../internals/hide');

module.exports = function (key, value) {
  try {
    hide(global, key, value);
  } catch (error) {
    global[key] = value;
  } return value;
};

},{"../internals/global":33,"../internals/hide":36}],73:[function(require,module,exports){
var defineProperty = require('../internals/object-define-property').f;
var has = require('../internals/has');
var wellKnownSymbol = require('../internals/well-known-symbol');

var TO_STRING_TAG = wellKnownSymbol('toStringTag');

module.exports = function (it, TAG, STATIC) {
  if (it && !has(it = STATIC ? it : it.prototype, TO_STRING_TAG)) {
    defineProperty(it, TO_STRING_TAG, { configurable: true, value: TAG });
  }
};

},{"../internals/has":34,"../internals/object-define-property":55,"../internals/well-known-symbol":89}],74:[function(require,module,exports){
var shared = require('../internals/shared');
var uid = require('../internals/uid');

var keys = shared('keys');

module.exports = function (key) {
  return keys[key] || (keys[key] = uid(key));
};

},{"../internals/shared":75,"../internals/uid":86}],75:[function(require,module,exports){
var global = require('../internals/global');
var setGlobal = require('../internals/set-global');
var IS_PURE = require('../internals/is-pure');

var SHARED = '__core-js_shared__';
var store = global[SHARED] || setGlobal(SHARED, {});

(module.exports = function (key, value) {
  return store[key] || (store[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: '3.1.3',
  mode: IS_PURE ? 'pure' : 'global',
  copyright: '© 2019 Denis Pushkarev (zloirock.ru)'
});

},{"../internals/global":33,"../internals/is-pure":46,"../internals/set-global":72}],76:[function(require,module,exports){
'use strict';
var fails = require('../internals/fails');

module.exports = function (METHOD_NAME, argument) {
  var method = [][METHOD_NAME];
  return !method || !fails(function () {
    // eslint-disable-next-line no-useless-call,no-throw-literal
    method.call(null, argument || function () { throw 1; }, 1);
  });
};

},{"../internals/fails":28}],77:[function(require,module,exports){
var anObject = require('../internals/an-object');
var aFunction = require('../internals/a-function');
var wellKnownSymbol = require('../internals/well-known-symbol');

var SPECIES = wellKnownSymbol('species');

// `SpeciesConstructor` abstract operation
// https://tc39.github.io/ecma262/#sec-speciesconstructor
module.exports = function (O, defaultConstructor) {
  var C = anObject(O).constructor;
  var S;
  return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? defaultConstructor : aFunction(S);
};

},{"../internals/a-function":1,"../internals/an-object":4,"../internals/well-known-symbol":89}],78:[function(require,module,exports){
var toInteger = require('../internals/to-integer');
var requireObjectCoercible = require('../internals/require-object-coercible');

// CONVERT_TO_STRING: true  -> String#at
// CONVERT_TO_STRING: false -> String#codePointAt
module.exports = function (that, pos, CONVERT_TO_STRING) {
  var S = String(requireObjectCoercible(that));
  var position = toInteger(pos);
  var size = S.length;
  var first, second;
  if (position < 0 || position >= size) return CONVERT_TO_STRING ? '' : undefined;
  first = S.charCodeAt(position);
  return first < 0xD800 || first > 0xDBFF || position + 1 === size
    || (second = S.charCodeAt(position + 1)) < 0xDC00 || second > 0xDFFF
      ? CONVERT_TO_STRING ? S.charAt(position) : first
      : CONVERT_TO_STRING ? S.slice(position, position + 2) : (first - 0xD800 << 10) + (second - 0xDC00) + 0x10000;
};

},{"../internals/require-object-coercible":71,"../internals/to-integer":82}],79:[function(require,module,exports){
var requireObjectCoercible = require('../internals/require-object-coercible');
var whitespaces = require('../internals/whitespaces');

var whitespace = '[' + whitespaces + ']';
var ltrim = RegExp('^' + whitespace + whitespace + '*');
var rtrim = RegExp(whitespace + whitespace + '*$');

// 1 -> String#trimStart
// 2 -> String#trimEnd
// 3 -> String#trim
module.exports = function (string, TYPE) {
  string = String(requireObjectCoercible(string));
  if (TYPE & 1) string = string.replace(ltrim, '');
  if (TYPE & 2) string = string.replace(rtrim, '');
  return string;
};

},{"../internals/require-object-coercible":71,"../internals/whitespaces":90}],80:[function(require,module,exports){
var toInteger = require('../internals/to-integer');

var max = Math.max;
var min = Math.min;

// Helper for a popular repeating case of the spec:
// Let integer be ? ToInteger(index).
// If integer < 0, let result be max((length + integer), 0); else let result be min(length, length).
module.exports = function (index, length) {
  var integer = toInteger(index);
  return integer < 0 ? max(integer + length, 0) : min(integer, length);
};

},{"../internals/to-integer":82}],81:[function(require,module,exports){
// toObject with fallback for non-array-like ES3 strings
var IndexedObject = require('../internals/indexed-object');
var requireObjectCoercible = require('../internals/require-object-coercible');

module.exports = function (it) {
  return IndexedObject(requireObjectCoercible(it));
};

},{"../internals/indexed-object":39,"../internals/require-object-coercible":71}],82:[function(require,module,exports){
var ceil = Math.ceil;
var floor = Math.floor;

// `ToInteger` abstract operation
// https://tc39.github.io/ecma262/#sec-tointeger
module.exports = function (argument) {
  return isNaN(argument = +argument) ? 0 : (argument > 0 ? floor : ceil)(argument);
};

},{}],83:[function(require,module,exports){
var toInteger = require('../internals/to-integer');

var min = Math.min;

// `ToLength` abstract operation
// https://tc39.github.io/ecma262/#sec-tolength
module.exports = function (argument) {
  return argument > 0 ? min(toInteger(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
};

},{"../internals/to-integer":82}],84:[function(require,module,exports){
var requireObjectCoercible = require('../internals/require-object-coercible');

// `ToObject` abstract operation
// https://tc39.github.io/ecma262/#sec-toobject
module.exports = function (argument) {
  return Object(requireObjectCoercible(argument));
};

},{"../internals/require-object-coercible":71}],85:[function(require,module,exports){
var isObject = require('../internals/is-object');

// 7.1.1 ToPrimitive(input [, PreferredType])
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function (it, S) {
  if (!isObject(it)) return it;
  var fn, val;
  if (S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  if (typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it))) return val;
  if (!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  throw TypeError("Can't convert object to primitive value");
};

},{"../internals/is-object":45}],86:[function(require,module,exports){
var id = 0;
var postfix = Math.random();

module.exports = function (key) {
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + postfix).toString(36));
};

},{}],87:[function(require,module,exports){
var isObject = require('../internals/is-object');
var anObject = require('../internals/an-object');

module.exports = function (O, proto) {
  anObject(O);
  if (!isObject(proto) && proto !== null) {
    throw TypeError("Can't set " + String(proto) + ' as a prototype');
  }
};

},{"../internals/an-object":4,"../internals/is-object":45}],88:[function(require,module,exports){
// helper for String#{startsWith, endsWith, includes}
var isRegExp = require('../internals/is-regexp');
var requireObjectCoercible = require('../internals/require-object-coercible');

module.exports = function (that, searchString, NAME) {
  if (isRegExp(searchString)) {
    throw TypeError('String.prototype.' + NAME + " doesn't accept regex");
  } return String(requireObjectCoercible(that));
};

},{"../internals/is-regexp":47,"../internals/require-object-coercible":71}],89:[function(require,module,exports){
var global = require('../internals/global');
var shared = require('../internals/shared');
var uid = require('../internals/uid');
var NATIVE_SYMBOL = require('../internals/native-symbol');

var Symbol = global.Symbol;
var store = shared('wks');

module.exports = function (name) {
  return store[name] || (store[name] = NATIVE_SYMBOL && Symbol[name]
    || (NATIVE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};

},{"../internals/global":33,"../internals/native-symbol":50,"../internals/shared":75,"../internals/uid":86}],90:[function(require,module,exports){
// a string of all valid unicode whitespaces
// eslint-disable-next-line max-len
module.exports = '\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';

},{}],91:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var arrayMethods = require('../internals/array-methods');
var arrayMethodHasSpeciesSupport = require('../internals/array-method-has-species-support');

var internalFilter = arrayMethods(2);
var SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('filter');

// `Array.prototype.filter` method
// https://tc39.github.io/ecma262/#sec-array.prototype.filter
// with adding support of @@species
$({ target: 'Array', proto: true, forced: !SPECIES_SUPPORT }, {
  filter: function filter(callbackfn /* , thisArg */) {
    return internalFilter(this, callbackfn, arguments[1]);
  }
});

},{"../internals/array-method-has-species-support":8,"../internals/array-methods":9,"../internals/export":27}],92:[function(require,module,exports){
var $ = require('../internals/export');
var from = require('../internals/array-from');
var checkCorrectnessOfIteration = require('../internals/check-correctness-of-iteration');

var INCORRECT_ITERATION = !checkCorrectnessOfIteration(function (iterable) {
  Array.from(iterable);
});

// `Array.from` method
// https://tc39.github.io/ecma262/#sec-array.from
$({ target: 'Array', stat: true, forced: INCORRECT_ITERATION }, {
  from: from
});

},{"../internals/array-from":6,"../internals/check-correctness-of-iteration":13,"../internals/export":27}],93:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var arrayIncludes = require('../internals/array-includes');
var addToUnscopables = require('../internals/add-to-unscopables');

var internalIncludes = arrayIncludes(true);

// `Array.prototype.includes` method
// https://tc39.github.io/ecma262/#sec-array.prototype.includes
$({ target: 'Array', proto: true }, {
  includes: function includes(el /* , fromIndex = 0 */) {
    return internalIncludes(this, el, arguments.length > 1 ? arguments[1] : undefined);
  }
});

// https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables('includes');

},{"../internals/add-to-unscopables":2,"../internals/array-includes":7,"../internals/export":27}],94:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var IndexedObject = require('../internals/indexed-object');
var toIndexedObject = require('../internals/to-indexed-object');
var sloppyArrayMethod = require('../internals/sloppy-array-method');

var nativeJoin = [].join;

var ES3_STRINGS = IndexedObject != Object;
var SLOPPY_METHOD = sloppyArrayMethod('join', ',');

// `Array.prototype.join` method
// https://tc39.github.io/ecma262/#sec-array.prototype.join
$({ target: 'Array', proto: true, forced: ES3_STRINGS || SLOPPY_METHOD }, {
  join: function join(separator) {
    return nativeJoin.call(toIndexedObject(this), separator === undefined ? ',' : separator);
  }
});

},{"../internals/export":27,"../internals/indexed-object":39,"../internals/sloppy-array-method":76,"../internals/to-indexed-object":81}],95:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var arrayMethods = require('../internals/array-methods');
var arrayMethodHasSpeciesSupport = require('../internals/array-method-has-species-support');

var internalMap = arrayMethods(1);
var SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('map');

// `Array.prototype.map` method
// https://tc39.github.io/ecma262/#sec-array.prototype.map
// with adding support of @@species
$({ target: 'Array', proto: true, forced: !SPECIES_SUPPORT }, {
  map: function map(callbackfn /* , thisArg */) {
    return internalMap(this, callbackfn, arguments[1]);
  }
});

},{"../internals/array-method-has-species-support":8,"../internals/array-methods":9,"../internals/export":27}],96:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var isObject = require('../internals/is-object');
var isArray = require('../internals/is-array');
var toAbsoluteIndex = require('../internals/to-absolute-index');
var toLength = require('../internals/to-length');
var toIndexedObject = require('../internals/to-indexed-object');
var createProperty = require('../internals/create-property');
var arrayMethodHasSpeciesSupport = require('../internals/array-method-has-species-support');
var wellKnownSymbol = require('../internals/well-known-symbol');

var SPECIES = wellKnownSymbol('species');
var nativeSlice = [].slice;
var max = Math.max;

var SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('slice');

// `Array.prototype.slice` method
// https://tc39.github.io/ecma262/#sec-array.prototype.slice
// fallback for not array-like ES3 strings and DOM objects
$({ target: 'Array', proto: true, forced: !SPECIES_SUPPORT }, {
  slice: function slice(start, end) {
    var O = toIndexedObject(this);
    var length = toLength(O.length);
    var k = toAbsoluteIndex(start, length);
    var fin = toAbsoluteIndex(end === undefined ? length : end, length);
    // inline `ArraySpeciesCreate` for usage native `Array#slice` where it's possible
    var Constructor, result, n;
    if (isArray(O)) {
      Constructor = O.constructor;
      // cross-realm fallback
      if (typeof Constructor == 'function' && (Constructor === Array || isArray(Constructor.prototype))) {
        Constructor = undefined;
      } else if (isObject(Constructor)) {
        Constructor = Constructor[SPECIES];
        if (Constructor === null) Constructor = undefined;
      }
      if (Constructor === Array || Constructor === undefined) {
        return nativeSlice.call(O, k, fin);
      }
    }
    result = new (Constructor === undefined ? Array : Constructor)(max(fin - k, 0));
    for (n = 0; k < fin; k++, n++) if (k in O) createProperty(result, n, O[k]);
    result.length = n;
    return result;
  }
});

},{"../internals/array-method-has-species-support":8,"../internals/create-property":21,"../internals/export":27,"../internals/is-array":43,"../internals/is-object":45,"../internals/to-absolute-index":80,"../internals/to-indexed-object":81,"../internals/to-length":83,"../internals/well-known-symbol":89}],97:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var toAbsoluteIndex = require('../internals/to-absolute-index');
var toInteger = require('../internals/to-integer');
var toLength = require('../internals/to-length');
var toObject = require('../internals/to-object');
var arraySpeciesCreate = require('../internals/array-species-create');
var createProperty = require('../internals/create-property');
var arrayMethodHasSpeciesSupport = require('../internals/array-method-has-species-support');

var max = Math.max;
var min = Math.min;
var MAX_SAFE_INTEGER = 0x1FFFFFFFFFFFFF;
var MAXIMUM_ALLOWED_LENGTH_EXCEEDED = 'Maximum allowed length exceeded';

var SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('splice');

// `Array.prototype.splice` method
// https://tc39.github.io/ecma262/#sec-array.prototype.splice
// with adding support of @@species
$({ target: 'Array', proto: true, forced: !SPECIES_SUPPORT }, {
  splice: function splice(start, deleteCount /* , ...items */) {
    var O = toObject(this);
    var len = toLength(O.length);
    var actualStart = toAbsoluteIndex(start, len);
    var argumentsLength = arguments.length;
    var insertCount, actualDeleteCount, A, k, from, to;
    if (argumentsLength === 0) {
      insertCount = actualDeleteCount = 0;
    } else if (argumentsLength === 1) {
      insertCount = 0;
      actualDeleteCount = len - actualStart;
    } else {
      insertCount = argumentsLength - 2;
      actualDeleteCount = min(max(toInteger(deleteCount), 0), len - actualStart);
    }
    if (len + insertCount - actualDeleteCount > MAX_SAFE_INTEGER) {
      throw TypeError(MAXIMUM_ALLOWED_LENGTH_EXCEEDED);
    }
    A = arraySpeciesCreate(O, actualDeleteCount);
    for (k = 0; k < actualDeleteCount; k++) {
      from = actualStart + k;
      if (from in O) createProperty(A, k, O[from]);
    }
    A.length = actualDeleteCount;
    if (insertCount < actualDeleteCount) {
      for (k = actualStart; k < len - actualDeleteCount; k++) {
        from = k + actualDeleteCount;
        to = k + insertCount;
        if (from in O) O[to] = O[from];
        else delete O[to];
      }
      for (k = len; k > len - actualDeleteCount + insertCount; k--) delete O[k - 1];
    } else if (insertCount > actualDeleteCount) {
      for (k = len - actualDeleteCount; k > actualStart; k--) {
        from = k + actualDeleteCount - 1;
        to = k + insertCount - 1;
        if (from in O) O[to] = O[from];
        else delete O[to];
      }
    }
    for (k = 0; k < insertCount; k++) {
      O[k + actualStart] = arguments[k + 2];
    }
    O.length = len - actualDeleteCount + insertCount;
    return A;
  }
});

},{"../internals/array-method-has-species-support":8,"../internals/array-species-create":10,"../internals/create-property":21,"../internals/export":27,"../internals/to-absolute-index":80,"../internals/to-integer":82,"../internals/to-length":83,"../internals/to-object":84}],98:[function(require,module,exports){
var DESCRIPTORS = require('../internals/descriptors');
var defineProperty = require('../internals/object-define-property').f;

var FunctionPrototype = Function.prototype;
var FunctionPrototypeToString = FunctionPrototype.toString;
var nameRE = /^\s*function ([^ (]*)/;
var NAME = 'name';

// Function instances `.name` property
// https://tc39.github.io/ecma262/#sec-function-instances-name
if (DESCRIPTORS && !(NAME in FunctionPrototype)) {
  defineProperty(FunctionPrototype, NAME, {
    configurable: true,
    get: function () {
      try {
        return FunctionPrototypeToString.call(this).match(nameRE)[1];
      } catch (error) {
        return '';
      }
    }
  });
}

},{"../internals/descriptors":23,"../internals/object-define-property":55}],99:[function(require,module,exports){
'use strict';
var DESCRIPTORS = require('../internals/descriptors');
var global = require('../internals/global');
var isForced = require('../internals/is-forced');
var redefine = require('../internals/redefine');
var has = require('../internals/has');
var classof = require('../internals/classof-raw');
var inheritIfRequired = require('../internals/inherit-if-required');
var toPrimitive = require('../internals/to-primitive');
var fails = require('../internals/fails');
var create = require('../internals/object-create');
var getOwnPropertyNames = require('../internals/object-get-own-property-names').f;
var getOwnPropertyDescriptor = require('../internals/object-get-own-property-descriptor').f;
var defineProperty = require('../internals/object-define-property').f;
var internalStringTrim = require('../internals/string-trim');

var NUMBER = 'Number';
var NativeNumber = global[NUMBER];
var NumberPrototype = NativeNumber.prototype;

// Opera ~12 has broken Object#toString
var BROKEN_CLASSOF = classof(create(NumberPrototype)) == NUMBER;
var NATIVE_TRIM = 'trim' in String.prototype;

// `ToNumber` abstract operation
// https://tc39.github.io/ecma262/#sec-tonumber
var toNumber = function (argument) {
  var it = toPrimitive(argument, false);
  var first, third, radix, maxCode, digits, length, i, code;
  if (typeof it == 'string' && it.length > 2) {
    it = NATIVE_TRIM ? it.trim() : internalStringTrim(it, 3);
    first = it.charCodeAt(0);
    if (first === 43 || first === 45) {
      third = it.charCodeAt(2);
      if (third === 88 || third === 120) return NaN; // Number('+0x1') should be NaN, old V8 fix
    } else if (first === 48) {
      switch (it.charCodeAt(1)) {
        case 66: case 98: radix = 2; maxCode = 49; break; // fast equal of /^0b[01]+$/i
        case 79: case 111: radix = 8; maxCode = 55; break; // fast equal of /^0o[0-7]+$/i
        default: return +it;
      }
      digits = it.slice(2);
      length = digits.length;
      for (i = 0; i < length; i++) {
        code = digits.charCodeAt(i);
        // parseInt parses a string to a first unavailable symbol
        // but ToNumber should return NaN if a string contains unavailable symbols
        if (code < 48 || code > maxCode) return NaN;
      } return parseInt(digits, radix);
    }
  } return +it;
};

// `Number` constructor
// https://tc39.github.io/ecma262/#sec-number-constructor
if (isForced(NUMBER, !NativeNumber(' 0o1') || !NativeNumber('0b1') || NativeNumber('+0x1'))) {
  var NumberWrapper = function Number(value) {
    var it = arguments.length < 1 ? 0 : value;
    var that = this;
    return that instanceof NumberWrapper
      // check on 1..constructor(foo) case
      && (BROKEN_CLASSOF ? fails(function () { NumberPrototype.valueOf.call(that); }) : classof(that) != NUMBER)
        ? inheritIfRequired(new NativeNumber(toNumber(it)), that, NumberWrapper) : toNumber(it);
  };
  for (var keys = DESCRIPTORS ? getOwnPropertyNames(NativeNumber) : (
    // ES3:
    'MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,' +
    // ES2015 (in case, if modules with ES2015 Number statics required before):
    'EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER,' +
    'MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger'
  ).split(','), j = 0, key; keys.length > j; j++) {
    if (has(NativeNumber, key = keys[j]) && !has(NumberWrapper, key)) {
      defineProperty(NumberWrapper, key, getOwnPropertyDescriptor(NativeNumber, key));
    }
  }
  NumberWrapper.prototype = NumberPrototype;
  NumberPrototype.constructor = NumberWrapper;
  redefine(global, NUMBER, NumberWrapper);
}

},{"../internals/classof-raw":14,"../internals/descriptors":23,"../internals/fails":28,"../internals/global":33,"../internals/has":34,"../internals/inherit-if-required":40,"../internals/is-forced":44,"../internals/object-create":53,"../internals/object-define-property":55,"../internals/object-get-own-property-descriptor":56,"../internals/object-get-own-property-names":57,"../internals/redefine":67,"../internals/string-trim":79,"../internals/to-primitive":85}],100:[function(require,module,exports){
var $ = require('../internals/export');
var assign = require('../internals/object-assign');

// `Object.assign` method
// https://tc39.github.io/ecma262/#sec-object.assign
$({ target: 'Object', stat: true, forced: Object.assign !== assign }, {
  assign: assign
});

},{"../internals/export":27,"../internals/object-assign":52}],101:[function(require,module,exports){
var $ = require('../internals/export');
var objectToArray = require('../internals/object-to-array');

// `Object.entries` method
// https://tc39.github.io/ecma262/#sec-object.entries
$({ target: 'Object', stat: true }, {
  entries: function entries(O) {
    return objectToArray(O, true);
  }
});

},{"../internals/export":27,"../internals/object-to-array":64}],102:[function(require,module,exports){
var $ = require('../internals/export');
var toObject = require('../internals/to-object');
var nativeKeys = require('../internals/object-keys');
var fails = require('../internals/fails');

var FAILS_ON_PRIMITIVES = fails(function () { nativeKeys(1); });

// `Object.keys` method
// https://tc39.github.io/ecma262/#sec-object.keys
$({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES }, {
  keys: function keys(it) {
    return nativeKeys(toObject(it));
  }
});

},{"../internals/export":27,"../internals/fails":28,"../internals/object-keys":61,"../internals/to-object":84}],103:[function(require,module,exports){
var redefine = require('../internals/redefine');
var toString = require('../internals/object-to-string');

var ObjectPrototype = Object.prototype;

// `Object.prototype.toString` method
// https://tc39.github.io/ecma262/#sec-object.prototype.tostring
if (toString !== ObjectPrototype.toString) {
  redefine(ObjectPrototype, 'toString', toString, { unsafe: true });
}

},{"../internals/object-to-string":65,"../internals/redefine":67}],104:[function(require,module,exports){
'use strict';
var redefine = require('../internals/redefine');
var anObject = require('../internals/an-object');
var fails = require('../internals/fails');
var flags = require('../internals/regexp-flags');

var TO_STRING = 'toString';
var nativeToString = /./[TO_STRING];
var RegExpPrototype = RegExp.prototype;

var NOT_GENERIC = fails(function () { return nativeToString.call({ source: 'a', flags: 'b' }) != '/a/b'; });
// FF44- RegExp#toString has a wrong name
var INCORRECT_NAME = nativeToString.name != TO_STRING;

// `RegExp.prototype.toString` method
// https://tc39.github.io/ecma262/#sec-regexp.prototype.tostring
if (NOT_GENERIC || INCORRECT_NAME) {
  redefine(RegExp.prototype, TO_STRING, function toString() {
    var R = anObject(this);
    var p = String(R.source);
    var rf = R.flags;
    var f = String(rf === undefined && R instanceof RegExp && !('flags' in RegExpPrototype) ? flags.call(R) : rf);
    return '/' + p + '/' + f;
  }, { unsafe: true });
}

},{"../internals/an-object":4,"../internals/fails":28,"../internals/redefine":67,"../internals/regexp-flags":70}],105:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var validateArguments = require('../internals/validate-string-method-arguments');
var correctIsRegExpLogic = require('../internals/correct-is-regexp-logic');

// `String.prototype.includes` method
// https://tc39.github.io/ecma262/#sec-string.prototype.includes
$({ target: 'String', proto: true, forced: !correctIsRegExpLogic('includes') }, {
  includes: function includes(searchString /* , position = 0 */) {
    return !!~validateArguments(this, searchString, 'includes')
      .indexOf(searchString, arguments.length > 1 ? arguments[1] : undefined);
  }
});

},{"../internals/correct-is-regexp-logic":17,"../internals/export":27,"../internals/validate-string-method-arguments":88}],106:[function(require,module,exports){
'use strict';
var codePointAt = require('../internals/string-at');
var InternalStateModule = require('../internals/internal-state');
var defineIterator = require('../internals/define-iterator');

var STRING_ITERATOR = 'String Iterator';
var setInternalState = InternalStateModule.set;
var getInternalState = InternalStateModule.getterFor(STRING_ITERATOR);

// `String.prototype[@@iterator]` method
// https://tc39.github.io/ecma262/#sec-string.prototype-@@iterator
defineIterator(String, 'String', function (iterated) {
  setInternalState(this, {
    type: STRING_ITERATOR,
    string: String(iterated),
    index: 0
  });
// `%StringIteratorPrototype%.next` method
// https://tc39.github.io/ecma262/#sec-%stringiteratorprototype%.next
}, function next() {
  var state = getInternalState(this);
  var string = state.string;
  var index = state.index;
  var point;
  if (index >= string.length) return { value: undefined, done: true };
  point = codePointAt(string, index, true);
  state.index += point.length;
  return { value: point, done: false };
});

},{"../internals/define-iterator":22,"../internals/internal-state":41,"../internals/string-at":78}],107:[function(require,module,exports){
'use strict';
var fixRegExpWellKnownSymbolLogic = require('../internals/fix-regexp-well-known-symbol-logic');
var anObject = require('../internals/an-object');
var toLength = require('../internals/to-length');
var requireObjectCoercible = require('../internals/require-object-coercible');
var advanceStringIndex = require('../internals/advance-string-index');
var regExpExec = require('../internals/regexp-exec-abstract');

// @@match logic
fixRegExpWellKnownSymbolLogic('match', 1, function (MATCH, nativeMatch, maybeCallNative) {
  return [
    // `String.prototype.match` method
    // https://tc39.github.io/ecma262/#sec-string.prototype.match
    function match(regexp) {
      var O = requireObjectCoercible(this);
      var matcher = regexp == undefined ? undefined : regexp[MATCH];
      return matcher !== undefined ? matcher.call(regexp, O) : new RegExp(regexp)[MATCH](String(O));
    },
    // `RegExp.prototype[@@match]` method
    // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@match
    function (regexp) {
      var res = maybeCallNative(nativeMatch, regexp, this);
      if (res.done) return res.value;

      var rx = anObject(regexp);
      var S = String(this);

      if (!rx.global) return regExpExec(rx, S);

      var fullUnicode = rx.unicode;
      rx.lastIndex = 0;
      var A = [];
      var n = 0;
      var result;
      while ((result = regExpExec(rx, S)) !== null) {
        var matchStr = String(result[0]);
        A[n] = matchStr;
        if (matchStr === '') rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode);
        n++;
      }
      return n === 0 ? null : A;
    }
  ];
});

},{"../internals/advance-string-index":3,"../internals/an-object":4,"../internals/fix-regexp-well-known-symbol-logic":29,"../internals/regexp-exec-abstract":68,"../internals/require-object-coercible":71,"../internals/to-length":83}],108:[function(require,module,exports){
'use strict';
var fixRegExpWellKnownSymbolLogic = require('../internals/fix-regexp-well-known-symbol-logic');
var anObject = require('../internals/an-object');
var toObject = require('../internals/to-object');
var toLength = require('../internals/to-length');
var toInteger = require('../internals/to-integer');
var requireObjectCoercible = require('../internals/require-object-coercible');
var advanceStringIndex = require('../internals/advance-string-index');
var regExpExec = require('../internals/regexp-exec-abstract');

var max = Math.max;
var min = Math.min;
var floor = Math.floor;
var SUBSTITUTION_SYMBOLS = /\$([$&'`]|\d\d?|<[^>]*>)/g;
var SUBSTITUTION_SYMBOLS_NO_NAMED = /\$([$&'`]|\d\d?)/g;

var maybeToString = function (it) {
  return it === undefined ? it : String(it);
};

// @@replace logic
fixRegExpWellKnownSymbolLogic('replace', 2, function (REPLACE, nativeReplace, maybeCallNative) {
  return [
    // `String.prototype.replace` method
    // https://tc39.github.io/ecma262/#sec-string.prototype.replace
    function replace(searchValue, replaceValue) {
      var O = requireObjectCoercible(this);
      var replacer = searchValue == undefined ? undefined : searchValue[REPLACE];
      return replacer !== undefined
        ? replacer.call(searchValue, O, replaceValue)
        : nativeReplace.call(String(O), searchValue, replaceValue);
    },
    // `RegExp.prototype[@@replace]` method
    // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@replace
    function (regexp, replaceValue) {
      var res = maybeCallNative(nativeReplace, regexp, this, replaceValue);
      if (res.done) return res.value;

      var rx = anObject(regexp);
      var S = String(this);

      var functionalReplace = typeof replaceValue === 'function';
      if (!functionalReplace) replaceValue = String(replaceValue);

      var global = rx.global;
      if (global) {
        var fullUnicode = rx.unicode;
        rx.lastIndex = 0;
      }
      var results = [];
      while (true) {
        var result = regExpExec(rx, S);
        if (result === null) break;

        results.push(result);
        if (!global) break;

        var matchStr = String(result[0]);
        if (matchStr === '') rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode);
      }

      var accumulatedResult = '';
      var nextSourcePosition = 0;
      for (var i = 0; i < results.length; i++) {
        result = results[i];

        var matched = String(result[0]);
        var position = max(min(toInteger(result.index), S.length), 0);
        var captures = [];
        // NOTE: This is equivalent to
        //   captures = result.slice(1).map(maybeToString)
        // but for some reason `nativeSlice.call(result, 1, result.length)` (called in
        // the slice polyfill when slicing native arrays) "doesn't work" in safari 9 and
        // causes a crash (https://pastebin.com/N21QzeQA) when trying to debug it.
        for (var j = 1; j < result.length; j++) captures.push(maybeToString(result[j]));
        var namedCaptures = result.groups;
        if (functionalReplace) {
          var replacerArgs = [matched].concat(captures, position, S);
          if (namedCaptures !== undefined) replacerArgs.push(namedCaptures);
          var replacement = String(replaceValue.apply(undefined, replacerArgs));
        } else {
          replacement = getSubstitution(matched, S, position, captures, namedCaptures, replaceValue);
        }
        if (position >= nextSourcePosition) {
          accumulatedResult += S.slice(nextSourcePosition, position) + replacement;
          nextSourcePosition = position + matched.length;
        }
      }
      return accumulatedResult + S.slice(nextSourcePosition);
    }
  ];

  // https://tc39.github.io/ecma262/#sec-getsubstitution
  function getSubstitution(matched, str, position, captures, namedCaptures, replacement) {
    var tailPos = position + matched.length;
    var m = captures.length;
    var symbols = SUBSTITUTION_SYMBOLS_NO_NAMED;
    if (namedCaptures !== undefined) {
      namedCaptures = toObject(namedCaptures);
      symbols = SUBSTITUTION_SYMBOLS;
    }
    return nativeReplace.call(replacement, symbols, function (match, ch) {
      var capture;
      switch (ch.charAt(0)) {
        case '$': return '$';
        case '&': return matched;
        case '`': return str.slice(0, position);
        case "'": return str.slice(tailPos);
        case '<':
          capture = namedCaptures[ch.slice(1, -1)];
          break;
        default: // \d\d?
          var n = +ch;
          if (n === 0) return match;
          if (n > m) {
            var f = floor(n / 10);
            if (f === 0) return match;
            if (f <= m) return captures[f - 1] === undefined ? ch.charAt(1) : captures[f - 1] + ch.charAt(1);
            return match;
          }
          capture = captures[n - 1];
      }
      return capture === undefined ? '' : capture;
    });
  }
});

},{"../internals/advance-string-index":3,"../internals/an-object":4,"../internals/fix-regexp-well-known-symbol-logic":29,"../internals/regexp-exec-abstract":68,"../internals/require-object-coercible":71,"../internals/to-integer":82,"../internals/to-length":83,"../internals/to-object":84}],109:[function(require,module,exports){
'use strict';
var fixRegExpWellKnownSymbolLogic = require('../internals/fix-regexp-well-known-symbol-logic');
var isRegExp = require('../internals/is-regexp');
var anObject = require('../internals/an-object');
var requireObjectCoercible = require('../internals/require-object-coercible');
var speciesConstructor = require('../internals/species-constructor');
var advanceStringIndex = require('../internals/advance-string-index');
var toLength = require('../internals/to-length');
var callRegExpExec = require('../internals/regexp-exec-abstract');
var regexpExec = require('../internals/regexp-exec');
var fails = require('../internals/fails');

var arrayPush = [].push;
var min = Math.min;
var MAX_UINT32 = 0xFFFFFFFF;

// babel-minify transpiles RegExp('x', 'y') -> /x/y and it causes SyntaxError
var SUPPORTS_Y = !fails(function () { return !RegExp(MAX_UINT32, 'y'); });

// @@split logic
fixRegExpWellKnownSymbolLogic('split', 2, function (SPLIT, nativeSplit, maybeCallNative) {
  var internalSplit;
  if (
    'abbc'.split(/(b)*/)[1] == 'c' ||
    'test'.split(/(?:)/, -1).length != 4 ||
    'ab'.split(/(?:ab)*/).length != 2 ||
    '.'.split(/(.?)(.?)/).length != 4 ||
    '.'.split(/()()/).length > 1 ||
    ''.split(/.?/).length
  ) {
    // based on es5-shim implementation, need to rework it
    internalSplit = function (separator, limit) {
      var string = String(requireObjectCoercible(this));
      var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
      if (lim === 0) return [];
      if (separator === undefined) return [string];
      // If `separator` is not a regex, use native split
      if (!isRegExp(separator)) {
        return nativeSplit.call(string, separator, lim);
      }
      var output = [];
      var flags = (separator.ignoreCase ? 'i' : '') +
                  (separator.multiline ? 'm' : '') +
                  (separator.unicode ? 'u' : '') +
                  (separator.sticky ? 'y' : '');
      var lastLastIndex = 0;
      // Make `global` and avoid `lastIndex` issues by working with a copy
      var separatorCopy = new RegExp(separator.source, flags + 'g');
      var match, lastIndex, lastLength;
      while (match = regexpExec.call(separatorCopy, string)) {
        lastIndex = separatorCopy.lastIndex;
        if (lastIndex > lastLastIndex) {
          output.push(string.slice(lastLastIndex, match.index));
          if (match.length > 1 && match.index < string.length) arrayPush.apply(output, match.slice(1));
          lastLength = match[0].length;
          lastLastIndex = lastIndex;
          if (output.length >= lim) break;
        }
        if (separatorCopy.lastIndex === match.index) separatorCopy.lastIndex++; // Avoid an infinite loop
      }
      if (lastLastIndex === string.length) {
        if (lastLength || !separatorCopy.test('')) output.push('');
      } else output.push(string.slice(lastLastIndex));
      return output.length > lim ? output.slice(0, lim) : output;
    };
  // Chakra, V8
  } else if ('0'.split(undefined, 0).length) {
    internalSplit = function (separator, limit) {
      return separator === undefined && limit === 0 ? [] : nativeSplit.call(this, separator, limit);
    };
  } else internalSplit = nativeSplit;

  return [
    // `String.prototype.split` method
    // https://tc39.github.io/ecma262/#sec-string.prototype.split
    function split(separator, limit) {
      var O = requireObjectCoercible(this);
      var splitter = separator == undefined ? undefined : separator[SPLIT];
      return splitter !== undefined
        ? splitter.call(separator, O, limit)
        : internalSplit.call(String(O), separator, limit);
    },
    // `RegExp.prototype[@@split]` method
    // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@split
    //
    // NOTE: This cannot be properly polyfilled in engines that don't support
    // the 'y' flag.
    function (regexp, limit) {
      var res = maybeCallNative(internalSplit, regexp, this, limit, internalSplit !== nativeSplit);
      if (res.done) return res.value;

      var rx = anObject(regexp);
      var S = String(this);
      var C = speciesConstructor(rx, RegExp);

      var unicodeMatching = rx.unicode;
      var flags = (rx.ignoreCase ? 'i' : '') +
                  (rx.multiline ? 'm' : '') +
                  (rx.unicode ? 'u' : '') +
                  (SUPPORTS_Y ? 'y' : 'g');

      // ^(? + rx + ) is needed, in combination with some S slicing, to
      // simulate the 'y' flag.
      var splitter = new C(SUPPORTS_Y ? rx : '^(?:' + rx.source + ')', flags);
      var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
      if (lim === 0) return [];
      if (S.length === 0) return callRegExpExec(splitter, S) === null ? [S] : [];
      var p = 0;
      var q = 0;
      var A = [];
      while (q < S.length) {
        splitter.lastIndex = SUPPORTS_Y ? q : 0;
        var z = callRegExpExec(splitter, SUPPORTS_Y ? S : S.slice(q));
        var e;
        if (
          z === null ||
          (e = min(toLength(splitter.lastIndex + (SUPPORTS_Y ? 0 : q)), S.length)) === p
        ) {
          q = advanceStringIndex(S, q, unicodeMatching);
        } else {
          A.push(S.slice(p, q));
          if (A.length === lim) return A;
          for (var i = 1; i <= z.length - 1; i++) {
            A.push(z[i]);
            if (A.length === lim) return A;
          }
          q = p = e;
        }
      }
      A.push(S.slice(p));
      return A;
    }
  ];
}, !SUPPORTS_Y);

},{"../internals/advance-string-index":3,"../internals/an-object":4,"../internals/fails":28,"../internals/fix-regexp-well-known-symbol-logic":29,"../internals/is-regexp":47,"../internals/regexp-exec":69,"../internals/regexp-exec-abstract":68,"../internals/require-object-coercible":71,"../internals/species-constructor":77,"../internals/to-length":83}],110:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var toLength = require('../internals/to-length');
var validateArguments = require('../internals/validate-string-method-arguments');
var correctIsRegExpLogic = require('../internals/correct-is-regexp-logic');

var STARTS_WITH = 'startsWith';
var nativeStartsWith = ''[STARTS_WITH];

// `String.prototype.startsWith` method
// https://tc39.github.io/ecma262/#sec-string.prototype.startswith
$({ target: 'String', proto: true, forced: !correctIsRegExpLogic(STARTS_WITH) }, {
  startsWith: function startsWith(searchString /* , position = 0 */) {
    var that = validateArguments(this, searchString, STARTS_WITH);
    var index = toLength(Math.min(arguments.length > 1 ? arguments[1] : undefined, that.length));
    var search = String(searchString);
    return nativeStartsWith
      ? nativeStartsWith.call(that, search, index)
      : that.slice(index, index + search.length) === search;
  }
});

},{"../internals/correct-is-regexp-logic":17,"../internals/export":27,"../internals/to-length":83,"../internals/validate-string-method-arguments":88}],111:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var internalStringTrim = require('../internals/string-trim');
var forcedStringTrimMethod = require('../internals/forced-string-trim-method');

var FORCED = forcedStringTrimMethod('trim');

// `String.prototype.trim` method
// https://tc39.github.io/ecma262/#sec-string.prototype.trim
$({ target: 'String', proto: true, forced: FORCED }, {
  trim: function trim() {
    return internalStringTrim(this, 3);
  }
});

},{"../internals/export":27,"../internals/forced-string-trim-method":30,"../internals/string-trim":79}],112:[function(require,module,exports){
var global = require('../internals/global');
var DOMIterables = require('../internals/dom-iterables');
var forEach = require('../internals/array-for-each');
var hide = require('../internals/hide');

for (var COLLECTION_NAME in DOMIterables) {
  var Collection = global[COLLECTION_NAME];
  var CollectionPrototype = Collection && Collection.prototype;
  // some Chrome versions have non-configurable methods on DOMTokenList
  if (CollectionPrototype && CollectionPrototype.forEach !== forEach) try {
    hide(CollectionPrototype, 'forEach', forEach);
  } catch (error) {
    CollectionPrototype.forEach = forEach;
  }
}

},{"../internals/array-for-each":5,"../internals/dom-iterables":25,"../internals/global":33,"../internals/hide":36}],113:[function(require,module,exports){
"use strict";

require("core-js/modules/es.array.includes");

require("core-js/modules/es.string.includes");

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Traverse_1 = require("./dom/Traverse");

var Observe_1 = require("./data/Observe");

var ElementEvents_1 = require("./etc/ElementEvents");

var Diff_1 = require("./vdom/Diff");

var Hydrate_1 = require("./vdom/Hydrate");

var Polarbear =
/** @class */
function () {
  function Polarbear(params) {
    // Virtual dom
    this.$masterVDom = {};
    this.$currentVDom = {}; // References to document elements that are used for edge cases

    this.$refs = {}; // Filter functions for use with interpolation elements

    this.$filters = {}; // Data properties for instance

    this.$data = {}; // Property watchers for calling functions on property changes

    this.$watchers = {}; // Call created method if it exists
    // Instance has just been created. Nothing else has happened yet

    if (params.created) params.created(); // Get app container selector so that it may be continuous referenced for mounting

    this.$appContainerSel = params.el; // Grab root app element

    this.$appContainerEl = document.querySelector(this.$appContainerSel);
    if (!this.$appContainerEl) console.error("No app container found."); // Create observables for all of the data attributes

    Observe_1.default(this, params.data); // Migrate methods to root level of instance so that they may be easily used

    if (params.methods) {
      for (var method in params.methods) {
        if (params.methods.hasOwnProperty(method)) {
          // Remap created methods to root level
          this[method] = params.methods[method];
        }
      }
    } // Traverse app DOM and copy into VDOM


    this.$masterVDom = Traverse_1.default(this, this.$appContainerEl);
    this.$currentVDom = {}; // Initialize all document level events if they exist

    if (params.events) {
      var _loop_1 = function _loop_1(event_1) {
        if (params.events.hasOwnProperty(event_1) && ElementEvents_1.possibleEventList.includes(event_1)) {
          // Add document level event callbacks for chosen events
          document.addEventListener(event_1, function (e) {
            return params.events[event_1](e);
          });
        } else {
          console.error("Unknown event name: '" + event_1 + "'.");
        }
      };

      for (var event_1 in params.events) {
        _loop_1(event_1);
      }
    } // Copy over filter functions into instance


    if (params.filters) {
      for (var filter in params.filters) {
        if (params.filters.hasOwnProperty(filter)) {
          // Copy filter to the instance
          this.$filters[filter] = params.filters[filter];
        }
      }
    } // Perform initial render


    this.render(); // Initialize property watchers

    if (params.watch) {
      for (var prop in params.watch) {
        if (params.watch.hasOwnProperty(prop)) {
          // Copy the watcher's callback function to the instance
          this.$watchers[prop] = params.watch[prop];
        }
      }
    } // Call mounted method if it exists
    // Instance has finished generation


    if (params.mounted) params.mounted.call(this);
  }

  Polarbear.prototype.render = function () {
    var temp = Hydrate_1.default(this, this.$masterVDom);
    var patch = Diff_1.default(this, this.$currentVDom, temp);
    this.$appContainerEl = patch(this.$appContainerEl);
    this.$currentVDom = temp;
  };

  return Polarbear;
}();

exports.default = Polarbear;
window.Polarbear = Polarbear;

},{"./data/Observe":118,"./dom/Traverse":119,"./etc/ElementEvents":120,"./vdom/Diff":127,"./vdom/Hydrate":128,"core-js/modules/es.array.includes":93,"core-js/modules/es.string.includes":105}],114:[function(require,module,exports){
"use strict";

require("core-js/modules/es.array.includes");

require("core-js/modules/es.string.includes");

require("core-js/modules/es.string.trim");

Object.defineProperty(exports, "__esModule", {
  value: true
});

var DataFns_1 = require("../data/DataFns");

function computeBinding(instance, prop, modifiers) {
  // Decide whether to bind the value on the element's input or change event
  var eventName = "input";
  if (modifiers.includes("lazy")) eventName = "change"; // Decide whether to return the element's value as a number

  var returnAsNumber = false;
  if (modifiers.includes("number")) returnAsNumber = true; // Decide whether to trim the element's value

  var trimReturnValue = false;
  if (modifiers.includes("trim")) trimReturnValue = true; // Return generated event

  return {
    eventName: eventName,
    fn: function fn(e) {
      // Retrieve element value from event's target element
      var elementValue = e.target.value; // Parse value to number if the bindval has 'number' flag

      elementValue = returnAsNumber ? isNaN(parseFloat(elementValue)) ? elementValue : parseFloat(elementValue) : elementValue; // Trim string if the bindval has 'trim' flag

      elementValue = trimReturnValue ? elementValue.trim() : elementValue; // Update the property on the instance

      DataFns_1.setProp(instance, prop, elementValue);
    }
  };
}

exports.default = computeBinding;

},{"../data/DataFns":117,"core-js/modules/es.array.includes":93,"core-js/modules/es.string.includes":105,"core-js/modules/es.string.trim":111}],115:[function(require,module,exports){
"use strict";

require("core-js/modules/es.array.includes");

require("core-js/modules/es.array.join");

require("core-js/modules/es.array.splice");

require("core-js/modules/es.number.constructor");

require("core-js/modules/es.object.keys");

require("core-js/modules/es.string.includes");

require("core-js/modules/es.string.split");

require("core-js/modules/web.dom-collections.for-each");

Object.defineProperty(exports, "__esModule", {
  value: true
});

var KeyCodes_1 = require("../etc/KeyCodes");

var ElementEvents_1 = require("../etc/ElementEvents");

var CodeParser_1 = require("../parser/CodeParser");

function computeEvent(instance, event, callbackFn) {
  // Split raw event into its name and possible modifiers
  var eventComponents = event.split(".");
  var eventName = eventComponents[0];
  var eventModifiers = eventComponents.splice(1); // Check for valid event name before attempting to add it to an element

  if (!ElementEvents_1.possibleEventList.includes(eventName)) {
    console.error("Unknown event name: '" + eventName + "'.");
    return;
  } // Get list of common keys that we want to reference by name instead of keycodes


  var commonKeyCodeNames = Object.keys(KeyCodes_1.keyCodes); // Get the list of other event modifiers that we want to check for

  var otherEventModifiers = {
    "capture": false,
    "passive": false,
    "prevent": false,
    "once": false
  }; // List of conditional evaluations that will be joined together to check within the event callback

  var conditionalChecks = []; // Iterate over event modifiers and compute their responsibility

  eventModifiers.forEach(function (em) {
    if (Object.keys(otherEventModifiers).includes(em)) {
      // Change modifier to true if it is a present modifier
      otherEventModifiers[em] = true;
    } else if (commonKeyCodeNames.includes(em)) {
      // Add the resolved key-code value to the conditional checks
      conditionalChecks.push("$event.keyCode === " + KeyCodes_1.keyCodes[em]);
    } else {
      // Attempt to convert the modifier to a number
      var parsedModifier = Number(em);

      if (!isNaN(parsedModifier)) {
        // If the modifier is a valid number, add it as a key-code conditional check
        conditionalChecks.push("$event.keyCode === " + parsedModifier);
      } else {
        // If not then just add the literal key value to a key conditional check
        conditionalChecks.push("$event.key === '" + em + "'");
      }
    }
  }); // Create a conditional string to evaluate within the function call before evaluating actual code

  var conditionalRule = "if (!(" + conditionalChecks.join("||") + ")) { return; }"; // Parse the received code into usable code for the event listener

  var finalCode = CodeParser_1.parse(instance, callbackFn); // Return generated event

  return {
    eventName: eventName,
    fn: function fn(e) {
      // Create strict evaluated function call
      return Function("\n      \"use strict\";\n      const $event = arguments[0];\n      " + (otherEventModifiers["prevent"] ? "$event.preventDefault();" : "") + "\n      " + (conditionalChecks.length > 0 ? conditionalRule : "") + "\n      " + finalCode + "\n      ").call(instance, e);
    },
    otherEventModifiers: otherEventModifiers
  };
}

exports.default = computeEvent;

},{"../etc/ElementEvents":120,"../etc/KeyCodes":121,"../parser/CodeParser":125,"core-js/modules/es.array.includes":93,"core-js/modules/es.array.join":94,"core-js/modules/es.array.splice":97,"core-js/modules/es.number.constructor":99,"core-js/modules/es.object.keys":102,"core-js/modules/es.string.includes":105,"core-js/modules/es.string.split":109,"core-js/modules/web.dom-collections.for-each":112}],116:[function(require,module,exports){
"use strict";

require("core-js/modules/es.object.entries");

require("core-js/modules/es.object.keys");

require("core-js/modules/es.string.split");

require("core-js/modules/es.string.trim");

Object.defineProperty(exports, "__esModule", {
  value: true
});

var DataFns_1 = require("../data/DataFns");

var ResolveType_1 = require("../etc/ResolveType");

var NormalizeString_1 = require("../etc/NormalizeString");

function computeLoop(instance, statement) {
  var loopComponents = statement.split(/\sin\s/);

  if (loopComponents.length > 1) {
    var specifics = loopComponents[0].trim().split(",");
    var iterableName = loopComponents[1].trim();
    var iterable = DataFns_1.getProp(instance.$data, iterableName) || iterableName;
    var keyName = void 0,
        valName = void 0,
        idxName = void 0,
        count = void 0;
    var type = ResolveType_1.default(iterable);

    if (specifics.length === 1) {
      keyName = NormalizeString_1.default(specifics[0]);
    } else if (specifics.length === 2) {
      keyName = NormalizeString_1.default(specifics[0]);
      idxName = NormalizeString_1.default(specifics[1]);
    } else if (specifics.length === 3) {
      keyName = NormalizeString_1.default(specifics[0]);
      valName = NormalizeString_1.default(specifics[1]);
      idxName = NormalizeString_1.default(specifics[2]);
    } else {
      console.error("Unable to parse loop statement: '" + statement + "'.");
    }

    switch (type) {
      case "array":
        count = iterable.length;
        break;

      case "object":
        iterable = Object.entries(iterable);
        count = Object.keys(iterable).length;
        break;

      case "number":
        count = parseInt(iterable);
        break;

      default:
        console.error("Unknown iterable type for '" + iterableName + "'.");
        break;
    }

    return {
      keyName: keyName,
      valName: valName,
      idxName: idxName,
      iterable: iterable,
      count: count,
      type: type
    };
  } else {
    console.error("Unable to parse loop statement: '" + statement + "'.");
  }
}

exports.default = computeLoop;

},{"../data/DataFns":117,"../etc/NormalizeString":122,"../etc/ResolveType":124,"core-js/modules/es.object.entries":101,"core-js/modules/es.object.keys":102,"core-js/modules/es.string.split":109,"core-js/modules/es.string.trim":111}],117:[function(require,module,exports){
"use strict";

require("core-js/modules/es.string.split");

Object.defineProperty(exports, "__esModule", {
  value: true
}); // https://github.com/lukeed/dset

exports.setProp = function (obj, keys, val) {
  keys.split && (keys = keys.split("."));
  var i = 0,
      l = keys.length,
      t = obj,
      x;

  for (; i < l; ++i) {
    x = t[keys[i]];
    t = t[keys[i]] = i === l - 1 ? val : x != null ? x : !!~keys[i + 1].indexOf(".") || !(+keys[i + 1] > -1) ? {} : [];
  }
}; // https://github.com/developit/dlv


exports.getProp = function (obj, key, def, p) {
  p = 0;
  key = key.split ? key.split(".") : key;

  while (obj && p < key.length) {
    obj = obj[key[p++]];
  }

  return obj === undefined || p < key.length ? def : obj;
};

},{"core-js/modules/es.string.split":109}],118:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var DataFns_1 = require("./DataFns");

function observe(instance, obj, parent) {
  var _loop_1 = function _loop_1(prop) {
    if (obj.hasOwnProperty(prop)) {
      // Remap property path if it is a nested property
      var propPath_1 = parent ? parent + "." + prop : prop; // Retrieve property value from its original object

      var propertyVal = DataFns_1.getProp(obj, prop); // Get the literal type of the retrieved property

      var valueType = propertyVal.constructor;

      if (valueType === Object) {
        // Set property to be empty object since its children will need to be separately observed
        DataFns_1.setProp(instance.$data, propPath_1, {});
        DataFns_1.setProp(instance, propPath_1, {}); // Observe child properties of object

        observe(instance, propertyVal, propPath_1);
      } else if (valueType === Array) {
        // Store reference array in instance data property
        DataFns_1.setProp(instance.$data, propPath_1, propertyVal);
        var arrProxy = new Proxy(DataFns_1.getProp(instance.$data, propPath_1), {
          get: function get(target, property) {
            // Now that the value has been updated we want to call the watcher if it exists
            if (instance.$watchers[propPath_1]) {
              // Pass through the instance reference and the property's old value
              instance.$watchers[propPath_1].apply(instance, [target]);
            }

            return target[property];
          },
          // Proxy trap for updating or adding values
          set: function set(target, property, value) {
            target[property] = value;
            instance.render();
            return true;
          }
        }); // Set array proxy to actual root property so that proxy traps are triggered on property reference

        DataFns_1.setProp(instance, propPath_1, arrProxy);
      } else {
        // Store reference property on instance data property
        DataFns_1.setProp(instance.$data, propPath_1, propertyVal); // Set property on root of instance or on child object of instance root

        var definitionLocation = parent ? DataFns_1.getProp(instance, parent) : instance; // Define property getters and setters on instance

        Object.defineProperty(definitionLocation, prop, {
          get: function get() {
            // Retrieve value from alternative reference so that there is not an infinite loop
            return DataFns_1.getProp(instance.$data, propPath_1);
          },
          set: function set(v) {
            // Get the property's previous value before reassigning it
            var oldVal = DataFns_1.getProp(instance.$data, propPath_1); // Set alternative reference so that there is not an infinite loop

            DataFns_1.setProp(instance.$data, propPath_1, v); // Now that the value has been updated we want to call the watcher if it exists

            if (instance.$watchers[propPath_1]) {
              // Pass through the instance reference and the property's old value and new value
              instance.$watchers[propPath_1].apply(instance, [oldVal, v]);
            }

            instance.render();
          }
        });
      }
    }
  };

  for (var prop in obj) {
    _loop_1(prop);
  }
}

exports.default = observe;
;

},{"./DataFns":117}],119:[function(require,module,exports){
"use strict";

require("core-js/modules/es.array.from");

require("core-js/modules/es.array.slice");

require("core-js/modules/es.function.name");

require("core-js/modules/es.string.iterator");

require("core-js/modules/es.string.replace");

require("core-js/modules/es.string.split");

require("core-js/modules/es.string.starts-with");

require("core-js/modules/web.dom-collections.for-each");

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Regexes_1 = require("../etc/Regexes");

var CreateElement_1 = require("../vdom/CreateElement");

var DataFns_1 = require("../data/DataFns");

function traverse(instance, node) {
  var attrs = {};
  var events = {};
  var conditionalCase = "";
  var loopCase = "";
  var boundData = {};
  var refName = "";
  var children = [];
  Array.from(node.childNodes).forEach(function (e) {
    if (e.nodeType === 1) {
      children.push(traverse(instance, e));
    } else {
      children.push(e.data);
    }
  });

  for (var i = 0; i < node.attributes.length; i++) {
    var _a = node.attributes[i],
        name_1 = _a.name,
        value = _a.value;

    if (name_1.startsWith("@")) {
      // Process event attributes
      var ev = name_1.slice(1);
      events[ev] = value;
    } else if (name_1.startsWith("bindval")) {
      // Process value binding attribute
      var specs = name_1.split(".");
      boundData = {
        prop: value,
        opts: specs.slice(1)
      };
    } else if (name_1 === "loopfor") {
      // Process loop attribute
      loopCase = String(value);
    } else if (name_1 === "ref") {
      // Process reference attribute
      refName = String(value);
    } else if (name_1 === "showif") {
      // Process conditional if attribute
      var computedCondition = value.replace(Regexes_1.Regexes.interpolationContent, function (s) {
        return DataFns_1.getProp(instance.$data, s) !== undefined ? "this." + s : s;
      });
      conditionalCase = computedCondition;
    } else if (name_1 === "showelse") {
      // Process conditional else attribute
      // @ts-ignore
      var computedCondition = node.previousElementSibling.attributes["showif"].value.replace(Regexes_1.Regexes.interpolationContent, function (s) {
        return DataFns_1.getProp(instance.$data, s) !== undefined ? "this." + s : s;
      });
      conditionalCase = "!(" + computedCondition + ")";
    } else {
      // Found no matching attributes related to Polarbear
      attrs[name_1] = value;
    }
  }

  return CreateElement_1.default(node.tagName, {
    attrs: attrs,
    events: events,
    conditionalCase: conditionalCase,
    loopCase: loopCase,
    boundData: boundData,
    refName: refName,
    children: children
  });
}

exports.default = traverse;
;

},{"../data/DataFns":117,"../etc/Regexes":123,"../vdom/CreateElement":126,"core-js/modules/es.array.from":92,"core-js/modules/es.array.slice":96,"core-js/modules/es.function.name":98,"core-js/modules/es.string.iterator":106,"core-js/modules/es.string.replace":108,"core-js/modules/es.string.split":109,"core-js/modules/es.string.starts-with":110,"core-js/modules/web.dom-collections.for-each":112}],120:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
}); // https://developer.mozilla.org/en-US/docs/Web/Events

exports.possibleEventList = ["input", "change", "cached", "error", "abort", "load", "beforeunload", "unload", "online", "offline", "focus", "blur", "animationstart", "animationend", "animationiteration", "transitionstart", "transitioncancel", "transitionend", "transitionrun", "reset", "submit", "resize", "scroll", "cut", "copy", "paste", "keydown", "keypress", "keyup", "mouseenter", "mouseover", "mousemove", "mousedown", "mouseup", "auxclick", "click", "dblclick", "contextmenu", "wheel", "mouseleave", "mouseout", "select", "dragstart", "drag", "dragend", "dragenter", "dragover", "dragleave", "drop", "durationchange", "loadedmetadata", "loadeddata", "canplay", "canplaythrough", "ended", "emptied", "stalled", "suspend", "play", "playing", "pause", "waiting", "seeking", "seeked", "ratechange", "timeupdate", "volumechange", "complete", "audioprocess"];

},{}],121:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
}); // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode

exports.keyCodes = {
  "backspace": 8,
  "delete": 46,
  "down": 40,
  "enter": 13,
  "left": 37,
  "right": 39,
  "space": 32,
  "tab": 9,
  "up": 38,
  "esc": 27
};

},{}],122:[function(require,module,exports){
"use strict";

require("core-js/modules/es.string.replace");

require("core-js/modules/es.string.trim");

Object.defineProperty(exports, "__esModule", {
  value: true
});
/*
 * Strips whitespace and removes any characters besides alphanumeric characters, '$', '_'
 * */

function normalizeString(s) {
  return s.replace(/[^A-z0-9_$]/g, "").trim();
}

exports.default = normalizeString;

},{"core-js/modules/es.string.replace":108,"core-js/modules/es.string.trim":111}],123:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var Regexes;

(function (Regexes) {
  /*
   * Matches interpolation content (mustache syntax)
   *
   * Input:
   * `Some content with interpolation content... {{age + 10}}. Some other content {{favColor}}`
   *
   * Match:
   * {{age + 10}}
   */
  Regexes.interpolation = /({{.*?}})/;
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

  Regexes.globalInterpolation = /({{.*?}})/g;
  /*
   * Matches first found property or function inside interpolation matches
   *
   * Input:
   * `{{sayHello() + name}}`
   *
   * Match:
   * sayHello
   */

  Regexes.innerInterpolation = /[\w\.]+/;
  /*
   * Matches only functions in inside interpolation matches
   *
   * Input:
   * `{{sayHello() + name}}`
   *
   * Match:
   * sayHello()
   */

  Regexes.innerFunctionInterpolation = /\w+\([A-z$_]+\)/;
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

  Regexes.interpolationContent = /[A-z]+((\.\w+)+)?(?=([^'\\]*(\\.|'([^'\\]*\\.)*[^'\\]*'))*[^']*$)/g;
  /*
   * Matches filters in interpolation matches
   *
   * Input:
   * `{{sayHello() + name | upper | reverse}}`
   *
   * Matches:
   * | upper | reverse
   */

  Regexes.filtersMatch = /(\|)(\s+)?\w+(\.\w+)?(.*)?\b(?=([^'\\]*(\\.|'([^'\\]*\\.)*[^'\\]*'))*[^']*$)/;
})(Regexes = exports.Regexes || (exports.Regexes = {}));

},{}],124:[function(require,module,exports){
"use strict";

require("core-js/modules/es.object.to-string");

require("core-js/modules/es.regexp.to-string");

Object.defineProperty(exports, "__esModule", {
  value: true
});
/*
 * Resolves a variable type
 * */

function resolveType(o) {
  if (o !== undefined && o.toString() === "[object Object]") {
    return "object";
  } else if (Array.isArray(o)) {
    return "array";
  } else if (!isNaN(o + 0)) {
    return "number";
  } else {
    return "string";
  }
}

exports.default = resolveType;

},{"core-js/modules/es.object.to-string":103,"core-js/modules/es.regexp.to-string":104}],125:[function(require,module,exports){
"use strict";

require("core-js/modules/es.string.match");

require("core-js/modules/es.string.replace");

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Regexes_1 = require("../etc/Regexes");

exports.parse = function (instance, code) {
  return code.replace(Regexes_1.Regexes.innerInterpolation, function (func) {
    // Check if the function already has call parameters
    var hasCall = code.match(Regexes_1.Regexes.innerFunctionInterpolation);

    if (instance[func]) {
      // Return usable function call if function exists in instance
      return hasCall ? "this." + func : "this." + func + "()";
    } else {
      // Return original function call if function is not related to instance
      return func;
    }
  });
};

},{"../etc/Regexes":123,"core-js/modules/es.string.match":107,"core-js/modules/es.string.replace":108}],126:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function createEl(tagName, _a) {
  var _b = _a.attrs,
      attrs = _b === void 0 ? {} : _b,
      _c = _a.events,
      events = _c === void 0 ? {} : _c,
      _d = _a.conditionalCase,
      conditionalCase = _d === void 0 ? "" : _d,
      _e = _a.loopCase,
      loopCase = _e === void 0 ? "" : _e,
      _f = _a.boundData,
      boundData = _f === void 0 ? {} : _f,
      _g = _a.refName,
      refName = _g === void 0 ? "" : _g,
      _h = _a.children,
      children = _h === void 0 ? [] : _h;
  return {
    tagName: tagName,
    attrs: attrs,
    events: events,
    conditionalCase: conditionalCase,
    loopCase: loopCase,
    boundData: boundData,
    refName: refName,
    children: children
  };
}

exports.default = createEl;

},{}],127:[function(require,module,exports){
"use strict";
/*
 * Code adapted from: https://github.com/ycmjason-talks/2018-11-21-manc-web-meetup-4
 * */

require("core-js/modules/es.array.slice");

require("core-js/modules/es.object.assign");

require("core-js/modules/es.object.entries");

require("core-js/modules/web.dom-collections.for-each");

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Render_1 = require("./Render");

var CreateElement_1 = require("./CreateElement");

var zip = function zip(xs, ys) {
  var zipped = [];

  for (var i = 0; i < Math.max(xs.length, ys.length); i++) {
    zipped.push([xs[i], ys[i]]);
  }

  return zipped;
};

var diffAttrs = function diffAttrs(oldAttrs, newAttrs) {
  var patches = [];
  var attrs = Object.assign(oldAttrs, newAttrs);

  var _loop_1 = function _loop_1(k, v) {
    patches.push(function ($node) {
      $node.setAttribute(k, v);
      return $node;
    });
  }; // set new attributes


  for (var _i = 0, _a = Object.entries(attrs); _i < _a.length; _i++) {
    var _b = _a[_i],
        k = _b[0],
        v = _b[1];

    _loop_1(k, v);
  }

  return function ($node) {
    for (var _i = 0, patches_1 = patches; _i < patches_1.length; _i++) {
      var patch = patches_1[_i];
      patch($node);
    }
  };
};

var diffChildren = function diffChildren(instance, oldVChildren, newVChildren) {
  var childPatches = [];
  oldVChildren.forEach(function (oldVChild, i) {
    childPatches.push(diff(instance, oldVChild, newVChildren[i]));
  });
  var additionalPatches = [];

  var _loop_2 = function _loop_2(additionalVChild) {
    additionalPatches.push(function ($node) {
      $node.appendChild(Render_1.render(instance, additionalVChild));
      return $node;
    });
  };

  for (var _i = 0, _a = newVChildren.slice(oldVChildren.length); _i < _a.length; _i++) {
    var additionalVChild = _a[_i];

    _loop_2(additionalVChild);
  }

  return function ($parent) {
    for (var _i = 0, _a = zip(childPatches, $parent.childNodes); _i < _a.length; _i++) {
      var _b = _a[_i],
          patch = _b[0],
          child = _b[1];

      if (patch !== undefined && child !== undefined) {
        patch(child);
      }
    }

    for (var _c = 0, additionalPatches_1 = additionalPatches; _c < additionalPatches_1.length; _c++) {
      var patch = additionalPatches_1[_c];
      patch($parent);
    }

    return $parent;
  };
};

function diff(instance, vOldNode, vNewNode) {
  if (vNewNode === undefined) {
    return function ($node) {
      $node.remove();
      return undefined;
    };
  }

  if (typeof vOldNode === "string" || typeof vNewNode === "string") {
    if (vOldNode !== vNewNode) {
      return function ($node) {
        var $newNode = Render_1.render(instance, vNewNode);
        $node.replaceWith($newNode);
        return $newNode;
      };
    } else {
      return function ($node) {
        return undefined;
      };
    }
  }

  if (vOldNode.tagName !== vNewNode.tagName) {
    return function ($node) {
      var $newNode = Render_1.render(instance, vNewNode);
      $node.replaceWith($newNode);
      return $newNode;
    };
  }

  if (vNewNode.conditionalCase !== "") {
    return function ($node) {
      var $newNode = Render_1.render(instance, vNewNode);

      if ($node.nodeType !== $newNode.nodeType) {
        $node.replaceWith($newNode);
        return $newNode;
      }
    };
  }

  if (vNewNode.loopCase !== vOldNode.loopCase) {
    var $newNode_1 = Render_1.renderElem(instance, CreateElement_1.default(vNewNode.tagName, {
      loopCase: undefined,
      children: Render_1.render(instance, vNewNode)
    }));
    return function ($node) {
      $node.replaceWith($newNode_1);
      return $newNode_1;
    };
  }

  var patchAttrs = diffAttrs(vOldNode.attrs, vNewNode.attrs);
  var patchChildren = diffChildren(instance, vOldNode.children, vNewNode.children);
  return function ($node) {
    if ($node.nodeType === 1) {
      patchAttrs($node);
      patchChildren($node);
    }

    return $node;
  };
}

exports.default = diff;
;

},{"./CreateElement":126,"./Render":129,"core-js/modules/es.array.slice":96,"core-js/modules/es.object.assign":100,"core-js/modules/es.object.entries":101,"core-js/modules/web.dom-collections.for-each":112}],128:[function(require,module,exports){
"use strict";

require("core-js/modules/es.array.filter");

require("core-js/modules/es.array.from");

require("core-js/modules/es.array.map");

require("core-js/modules/es.string.iterator");

require("core-js/modules/es.string.match");

require("core-js/modules/es.string.replace");

require("core-js/modules/es.string.split");

require("core-js/modules/es.string.trim");

require("core-js/modules/web.dom-collections.for-each");

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Regexes_1 = require("../etc/Regexes");

var CreateElement_1 = require("./CreateElement");

var Loopfor_1 = require("../attributes/Loopfor");

var DataFns_1 = require("../data/DataFns");

var ResolveType_1 = require("../etc/ResolveType");

var filtersMatch = Regexes_1.Regexes.filtersMatch;

var NormalizeString_1 = require("../etc/NormalizeString");

function hydrate(instance, node, extraData) {
  var nodeCopy = JSON.parse(JSON.stringify(node));
  var data = instance.$data;
  var newRootChildren = [];
  nodeCopy.children.map(function (e) {
    if (typeof e !== "string" && e.loopCase) {
      var tagName_1 = e.tagName,
          _a = e.attrs,
          attrs_1 = _a === void 0 ? {} : _a,
          _b = e.events,
          events_1 = _b === void 0 ? {} : _b,
          conditionalCase_1 = e.conditionalCase,
          loopCase = e.loopCase,
          boundData_1 = e.boundData,
          refName_1 = e.refName,
          _c = e.children,
          children_1 = _c === void 0 ? [] : _c;

      var _d = Loopfor_1.default(instance, loopCase),
          keyName_1 = _d.keyName,
          valName_1 = _d.valName,
          idxName_1 = _d.idxName,
          iterable_1 = _d.iterable,
          count = _d.count,
          type_1 = _d.type;

      var newChildren = Array.from(new Array(count), function (v, j) {
        var _a;

        return CreateElement_1.default(tagName_1, {
          attrs: attrs_1,
          events: events_1,
          conditionalCase: conditionalCase_1,
          loopCase: null,
          boundData: boundData_1,
          refName: null,
          children: [hydrate(instance, {
            tagName: tagName_1,
            attrs: attrs_1,
            events: events_1,
            conditionalCase: conditionalCase_1,
            loopCase: null,
            boundData: boundData_1,
            refName: refName_1,
            children: children_1
          }, (_a = {}, _a[keyName_1 || "$KEYNAME"] = type_1 === "array" ? iterable_1[j] : type_1 === "object" ? iterable_1[j][0] : j, _a[valName_1 || "$VALNAME"] = type_1 === "array" ? null : type_1 === "object" ? iterable_1[j][1] : j, _a[idxName_1 || "$IDXNAME"] = j, _a))]
        });
      });
      newRootChildren.push.apply(newRootChildren, newChildren);
    } else {
      if (ResolveType_1.default(e) === "object") {
        newRootChildren.push(hydrate(instance, e, extraData));
      } else {
        var _e = computeContent(instance, e),
            parsed = _e.parsed,
            filters = _e.filters;

        var finalContent_1 = "";
        finalContent_1 = Function("\n            \"use strict\";\n            const $EXTRA_DATA = arguments[0];\n            return `" + parsed + "`;\n            ").call(data, extraData || {});
        filters.forEach(function (f) {
          finalContent_1 = Function("\n            \"use strict\";\n            return this." + f + "(`" + finalContent_1 + "`);\n            ").call(instance.$filters);
        });
        newRootChildren.push(finalContent_1);
      }
    }
  });
  nodeCopy.children = newRootChildren;
  return nodeCopy;
}

exports.default = hydrate;

var computeContent = function computeContent(instance, content) {
  // Attempt to find interpolation calls within an elements text content
  var interpolationMatches = content.match(Regexes_1.Regexes.globalInterpolation);
  var filters = []; // If there is no interpolation calls then just break out

  if (!interpolationMatches) {
    return {
      parsed: content,
      filters: filters
    };
  }

  for (var i = 0; i < interpolationMatches.length; i++) {
    // Replace every interpolation call with its computed evaluation
    content = content.replace(interpolationMatches[i], function (cur) {
      // Strip out the filters if they exist
      var filterStr = cur.match(filtersMatch);
      cur = filterStr ? cur.replace(filtersMatch, "") : cur;

      if (filterStr) {
        filters = filterStr[0].trim().split("|").map(function (s) {
          return NormalizeString_1.default(s);
        }).filter(function (e) {
          return e !== "";
        });
      } // Replace each property or function call within the interpolation with a reference to the instance


      var innerContent = cur.replace(Regexes_1.Regexes.interpolationContent, function (s) {
        if (DataFns_1.getProp(instance.$data, s) !== undefined) {
          return "this." + s;
        } else if (DataFns_1.getProp(window, s) !== undefined) {
          return s;
        } else {
          return "$EXTRA_DATA." + s;
        }
      });
      return innerContent.replace("{{", "${").replace("}}", "}");
    });
  }

  return {
    parsed: content,
    filters: filters
  };
};

},{"../attributes/Loopfor":116,"../data/DataFns":117,"../etc/NormalizeString":122,"../etc/Regexes":123,"../etc/ResolveType":124,"./CreateElement":126,"core-js/modules/es.array.filter":91,"core-js/modules/es.array.from":92,"core-js/modules/es.array.map":95,"core-js/modules/es.string.iterator":106,"core-js/modules/es.string.match":107,"core-js/modules/es.string.replace":108,"core-js/modules/es.string.split":109,"core-js/modules/es.string.trim":111,"core-js/modules/web.dom-collections.for-each":112}],129:[function(require,module,exports){
"use strict";

require("core-js/modules/es.object.entries");

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Events_1 = require("../attributes/Events");

var DataFns_1 = require("../data/DataFns");

var Bindval_1 = require("../attributes/Bindval");

exports.renderElem = function (instance, _a) {
  var tagName = _a.tagName,
      _b = _a.attrs,
      attrs = _b === void 0 ? {} : _b,
      _c = _a.events,
      events = _c === void 0 ? {} : _c,
      conditionalCase = _a.conditionalCase,
      boundData = _a.boundData,
      refName = _a.refName,
      _d = _a.children,
      children = _d === void 0 ? [] : _d; // Evaluate conditional statement for the element

  var conditionalEval = Boolean(Function("\"use strict\";return " + conditionalCase + ";").call(instance)); // Create a comment element if the conditional statement is false

  if (conditionalCase && conditionalEval === false) {
    return document.createComment(" ");
  } // Create a base element with specified tag type


  var $el = document.createElement(tagName); // Add element attributes

  for (var _i = 0, _e = Object.entries(attrs); _i < _e.length; _i++) {
    var _f = _e[_i],
        k = _f[0],
        v = _f[1];
    $el.setAttribute(k, v);
  } // Add element events


  for (var _g = 0, _h = Object.entries(events); _g < _h.length; _g++) {
    var _j = _h[_g],
        k = _j[0],
        v = _j[1];

    var _k = Events_1.default(instance, k, v),
        eventName = _k.eventName,
        fn = _k.fn,
        otherEventModifiers = _k.otherEventModifiers;

    $el.addEventListener(eventName, fn, otherEventModifiers);
  } // Render and append element children


  for (var _l = 0, children_1 = children; _l < children_1.length; _l++) {
    var child = children_1[_l];
    var $child = exports.render(instance, child);
    $el.appendChild($child);
  }

  if (boundData && $el instanceof HTMLInputElement) {
    var prop = boundData.prop,
        opts = boundData.opts;
    $el.value = DataFns_1.getProp(instance, prop);

    var _m = Bindval_1.default(instance, prop, opts),
        eventName = _m.eventName,
        fn = _m.fn;

    $el.addEventListener(eventName, fn);
  }

  if (refName) {
    instance.$refs[refName] = $el;
  } // Return the created element


  return $el;
};

exports.render = function (instance, vNode) {
  if (typeof vNode === "string") {
    return document.createTextNode(vNode);
  }

  return exports.renderElem(instance, vNode);
};

},{"../attributes/Bindval":114,"../attributes/Events":115,"../data/DataFns":117,"core-js/modules/es.object.entries":101}]},{},[113])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvYS1mdW5jdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9hZGQtdG8tdW5zY29wYWJsZXMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvYWR2YW5jZS1zdHJpbmctaW5kZXguanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvYW4tb2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2FycmF5LWZvci1lYWNoLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2FycmF5LWZyb20uanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvYXJyYXktaW5jbHVkZXMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvYXJyYXktbWV0aG9kLWhhcy1zcGVjaWVzLXN1cHBvcnQuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvYXJyYXktbWV0aG9kcy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9hcnJheS1zcGVjaWVzLWNyZWF0ZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9iaW5kLWNvbnRleHQuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvY2FsbC13aXRoLXNhZmUtaXRlcmF0aW9uLWNsb3NpbmcuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvY2hlY2stY29ycmVjdG5lc3Mtb2YtaXRlcmF0aW9uLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2NsYXNzb2YtcmF3LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2NsYXNzb2YuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvY29weS1jb25zdHJ1Y3Rvci1wcm9wZXJ0aWVzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2NvcnJlY3QtaXMtcmVnZXhwLWxvZ2ljLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2NvcnJlY3QtcHJvdG90eXBlLWdldHRlci5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9jcmVhdGUtaXRlcmF0b3ItY29uc3RydWN0b3IuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvY3JlYXRlLXByb3BlcnR5LWRlc2NyaXB0b3IuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvY3JlYXRlLXByb3BlcnR5LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2RlZmluZS1pdGVyYXRvci5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9kZXNjcmlwdG9ycy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9kb2N1bWVudC1jcmVhdGUtZWxlbWVudC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9kb20taXRlcmFibGVzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2VudW0tYnVnLWtleXMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvZXhwb3J0LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2ZhaWxzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2ZpeC1yZWdleHAtd2VsbC1rbm93bi1zeW1ib2wtbG9naWMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvZm9yY2VkLXN0cmluZy10cmltLW1ldGhvZC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9mdW5jdGlvbi10by1zdHJpbmcuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvZ2V0LWl0ZXJhdG9yLW1ldGhvZC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9nbG9iYWwuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvaGFzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2hpZGRlbi1rZXlzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2hpZGUuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvaHRtbC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9pZTgtZG9tLWRlZmluZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9pbmRleGVkLW9iamVjdC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9pbmhlcml0LWlmLXJlcXVpcmVkLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2ludGVybmFsLXN0YXRlLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2lzLWFycmF5LWl0ZXJhdG9yLW1ldGhvZC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9pcy1hcnJheS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9pcy1mb3JjZWQuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvaXMtb2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2lzLXB1cmUuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvaXMtcmVnZXhwLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2l0ZXJhdG9ycy1jb3JlLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL25hdGl2ZS1zeW1ib2wuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvbmF0aXZlLXdlYWstbWFwLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL29iamVjdC1hc3NpZ24uanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvb2JqZWN0LWNyZWF0ZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9vYmplY3QtZGVmaW5lLXByb3BlcnRpZXMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvb2JqZWN0LWRlZmluZS1wcm9wZXJ0eS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9vYmplY3QtZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL29iamVjdC1nZXQtb3duLXByb3BlcnR5LW5hbWVzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL29iamVjdC1nZXQtb3duLXByb3BlcnR5LXN5bWJvbHMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvb2JqZWN0LWdldC1wcm90b3R5cGUtb2YuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvb2JqZWN0LWtleXMtaW50ZXJuYWwuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvb2JqZWN0LWtleXMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvb2JqZWN0LXByb3BlcnR5LWlzLWVudW1lcmFibGUuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvb2JqZWN0LXNldC1wcm90b3R5cGUtb2YuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvb2JqZWN0LXRvLWFycmF5LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL29iamVjdC10by1zdHJpbmcuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvb3duLWtleXMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvcmVkZWZpbmUuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvcmVnZXhwLWV4ZWMtYWJzdHJhY3QuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvcmVnZXhwLWV4ZWMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvcmVnZXhwLWZsYWdzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL3JlcXVpcmUtb2JqZWN0LWNvZXJjaWJsZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9zZXQtZ2xvYmFsLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL3NldC10by1zdHJpbmctdGFnLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL3NoYXJlZC1rZXkuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvc2hhcmVkLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL3Nsb3BweS1hcnJheS1tZXRob2QuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvc3BlY2llcy1jb25zdHJ1Y3Rvci5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9zdHJpbmctYXQuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvc3RyaW5nLXRyaW0uanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvdG8tYWJzb2x1dGUtaW5kZXguanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvdG8taW5kZXhlZC1vYmplY3QuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvdG8taW50ZWdlci5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy90by1sZW5ndGguanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvdG8tb2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL3RvLXByaW1pdGl2ZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy91aWQuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvdmFsaWRhdGUtc2V0LXByb3RvdHlwZS1vZi1hcmd1bWVudHMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvdmFsaWRhdGUtc3RyaW5nLW1ldGhvZC1hcmd1bWVudHMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvd2VsbC1rbm93bi1zeW1ib2wuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvd2hpdGVzcGFjZXMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzLmFycmF5LmZpbHRlci5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXMuYXJyYXkuZnJvbS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXMuYXJyYXkuaW5jbHVkZXMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzLmFycmF5LmpvaW4uanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzLmFycmF5Lm1hcC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXMuYXJyYXkuc2xpY2UuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzLmFycmF5LnNwbGljZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXMuZnVuY3Rpb24ubmFtZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXMubnVtYmVyLmNvbnN0cnVjdG9yLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lcy5vYmplY3QuYXNzaWduLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lcy5vYmplY3QuZW50cmllcy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXMub2JqZWN0LmtleXMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzLm9iamVjdC50by1zdHJpbmcuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzLnJlZ2V4cC50by1zdHJpbmcuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzLnN0cmluZy5pbmNsdWRlcy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXMuc3RyaW5nLml0ZXJhdG9yLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lcy5zdHJpbmcubWF0Y2guanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzLnN0cmluZy5yZXBsYWNlLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lcy5zdHJpbmcuc3BsaXQuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzLnN0cmluZy5zdGFydHMtd2l0aC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXMuc3RyaW5nLnRyaW0uanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL3dlYi5kb20tY29sbGVjdGlvbnMuZm9yLWVhY2guanMiLCJzcmMvUG9sYXJiZWFyLnRzIiwic3JjL2F0dHJpYnV0ZXMvQmluZHZhbC50cyIsInNyYy9hdHRyaWJ1dGVzL0V2ZW50cy50cyIsInNyYy9hdHRyaWJ1dGVzL0xvb3Bmb3IudHMiLCJzcmMvZGF0YS9EYXRhRm5zLnRzIiwic3JjL2RhdGEvT2JzZXJ2ZS50cyIsInNyYy9kb20vVHJhdmVyc2UudHMiLCJzcmMvZXRjL0VsZW1lbnRFdmVudHMudHMiLCJzcmMvZXRjL0tleUNvZGVzLnRzIiwic3JjL2V0Yy9Ob3JtYWxpemVTdHJpbmcudHMiLCJzcmMvZXRjL1JlZ2V4ZXMudHMiLCJzcmMvZXRjL1Jlc29sdmVUeXBlLnRzIiwic3JjL3BhcnNlci9Db2RlUGFyc2VyLnRzIiwic3JjL3Zkb20vQ3JlYXRlRWxlbWVudC50cyIsInNyYy92ZG9tL0RpZmYudHMiLCJzcmMvdmRvbS9IeWRyYXRlLnRzIiwic3JjL3Zkb20vUmVuZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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RUFBWjs7QUFDTixJQUFBLEdBQUcsQ0FBQyxnQkFBSixDQUFxQixTQUFyQixFQUFnQyxFQUFoQztBQUNEOztBQUVELE1BQUksT0FBSixFQUFhO0FBQ1gsSUFBQSxRQUFRLENBQUMsS0FBVCxDQUFlLE9BQWYsSUFBMEIsR0FBMUI7QUFDRCxHQXpDSyxDQTJDTjs7O0FBQ0EsU0FBTyxHQUFQO0FBQ0QsQ0FyRFk7O0FBdURBLE9BQUEsQ0FBQSxNQUFBLEdBQVMsVUFBQyxRQUFELEVBQXNCLEtBQXRCLEVBQTJDO0FBQy9ELE1BQUksT0FBTyxLQUFQLEtBQWlCLFFBQXJCLEVBQStCO0FBQzdCLFdBQU8sUUFBUSxDQUFDLGNBQVQsQ0FBd0IsS0FBeEIsQ0FBUDtBQUNEOztBQUNELFNBQU8sT0FBQSxDQUFBLFVBQUEsQ0FBVyxRQUFYLEVBQXFCLEtBQXJCLENBQVA7QUFDRCxDQUxZIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgaWYgKHR5cGVvZiBpdCAhPSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgVHlwZUVycm9yKFN0cmluZyhpdCkgKyAnIGlzIG5vdCBhIGZ1bmN0aW9uJyk7XG4gIH0gcmV0dXJuIGl0O1xufTtcbiIsInZhciB3ZWxsS25vd25TeW1ib2wgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvd2VsbC1rbm93bi1zeW1ib2wnKTtcbnZhciBjcmVhdGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0LWNyZWF0ZScpO1xudmFyIGhpZGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaGlkZScpO1xuXG52YXIgVU5TQ09QQUJMRVMgPSB3ZWxsS25vd25TeW1ib2woJ3Vuc2NvcGFibGVzJyk7XG52YXIgQXJyYXlQcm90b3R5cGUgPSBBcnJheS5wcm90b3R5cGU7XG5cbi8vIEFycmF5LnByb3RvdHlwZVtAQHVuc2NvcGFibGVzXVxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtYXJyYXkucHJvdG90eXBlLUBAdW5zY29wYWJsZXNcbmlmIChBcnJheVByb3RvdHlwZVtVTlNDT1BBQkxFU10gPT0gdW5kZWZpbmVkKSB7XG4gIGhpZGUoQXJyYXlQcm90b3R5cGUsIFVOU0NPUEFCTEVTLCBjcmVhdGUobnVsbCkpO1xufVxuXG4vLyBhZGQgYSBrZXkgdG8gQXJyYXkucHJvdG90eXBlW0BAdW5zY29wYWJsZXNdXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgQXJyYXlQcm90b3R5cGVbVU5TQ09QQUJMRVNdW2tleV0gPSB0cnVlO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBjb2RlUG9pbnRBdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9zdHJpbmctYXQnKTtcblxuLy8gYEFkdmFuY2VTdHJpbmdJbmRleGAgYWJzdHJhY3Qgb3BlcmF0aW9uXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1hZHZhbmNlc3RyaW5naW5kZXhcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKFMsIGluZGV4LCB1bmljb2RlKSB7XG4gIHJldHVybiBpbmRleCArICh1bmljb2RlID8gY29kZVBvaW50QXQoUywgaW5kZXgsIHRydWUpLmxlbmd0aCA6IDEpO1xufTtcbiIsInZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pcy1vYmplY3QnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgaWYgKCFpc09iamVjdChpdCkpIHtcbiAgICB0aHJvdyBUeXBlRXJyb3IoU3RyaW5nKGl0KSArICcgaXMgbm90IGFuIG9iamVjdCcpO1xuICB9IHJldHVybiBpdDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG52YXIgYXJyYXlNZXRob2RzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2FycmF5LW1ldGhvZHMnKTtcbnZhciBzbG9wcHlBcnJheU1ldGhvZCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9zbG9wcHktYXJyYXktbWV0aG9kJyk7XG5cbnZhciBpbnRlcm5hbEZvckVhY2ggPSBhcnJheU1ldGhvZHMoMCk7XG52YXIgU0xPUFBZX01FVEhPRCA9IHNsb3BweUFycmF5TWV0aG9kKCdmb3JFYWNoJyk7XG5cbi8vIGBBcnJheS5wcm90b3R5cGUuZm9yRWFjaGAgbWV0aG9kIGltcGxlbWVudGF0aW9uXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1hcnJheS5wcm90b3R5cGUuZm9yZWFjaFxubW9kdWxlLmV4cG9ydHMgPSBTTE9QUFlfTUVUSE9EID8gZnVuY3Rpb24gZm9yRWFjaChjYWxsYmFja2ZuIC8qICwgdGhpc0FyZyAqLykge1xuICByZXR1cm4gaW50ZXJuYWxGb3JFYWNoKHRoaXMsIGNhbGxiYWNrZm4sIGFyZ3VtZW50c1sxXSk7XG59IDogW10uZm9yRWFjaDtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBiaW5kID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2JpbmQtY29udGV4dCcpO1xudmFyIHRvT2JqZWN0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3RvLW9iamVjdCcpO1xudmFyIGNhbGxXaXRoU2FmZUl0ZXJhdGlvbkNsb3NpbmcgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvY2FsbC13aXRoLXNhZmUtaXRlcmF0aW9uLWNsb3NpbmcnKTtcbnZhciBpc0FycmF5SXRlcmF0b3JNZXRob2QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaXMtYXJyYXktaXRlcmF0b3ItbWV0aG9kJyk7XG52YXIgdG9MZW5ndGggPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvdG8tbGVuZ3RoJyk7XG52YXIgY3JlYXRlUHJvcGVydHkgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvY3JlYXRlLXByb3BlcnR5Jyk7XG52YXIgZ2V0SXRlcmF0b3JNZXRob2QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZ2V0LWl0ZXJhdG9yLW1ldGhvZCcpO1xuXG4vLyBgQXJyYXkuZnJvbWAgbWV0aG9kXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1hcnJheS5mcm9tXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGZyb20oYXJyYXlMaWtlIC8qICwgbWFwZm4gPSB1bmRlZmluZWQsIHRoaXNBcmcgPSB1bmRlZmluZWQgKi8pIHtcbiAgdmFyIE8gPSB0b09iamVjdChhcnJheUxpa2UpO1xuICB2YXIgQyA9IHR5cGVvZiB0aGlzID09ICdmdW5jdGlvbicgPyB0aGlzIDogQXJyYXk7XG4gIHZhciBhcmd1bWVudHNMZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoO1xuICB2YXIgbWFwZm4gPSBhcmd1bWVudHNMZW5ndGggPiAxID8gYXJndW1lbnRzWzFdIDogdW5kZWZpbmVkO1xuICB2YXIgbWFwcGluZyA9IG1hcGZuICE9PSB1bmRlZmluZWQ7XG4gIHZhciBpbmRleCA9IDA7XG4gIHZhciBpdGVyYXRvck1ldGhvZCA9IGdldEl0ZXJhdG9yTWV0aG9kKE8pO1xuICB2YXIgbGVuZ3RoLCByZXN1bHQsIHN0ZXAsIGl0ZXJhdG9yO1xuICBpZiAobWFwcGluZykgbWFwZm4gPSBiaW5kKG1hcGZuLCBhcmd1bWVudHNMZW5ndGggPiAyID8gYXJndW1lbnRzWzJdIDogdW5kZWZpbmVkLCAyKTtcbiAgLy8gaWYgdGhlIHRhcmdldCBpcyBub3QgaXRlcmFibGUgb3IgaXQncyBhbiBhcnJheSB3aXRoIHRoZSBkZWZhdWx0IGl0ZXJhdG9yIC0gdXNlIGEgc2ltcGxlIGNhc2VcbiAgaWYgKGl0ZXJhdG9yTWV0aG9kICE9IHVuZGVmaW5lZCAmJiAhKEMgPT0gQXJyYXkgJiYgaXNBcnJheUl0ZXJhdG9yTWV0aG9kKGl0ZXJhdG9yTWV0aG9kKSkpIHtcbiAgICBpdGVyYXRvciA9IGl0ZXJhdG9yTWV0aG9kLmNhbGwoTyk7XG4gICAgcmVzdWx0ID0gbmV3IEMoKTtcbiAgICBmb3IgKDshKHN0ZXAgPSBpdGVyYXRvci5uZXh0KCkpLmRvbmU7IGluZGV4KyspIHtcbiAgICAgIGNyZWF0ZVByb3BlcnR5KHJlc3VsdCwgaW5kZXgsIG1hcHBpbmdcbiAgICAgICAgPyBjYWxsV2l0aFNhZmVJdGVyYXRpb25DbG9zaW5nKGl0ZXJhdG9yLCBtYXBmbiwgW3N0ZXAudmFsdWUsIGluZGV4XSwgdHJ1ZSlcbiAgICAgICAgOiBzdGVwLnZhbHVlXG4gICAgICApO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBsZW5ndGggPSB0b0xlbmd0aChPLmxlbmd0aCk7XG4gICAgcmVzdWx0ID0gbmV3IEMobGVuZ3RoKTtcbiAgICBmb3IgKDtsZW5ndGggPiBpbmRleDsgaW5kZXgrKykge1xuICAgICAgY3JlYXRlUHJvcGVydHkocmVzdWx0LCBpbmRleCwgbWFwcGluZyA/IG1hcGZuKE9baW5kZXhdLCBpbmRleCkgOiBPW2luZGV4XSk7XG4gICAgfVxuICB9XG4gIHJlc3VsdC5sZW5ndGggPSBpbmRleDtcbiAgcmV0dXJuIHJlc3VsdDtcbn07XG4iLCJ2YXIgdG9JbmRleGVkT2JqZWN0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3RvLWluZGV4ZWQtb2JqZWN0Jyk7XG52YXIgdG9MZW5ndGggPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvdG8tbGVuZ3RoJyk7XG52YXIgdG9BYnNvbHV0ZUluZGV4ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3RvLWFic29sdXRlLWluZGV4Jyk7XG5cbi8vIGBBcnJheS5wcm90b3R5cGUueyBpbmRleE9mLCBpbmNsdWRlcyB9YCBtZXRob2RzIGltcGxlbWVudGF0aW9uXG4vLyBmYWxzZSAtPiBBcnJheSNpbmRleE9mXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1hcnJheS5wcm90b3R5cGUuaW5kZXhvZlxuLy8gdHJ1ZSAgLT4gQXJyYXkjaW5jbHVkZXNcbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLWFycmF5LnByb3RvdHlwZS5pbmNsdWRlc1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoSVNfSU5DTFVERVMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICgkdGhpcywgZWwsIGZyb21JbmRleCkge1xuICAgIHZhciBPID0gdG9JbmRleGVkT2JqZWN0KCR0aGlzKTtcbiAgICB2YXIgbGVuZ3RoID0gdG9MZW5ndGgoTy5sZW5ndGgpO1xuICAgIHZhciBpbmRleCA9IHRvQWJzb2x1dGVJbmRleChmcm9tSW5kZXgsIGxlbmd0aCk7XG4gICAgdmFyIHZhbHVlO1xuICAgIC8vIEFycmF5I2luY2x1ZGVzIHVzZXMgU2FtZVZhbHVlWmVybyBlcXVhbGl0eSBhbGdvcml0aG1cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tc2VsZi1jb21wYXJlXG4gICAgaWYgKElTX0lOQ0xVREVTICYmIGVsICE9IGVsKSB3aGlsZSAobGVuZ3RoID4gaW5kZXgpIHtcbiAgICAgIHZhbHVlID0gT1tpbmRleCsrXTtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1zZWxmLWNvbXBhcmVcbiAgICAgIGlmICh2YWx1ZSAhPSB2YWx1ZSkgcmV0dXJuIHRydWU7XG4gICAgLy8gQXJyYXkjaW5kZXhPZiBpZ25vcmVzIGhvbGVzLCBBcnJheSNpbmNsdWRlcyAtIG5vdFxuICAgIH0gZWxzZSBmb3IgKDtsZW5ndGggPiBpbmRleDsgaW5kZXgrKykgaWYgKElTX0lOQ0xVREVTIHx8IGluZGV4IGluIE8pIHtcbiAgICAgIGlmIChPW2luZGV4XSA9PT0gZWwpIHJldHVybiBJU19JTkNMVURFUyB8fCBpbmRleCB8fCAwO1xuICAgIH0gcmV0dXJuICFJU19JTkNMVURFUyAmJiAtMTtcbiAgfTtcbn07XG4iLCJ2YXIgZmFpbHMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZmFpbHMnKTtcbnZhciB3ZWxsS25vd25TeW1ib2wgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvd2VsbC1rbm93bi1zeW1ib2wnKTtcblxudmFyIFNQRUNJRVMgPSB3ZWxsS25vd25TeW1ib2woJ3NwZWNpZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoTUVUSE9EX05BTUUpIHtcbiAgcmV0dXJuICFmYWlscyhmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGFycmF5ID0gW107XG4gICAgdmFyIGNvbnN0cnVjdG9yID0gYXJyYXkuY29uc3RydWN0b3IgPSB7fTtcbiAgICBjb25zdHJ1Y3RvcltTUEVDSUVTXSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7IGZvbzogMSB9O1xuICAgIH07XG4gICAgcmV0dXJuIGFycmF5W01FVEhPRF9OQU1FXShCb29sZWFuKS5mb28gIT09IDE7XG4gIH0pO1xufTtcbiIsInZhciBiaW5kID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2JpbmQtY29udGV4dCcpO1xudmFyIEluZGV4ZWRPYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaW5kZXhlZC1vYmplY3QnKTtcbnZhciB0b09iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy90by1vYmplY3QnKTtcbnZhciB0b0xlbmd0aCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy90by1sZW5ndGgnKTtcbnZhciBhcnJheVNwZWNpZXNDcmVhdGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvYXJyYXktc3BlY2llcy1jcmVhdGUnKTtcblxuLy8gYEFycmF5LnByb3RvdHlwZS57IGZvckVhY2gsIG1hcCwgZmlsdGVyLCBzb21lLCBldmVyeSwgZmluZCwgZmluZEluZGV4IH1gIG1ldGhvZHMgaW1wbGVtZW50YXRpb25cbi8vIDAgLT4gQXJyYXkjZm9yRWFjaFxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtYXJyYXkucHJvdG90eXBlLmZvcmVhY2hcbi8vIDEgLT4gQXJyYXkjbWFwXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1hcnJheS5wcm90b3R5cGUubWFwXG4vLyAyIC0+IEFycmF5I2ZpbHRlclxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtYXJyYXkucHJvdG90eXBlLmZpbHRlclxuLy8gMyAtPiBBcnJheSNzb21lXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1hcnJheS5wcm90b3R5cGUuc29tZVxuLy8gNCAtPiBBcnJheSNldmVyeVxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtYXJyYXkucHJvdG90eXBlLmV2ZXJ5XG4vLyA1IC0+IEFycmF5I2ZpbmRcbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLWFycmF5LnByb3RvdHlwZS5maW5kXG4vLyA2IC0+IEFycmF5I2ZpbmRJbmRleFxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtYXJyYXkucHJvdG90eXBlLmZpbmRJbmRleFxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoVFlQRSwgc3BlY2lmaWNDcmVhdGUpIHtcbiAgdmFyIElTX01BUCA9IFRZUEUgPT0gMTtcbiAgdmFyIElTX0ZJTFRFUiA9IFRZUEUgPT0gMjtcbiAgdmFyIElTX1NPTUUgPSBUWVBFID09IDM7XG4gIHZhciBJU19FVkVSWSA9IFRZUEUgPT0gNDtcbiAgdmFyIElTX0ZJTkRfSU5ERVggPSBUWVBFID09IDY7XG4gIHZhciBOT19IT0xFUyA9IFRZUEUgPT0gNSB8fCBJU19GSU5EX0lOREVYO1xuICB2YXIgY3JlYXRlID0gc3BlY2lmaWNDcmVhdGUgfHwgYXJyYXlTcGVjaWVzQ3JlYXRlO1xuICByZXR1cm4gZnVuY3Rpb24gKCR0aGlzLCBjYWxsYmFja2ZuLCB0aGF0KSB7XG4gICAgdmFyIE8gPSB0b09iamVjdCgkdGhpcyk7XG4gICAgdmFyIHNlbGYgPSBJbmRleGVkT2JqZWN0KE8pO1xuICAgIHZhciBib3VuZEZ1bmN0aW9uID0gYmluZChjYWxsYmFja2ZuLCB0aGF0LCAzKTtcbiAgICB2YXIgbGVuZ3RoID0gdG9MZW5ndGgoc2VsZi5sZW5ndGgpO1xuICAgIHZhciBpbmRleCA9IDA7XG4gICAgdmFyIHRhcmdldCA9IElTX01BUCA/IGNyZWF0ZSgkdGhpcywgbGVuZ3RoKSA6IElTX0ZJTFRFUiA/IGNyZWF0ZSgkdGhpcywgMCkgOiB1bmRlZmluZWQ7XG4gICAgdmFyIHZhbHVlLCByZXN1bHQ7XG4gICAgZm9yICg7bGVuZ3RoID4gaW5kZXg7IGluZGV4KyspIGlmIChOT19IT0xFUyB8fCBpbmRleCBpbiBzZWxmKSB7XG4gICAgICB2YWx1ZSA9IHNlbGZbaW5kZXhdO1xuICAgICAgcmVzdWx0ID0gYm91bmRGdW5jdGlvbih2YWx1ZSwgaW5kZXgsIE8pO1xuICAgICAgaWYgKFRZUEUpIHtcbiAgICAgICAgaWYgKElTX01BUCkgdGFyZ2V0W2luZGV4XSA9IHJlc3VsdDsgLy8gbWFwXG4gICAgICAgIGVsc2UgaWYgKHJlc3VsdCkgc3dpdGNoIChUWVBFKSB7XG4gICAgICAgICAgY2FzZSAzOiByZXR1cm4gdHJ1ZTsgICAgICAgICAgICAgIC8vIHNvbWVcbiAgICAgICAgICBjYXNlIDU6IHJldHVybiB2YWx1ZTsgICAgICAgICAgICAgLy8gZmluZFxuICAgICAgICAgIGNhc2UgNjogcmV0dXJuIGluZGV4OyAgICAgICAgICAgICAvLyBmaW5kSW5kZXhcbiAgICAgICAgICBjYXNlIDI6IHRhcmdldC5wdXNoKHZhbHVlKTsgICAgICAgLy8gZmlsdGVyXG4gICAgICAgIH0gZWxzZSBpZiAoSVNfRVZFUlkpIHJldHVybiBmYWxzZTsgIC8vIGV2ZXJ5XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBJU19GSU5EX0lOREVYID8gLTEgOiBJU19TT01FIHx8IElTX0VWRVJZID8gSVNfRVZFUlkgOiB0YXJnZXQ7XG4gIH07XG59O1xuIiwidmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2lzLW9iamVjdCcpO1xudmFyIGlzQXJyYXkgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaXMtYXJyYXknKTtcbnZhciB3ZWxsS25vd25TeW1ib2wgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvd2VsbC1rbm93bi1zeW1ib2wnKTtcblxudmFyIFNQRUNJRVMgPSB3ZWxsS25vd25TeW1ib2woJ3NwZWNpZXMnKTtcblxuLy8gYEFycmF5U3BlY2llc0NyZWF0ZWAgYWJzdHJhY3Qgb3BlcmF0aW9uXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1hcnJheXNwZWNpZXNjcmVhdGVcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG9yaWdpbmFsQXJyYXksIGxlbmd0aCkge1xuICB2YXIgQztcbiAgaWYgKGlzQXJyYXkob3JpZ2luYWxBcnJheSkpIHtcbiAgICBDID0gb3JpZ2luYWxBcnJheS5jb25zdHJ1Y3RvcjtcbiAgICAvLyBjcm9zcy1yZWFsbSBmYWxsYmFja1xuICAgIGlmICh0eXBlb2YgQyA9PSAnZnVuY3Rpb24nICYmIChDID09PSBBcnJheSB8fCBpc0FycmF5KEMucHJvdG90eXBlKSkpIEMgPSB1bmRlZmluZWQ7XG4gICAgZWxzZSBpZiAoaXNPYmplY3QoQykpIHtcbiAgICAgIEMgPSBDW1NQRUNJRVNdO1xuICAgICAgaWYgKEMgPT09IG51bGwpIEMgPSB1bmRlZmluZWQ7XG4gICAgfVxuICB9IHJldHVybiBuZXcgKEMgPT09IHVuZGVmaW5lZCA/IEFycmF5IDogQykobGVuZ3RoID09PSAwID8gMCA6IGxlbmd0aCk7XG59O1xuIiwidmFyIGFGdW5jdGlvbiA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9hLWZ1bmN0aW9uJyk7XG5cbi8vIG9wdGlvbmFsIC8gc2ltcGxlIGNvbnRleHQgYmluZGluZ1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZm4sIHRoYXQsIGxlbmd0aCkge1xuICBhRnVuY3Rpb24oZm4pO1xuICBpZiAodGhhdCA9PT0gdW5kZWZpbmVkKSByZXR1cm4gZm47XG4gIHN3aXRjaCAobGVuZ3RoKSB7XG4gICAgY2FzZSAwOiByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCk7XG4gICAgfTtcbiAgICBjYXNlIDE6IHJldHVybiBmdW5jdGlvbiAoYSkge1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSk7XG4gICAgfTtcbiAgICBjYXNlIDI6IHJldHVybiBmdW5jdGlvbiAoYSwgYikge1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSwgYik7XG4gICAgfTtcbiAgICBjYXNlIDM6IHJldHVybiBmdW5jdGlvbiAoYSwgYiwgYykge1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSwgYiwgYyk7XG4gICAgfTtcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24gKC8qIC4uLmFyZ3MgKi8pIHtcbiAgICByZXR1cm4gZm4uYXBwbHkodGhhdCwgYXJndW1lbnRzKTtcbiAgfTtcbn07XG4iLCJ2YXIgYW5PYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvYW4tb2JqZWN0Jyk7XG5cbi8vIGNhbGwgc29tZXRoaW5nIG9uIGl0ZXJhdG9yIHN0ZXAgd2l0aCBzYWZlIGNsb3Npbmcgb24gZXJyb3Jcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0ZXJhdG9yLCBmbiwgdmFsdWUsIEVOVFJJRVMpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gRU5UUklFUyA/IGZuKGFuT2JqZWN0KHZhbHVlKVswXSwgdmFsdWVbMV0pIDogZm4odmFsdWUpO1xuICAvLyA3LjQuNiBJdGVyYXRvckNsb3NlKGl0ZXJhdG9yLCBjb21wbGV0aW9uKVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHZhciByZXR1cm5NZXRob2QgPSBpdGVyYXRvclsncmV0dXJuJ107XG4gICAgaWYgKHJldHVybk1ldGhvZCAhPT0gdW5kZWZpbmVkKSBhbk9iamVjdChyZXR1cm5NZXRob2QuY2FsbChpdGVyYXRvcikpO1xuICAgIHRocm93IGVycm9yO1xuICB9XG59O1xuIiwidmFyIHdlbGxLbm93blN5bWJvbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy93ZWxsLWtub3duLXN5bWJvbCcpO1xuXG52YXIgSVRFUkFUT1IgPSB3ZWxsS25vd25TeW1ib2woJ2l0ZXJhdG9yJyk7XG52YXIgU0FGRV9DTE9TSU5HID0gZmFsc2U7XG5cbnRyeSB7XG4gIHZhciBjYWxsZWQgPSAwO1xuICB2YXIgaXRlcmF0b3JXaXRoUmV0dXJuID0ge1xuICAgIG5leHQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7IGRvbmU6ICEhY2FsbGVkKysgfTtcbiAgICB9LFxuICAgICdyZXR1cm4nOiBmdW5jdGlvbiAoKSB7XG4gICAgICBTQUZFX0NMT1NJTkcgPSB0cnVlO1xuICAgIH1cbiAgfTtcbiAgaXRlcmF0b3JXaXRoUmV0dXJuW0lURVJBVE9SXSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXRocm93LWxpdGVyYWxcbiAgQXJyYXkuZnJvbShpdGVyYXRvcldpdGhSZXR1cm4sIGZ1bmN0aW9uICgpIHsgdGhyb3cgMjsgfSk7XG59IGNhdGNoIChlcnJvcikgeyAvKiBlbXB0eSAqLyB9XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGV4ZWMsIFNLSVBfQ0xPU0lORykge1xuICBpZiAoIVNLSVBfQ0xPU0lORyAmJiAhU0FGRV9DTE9TSU5HKSByZXR1cm4gZmFsc2U7XG4gIHZhciBJVEVSQVRJT05fU1VQUE9SVCA9IGZhbHNlO1xuICB0cnkge1xuICAgIHZhciBvYmplY3QgPSB7fTtcbiAgICBvYmplY3RbSVRFUkFUT1JdID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbmV4dDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHJldHVybiB7IGRvbmU6IElURVJBVElPTl9TVVBQT1JUID0gdHJ1ZSB9O1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH07XG4gICAgZXhlYyhvYmplY3QpO1xuICB9IGNhdGNoIChlcnJvcikgeyAvKiBlbXB0eSAqLyB9XG4gIHJldHVybiBJVEVSQVRJT05fU1VQUE9SVDtcbn07XG4iLCJ2YXIgdG9TdHJpbmcgPSB7fS50b1N0cmluZztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwoaXQpLnNsaWNlKDgsIC0xKTtcbn07XG4iLCJ2YXIgY2xhc3NvZlJhdyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9jbGFzc29mLXJhdycpO1xudmFyIHdlbGxLbm93blN5bWJvbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy93ZWxsLWtub3duLXN5bWJvbCcpO1xuXG52YXIgVE9fU1RSSU5HX1RBRyA9IHdlbGxLbm93blN5bWJvbCgndG9TdHJpbmdUYWcnKTtcbi8vIEVTMyB3cm9uZyBoZXJlXG52YXIgQ09SUkVDVF9BUkdVTUVOVFMgPSBjbGFzc29mUmF3KGZ1bmN0aW9uICgpIHsgcmV0dXJuIGFyZ3VtZW50czsgfSgpKSA9PSAnQXJndW1lbnRzJztcblxuLy8gZmFsbGJhY2sgZm9yIElFMTEgU2NyaXB0IEFjY2VzcyBEZW5pZWQgZXJyb3JcbnZhciB0cnlHZXQgPSBmdW5jdGlvbiAoaXQsIGtleSkge1xuICB0cnkge1xuICAgIHJldHVybiBpdFtrZXldO1xuICB9IGNhdGNoIChlcnJvcikgeyAvKiBlbXB0eSAqLyB9XG59O1xuXG4vLyBnZXR0aW5nIHRhZyBmcm9tIEVTNisgYE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmdgXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICB2YXIgTywgdGFnLCByZXN1bHQ7XG4gIHJldHVybiBpdCA9PT0gdW5kZWZpbmVkID8gJ1VuZGVmaW5lZCcgOiBpdCA9PT0gbnVsbCA/ICdOdWxsJ1xuICAgIC8vIEBAdG9TdHJpbmdUYWcgY2FzZVxuICAgIDogdHlwZW9mICh0YWcgPSB0cnlHZXQoTyA9IE9iamVjdChpdCksIFRPX1NUUklOR19UQUcpKSA9PSAnc3RyaW5nJyA/IHRhZ1xuICAgIC8vIGJ1aWx0aW5UYWcgY2FzZVxuICAgIDogQ09SUkVDVF9BUkdVTUVOVFMgPyBjbGFzc29mUmF3KE8pXG4gICAgLy8gRVMzIGFyZ3VtZW50cyBmYWxsYmFja1xuICAgIDogKHJlc3VsdCA9IGNsYXNzb2ZSYXcoTykpID09ICdPYmplY3QnICYmIHR5cGVvZiBPLmNhbGxlZSA9PSAnZnVuY3Rpb24nID8gJ0FyZ3VtZW50cycgOiByZXN1bHQ7XG59O1xuIiwidmFyIGhhcyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9oYXMnKTtcbnZhciBvd25LZXlzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL293bi1rZXlzJyk7XG52YXIgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yTW9kdWxlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL29iamVjdC1nZXQtb3duLXByb3BlcnR5LWRlc2NyaXB0b3InKTtcbnZhciBkZWZpbmVQcm9wZXJ0eU1vZHVsZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9vYmplY3QtZGVmaW5lLXByb3BlcnR5Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHRhcmdldCwgc291cmNlKSB7XG4gIHZhciBrZXlzID0gb3duS2V5cyhzb3VyY2UpO1xuICB2YXIgZGVmaW5lUHJvcGVydHkgPSBkZWZpbmVQcm9wZXJ0eU1vZHVsZS5mO1xuICB2YXIgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yID0gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yTW9kdWxlLmY7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBrZXkgPSBrZXlzW2ldO1xuICAgIGlmICghaGFzKHRhcmdldCwga2V5KSkgZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIGdldE93blByb3BlcnR5RGVzY3JpcHRvcihzb3VyY2UsIGtleSkpO1xuICB9XG59O1xuIiwidmFyIHdlbGxLbm93blN5bWJvbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy93ZWxsLWtub3duLXN5bWJvbCcpO1xuXG52YXIgTUFUQ0ggPSB3ZWxsS25vd25TeW1ib2woJ21hdGNoJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKE1FVEhPRF9OQU1FKSB7XG4gIHZhciByZWdleHAgPSAvLi87XG4gIHRyeSB7XG4gICAgJy8uLydbTUVUSE9EX05BTUVdKHJlZ2V4cCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICB0cnkge1xuICAgICAgcmVnZXhwW01BVENIXSA9IGZhbHNlO1xuICAgICAgcmV0dXJuICcvLi8nW01FVEhPRF9OQU1FXShyZWdleHApO1xuICAgIH0gY2F0Y2ggKGYpIHsgLyogZW1wdHkgKi8gfVxuICB9IHJldHVybiBmYWxzZTtcbn07XG4iLCJ2YXIgZmFpbHMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZmFpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAhZmFpbHMoZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBGKCkgeyAvKiBlbXB0eSAqLyB9XG4gIEYucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gbnVsbDtcbiAgcmV0dXJuIE9iamVjdC5nZXRQcm90b3R5cGVPZihuZXcgRigpKSAhPT0gRi5wcm90b3R5cGU7XG59KTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBJdGVyYXRvclByb3RvdHlwZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pdGVyYXRvcnMtY29yZScpLkl0ZXJhdG9yUHJvdG90eXBlO1xudmFyIGNyZWF0ZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9vYmplY3QtY3JlYXRlJyk7XG52YXIgY3JlYXRlUHJvcGVydHlEZXNjcmlwdG9yID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2NyZWF0ZS1wcm9wZXJ0eS1kZXNjcmlwdG9yJyk7XG52YXIgc2V0VG9TdHJpbmdUYWcgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvc2V0LXRvLXN0cmluZy10YWcnKTtcbnZhciBJdGVyYXRvcnMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaXRlcmF0b3JzJyk7XG5cbnZhciByZXR1cm5UaGlzID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoSXRlcmF0b3JDb25zdHJ1Y3RvciwgTkFNRSwgbmV4dCkge1xuICB2YXIgVE9fU1RSSU5HX1RBRyA9IE5BTUUgKyAnIEl0ZXJhdG9yJztcbiAgSXRlcmF0b3JDb25zdHJ1Y3Rvci5wcm90b3R5cGUgPSBjcmVhdGUoSXRlcmF0b3JQcm90b3R5cGUsIHsgbmV4dDogY3JlYXRlUHJvcGVydHlEZXNjcmlwdG9yKDEsIG5leHQpIH0pO1xuICBzZXRUb1N0cmluZ1RhZyhJdGVyYXRvckNvbnN0cnVjdG9yLCBUT19TVFJJTkdfVEFHLCBmYWxzZSwgdHJ1ZSk7XG4gIEl0ZXJhdG9yc1tUT19TVFJJTkdfVEFHXSA9IHJldHVyblRoaXM7XG4gIHJldHVybiBJdGVyYXRvckNvbnN0cnVjdG9yO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGJpdG1hcCwgdmFsdWUpIHtcbiAgcmV0dXJuIHtcbiAgICBlbnVtZXJhYmxlOiAhKGJpdG1hcCAmIDEpLFxuICAgIGNvbmZpZ3VyYWJsZTogIShiaXRtYXAgJiAyKSxcbiAgICB3cml0YWJsZTogIShiaXRtYXAgJiA0KSxcbiAgICB2YWx1ZTogdmFsdWVcbiAgfTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG52YXIgdG9QcmltaXRpdmUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvdG8tcHJpbWl0aXZlJyk7XG52YXIgZGVmaW5lUHJvcGVydHlNb2R1bGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0LWRlZmluZS1wcm9wZXJ0eScpO1xudmFyIGNyZWF0ZVByb3BlcnR5RGVzY3JpcHRvciA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9jcmVhdGUtcHJvcGVydHktZGVzY3JpcHRvcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChvYmplY3QsIGtleSwgdmFsdWUpIHtcbiAgdmFyIHByb3BlcnR5S2V5ID0gdG9QcmltaXRpdmUoa2V5KTtcbiAgaWYgKHByb3BlcnR5S2V5IGluIG9iamVjdCkgZGVmaW5lUHJvcGVydHlNb2R1bGUuZihvYmplY3QsIHByb3BlcnR5S2V5LCBjcmVhdGVQcm9wZXJ0eURlc2NyaXB0b3IoMCwgdmFsdWUpKTtcbiAgZWxzZSBvYmplY3RbcHJvcGVydHlLZXldID0gdmFsdWU7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyICQgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZXhwb3J0Jyk7XG52YXIgY3JlYXRlSXRlcmF0b3JDb25zdHJ1Y3RvciA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9jcmVhdGUtaXRlcmF0b3ItY29uc3RydWN0b3InKTtcbnZhciBnZXRQcm90b3R5cGVPZiA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9vYmplY3QtZ2V0LXByb3RvdHlwZS1vZicpO1xudmFyIHNldFByb3RvdHlwZU9mID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL29iamVjdC1zZXQtcHJvdG90eXBlLW9mJyk7XG52YXIgc2V0VG9TdHJpbmdUYWcgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvc2V0LXRvLXN0cmluZy10YWcnKTtcbnZhciBoaWRlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2hpZGUnKTtcbnZhciByZWRlZmluZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9yZWRlZmluZScpO1xudmFyIHdlbGxLbm93blN5bWJvbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy93ZWxsLWtub3duLXN5bWJvbCcpO1xudmFyIElTX1BVUkUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaXMtcHVyZScpO1xudmFyIEl0ZXJhdG9ycyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pdGVyYXRvcnMnKTtcbnZhciBJdGVyYXRvcnNDb3JlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2l0ZXJhdG9ycy1jb3JlJyk7XG5cbnZhciBJdGVyYXRvclByb3RvdHlwZSA9IEl0ZXJhdG9yc0NvcmUuSXRlcmF0b3JQcm90b3R5cGU7XG52YXIgQlVHR1lfU0FGQVJJX0lURVJBVE9SUyA9IEl0ZXJhdG9yc0NvcmUuQlVHR1lfU0FGQVJJX0lURVJBVE9SUztcbnZhciBJVEVSQVRPUiA9IHdlbGxLbm93blN5bWJvbCgnaXRlcmF0b3InKTtcbnZhciBLRVlTID0gJ2tleXMnO1xudmFyIFZBTFVFUyA9ICd2YWx1ZXMnO1xudmFyIEVOVFJJRVMgPSAnZW50cmllcyc7XG5cbnZhciByZXR1cm5UaGlzID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoSXRlcmFibGUsIE5BTUUsIEl0ZXJhdG9yQ29uc3RydWN0b3IsIG5leHQsIERFRkFVTFQsIElTX1NFVCwgRk9SQ0VEKSB7XG4gIGNyZWF0ZUl0ZXJhdG9yQ29uc3RydWN0b3IoSXRlcmF0b3JDb25zdHJ1Y3RvciwgTkFNRSwgbmV4dCk7XG5cbiAgdmFyIGdldEl0ZXJhdGlvbk1ldGhvZCA9IGZ1bmN0aW9uIChLSU5EKSB7XG4gICAgaWYgKEtJTkQgPT09IERFRkFVTFQgJiYgZGVmYXVsdEl0ZXJhdG9yKSByZXR1cm4gZGVmYXVsdEl0ZXJhdG9yO1xuICAgIGlmICghQlVHR1lfU0FGQVJJX0lURVJBVE9SUyAmJiBLSU5EIGluIEl0ZXJhYmxlUHJvdG90eXBlKSByZXR1cm4gSXRlcmFibGVQcm90b3R5cGVbS0lORF07XG4gICAgc3dpdGNoIChLSU5EKSB7XG4gICAgICBjYXNlIEtFWVM6IHJldHVybiBmdW5jdGlvbiBrZXlzKCkgeyByZXR1cm4gbmV3IEl0ZXJhdG9yQ29uc3RydWN0b3IodGhpcywgS0lORCk7IH07XG4gICAgICBjYXNlIFZBTFVFUzogcmV0dXJuIGZ1bmN0aW9uIHZhbHVlcygpIHsgcmV0dXJuIG5ldyBJdGVyYXRvckNvbnN0cnVjdG9yKHRoaXMsIEtJTkQpOyB9O1xuICAgICAgY2FzZSBFTlRSSUVTOiByZXR1cm4gZnVuY3Rpb24gZW50cmllcygpIHsgcmV0dXJuIG5ldyBJdGVyYXRvckNvbnN0cnVjdG9yKHRoaXMsIEtJTkQpOyB9O1xuICAgIH0gcmV0dXJuIGZ1bmN0aW9uICgpIHsgcmV0dXJuIG5ldyBJdGVyYXRvckNvbnN0cnVjdG9yKHRoaXMpOyB9O1xuICB9O1xuXG4gIHZhciBUT19TVFJJTkdfVEFHID0gTkFNRSArICcgSXRlcmF0b3InO1xuICB2YXIgSU5DT1JSRUNUX1ZBTFVFU19OQU1FID0gZmFsc2U7XG4gIHZhciBJdGVyYWJsZVByb3RvdHlwZSA9IEl0ZXJhYmxlLnByb3RvdHlwZTtcbiAgdmFyIG5hdGl2ZUl0ZXJhdG9yID0gSXRlcmFibGVQcm90b3R5cGVbSVRFUkFUT1JdXG4gICAgfHwgSXRlcmFibGVQcm90b3R5cGVbJ0BAaXRlcmF0b3InXVxuICAgIHx8IERFRkFVTFQgJiYgSXRlcmFibGVQcm90b3R5cGVbREVGQVVMVF07XG4gIHZhciBkZWZhdWx0SXRlcmF0b3IgPSAhQlVHR1lfU0FGQVJJX0lURVJBVE9SUyAmJiBuYXRpdmVJdGVyYXRvciB8fCBnZXRJdGVyYXRpb25NZXRob2QoREVGQVVMVCk7XG4gIHZhciBhbnlOYXRpdmVJdGVyYXRvciA9IE5BTUUgPT0gJ0FycmF5JyA/IEl0ZXJhYmxlUHJvdG90eXBlLmVudHJpZXMgfHwgbmF0aXZlSXRlcmF0b3IgOiBuYXRpdmVJdGVyYXRvcjtcbiAgdmFyIEN1cnJlbnRJdGVyYXRvclByb3RvdHlwZSwgbWV0aG9kcywgS0VZO1xuXG4gIC8vIGZpeCBuYXRpdmVcbiAgaWYgKGFueU5hdGl2ZUl0ZXJhdG9yKSB7XG4gICAgQ3VycmVudEl0ZXJhdG9yUHJvdG90eXBlID0gZ2V0UHJvdG90eXBlT2YoYW55TmF0aXZlSXRlcmF0b3IuY2FsbChuZXcgSXRlcmFibGUoKSkpO1xuICAgIGlmIChJdGVyYXRvclByb3RvdHlwZSAhPT0gT2JqZWN0LnByb3RvdHlwZSAmJiBDdXJyZW50SXRlcmF0b3JQcm90b3R5cGUubmV4dCkge1xuICAgICAgaWYgKCFJU19QVVJFICYmIGdldFByb3RvdHlwZU9mKEN1cnJlbnRJdGVyYXRvclByb3RvdHlwZSkgIT09IEl0ZXJhdG9yUHJvdG90eXBlKSB7XG4gICAgICAgIGlmIChzZXRQcm90b3R5cGVPZikge1xuICAgICAgICAgIHNldFByb3RvdHlwZU9mKEN1cnJlbnRJdGVyYXRvclByb3RvdHlwZSwgSXRlcmF0b3JQcm90b3R5cGUpO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBDdXJyZW50SXRlcmF0b3JQcm90b3R5cGVbSVRFUkFUT1JdICE9ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBoaWRlKEN1cnJlbnRJdGVyYXRvclByb3RvdHlwZSwgSVRFUkFUT1IsIHJldHVyblRoaXMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBTZXQgQEB0b1N0cmluZ1RhZyB0byBuYXRpdmUgaXRlcmF0b3JzXG4gICAgICBzZXRUb1N0cmluZ1RhZyhDdXJyZW50SXRlcmF0b3JQcm90b3R5cGUsIFRPX1NUUklOR19UQUcsIHRydWUsIHRydWUpO1xuICAgICAgaWYgKElTX1BVUkUpIEl0ZXJhdG9yc1tUT19TVFJJTkdfVEFHXSA9IHJldHVyblRoaXM7XG4gICAgfVxuICB9XG5cbiAgLy8gZml4IEFycmF5I3t2YWx1ZXMsIEBAaXRlcmF0b3J9Lm5hbWUgaW4gVjggLyBGRlxuICBpZiAoREVGQVVMVCA9PSBWQUxVRVMgJiYgbmF0aXZlSXRlcmF0b3IgJiYgbmF0aXZlSXRlcmF0b3IubmFtZSAhPT0gVkFMVUVTKSB7XG4gICAgSU5DT1JSRUNUX1ZBTFVFU19OQU1FID0gdHJ1ZTtcbiAgICBkZWZhdWx0SXRlcmF0b3IgPSBmdW5jdGlvbiB2YWx1ZXMoKSB7IHJldHVybiBuYXRpdmVJdGVyYXRvci5jYWxsKHRoaXMpOyB9O1xuICB9XG5cbiAgLy8gZGVmaW5lIGl0ZXJhdG9yXG4gIGlmICgoIUlTX1BVUkUgfHwgRk9SQ0VEKSAmJiBJdGVyYWJsZVByb3RvdHlwZVtJVEVSQVRPUl0gIT09IGRlZmF1bHRJdGVyYXRvcikge1xuICAgIGhpZGUoSXRlcmFibGVQcm90b3R5cGUsIElURVJBVE9SLCBkZWZhdWx0SXRlcmF0b3IpO1xuICB9XG4gIEl0ZXJhdG9yc1tOQU1FXSA9IGRlZmF1bHRJdGVyYXRvcjtcblxuICAvLyBleHBvcnQgYWRkaXRpb25hbCBtZXRob2RzXG4gIGlmIChERUZBVUxUKSB7XG4gICAgbWV0aG9kcyA9IHtcbiAgICAgIHZhbHVlczogZ2V0SXRlcmF0aW9uTWV0aG9kKFZBTFVFUyksXG4gICAgICBrZXlzOiBJU19TRVQgPyBkZWZhdWx0SXRlcmF0b3IgOiBnZXRJdGVyYXRpb25NZXRob2QoS0VZUyksXG4gICAgICBlbnRyaWVzOiBnZXRJdGVyYXRpb25NZXRob2QoRU5UUklFUylcbiAgICB9O1xuICAgIGlmIChGT1JDRUQpIGZvciAoS0VZIGluIG1ldGhvZHMpIHtcbiAgICAgIGlmIChCVUdHWV9TQUZBUklfSVRFUkFUT1JTIHx8IElOQ09SUkVDVF9WQUxVRVNfTkFNRSB8fCAhKEtFWSBpbiBJdGVyYWJsZVByb3RvdHlwZSkpIHtcbiAgICAgICAgcmVkZWZpbmUoSXRlcmFibGVQcm90b3R5cGUsIEtFWSwgbWV0aG9kc1tLRVldKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgJCh7IHRhcmdldDogTkFNRSwgcHJvdG86IHRydWUsIGZvcmNlZDogQlVHR1lfU0FGQVJJX0lURVJBVE9SUyB8fCBJTkNPUlJFQ1RfVkFMVUVTX05BTUUgfSwgbWV0aG9kcyk7XG4gIH1cblxuICByZXR1cm4gbWV0aG9kcztcbn07XG4iLCJ2YXIgZmFpbHMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZmFpbHMnKTtcblxuLy8gVGhhbmsncyBJRTggZm9yIGhpcyBmdW5ueSBkZWZpbmVQcm9wZXJ0eVxubW9kdWxlLmV4cG9ydHMgPSAhZmFpbHMoZnVuY3Rpb24gKCkge1xuICByZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnR5KHt9LCAnYScsIHsgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiA3OyB9IH0pLmEgIT0gNztcbn0pO1xuIiwidmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9nbG9iYWwnKTtcbnZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pcy1vYmplY3QnKTtcblxudmFyIGRvY3VtZW50ID0gZ2xvYmFsLmRvY3VtZW50O1xuLy8gdHlwZW9mIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgaXMgJ29iamVjdCcgaW4gb2xkIElFXG52YXIgZXhpc3QgPSBpc09iamVjdChkb2N1bWVudCkgJiYgaXNPYmplY3QoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBleGlzdCA/IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoaXQpIDoge307XG59O1xuIiwiLy8gaXRlcmFibGUgRE9NIGNvbGxlY3Rpb25zXG4vLyBmbGFnIC0gYGl0ZXJhYmxlYCBpbnRlcmZhY2UgLSAnZW50cmllcycsICdrZXlzJywgJ3ZhbHVlcycsICdmb3JFYWNoJyBtZXRob2RzXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgQ1NTUnVsZUxpc3Q6IDAsXG4gIENTU1N0eWxlRGVjbGFyYXRpb246IDAsXG4gIENTU1ZhbHVlTGlzdDogMCxcbiAgQ2xpZW50UmVjdExpc3Q6IDAsXG4gIERPTVJlY3RMaXN0OiAwLFxuICBET01TdHJpbmdMaXN0OiAwLFxuICBET01Ub2tlbkxpc3Q6IDEsXG4gIERhdGFUcmFuc2Zlckl0ZW1MaXN0OiAwLFxuICBGaWxlTGlzdDogMCxcbiAgSFRNTEFsbENvbGxlY3Rpb246IDAsXG4gIEhUTUxDb2xsZWN0aW9uOiAwLFxuICBIVE1MRm9ybUVsZW1lbnQ6IDAsXG4gIEhUTUxTZWxlY3RFbGVtZW50OiAwLFxuICBNZWRpYUxpc3Q6IDAsXG4gIE1pbWVUeXBlQXJyYXk6IDAsXG4gIE5hbWVkTm9kZU1hcDogMCxcbiAgTm9kZUxpc3Q6IDEsXG4gIFBhaW50UmVxdWVzdExpc3Q6IDAsXG4gIFBsdWdpbjogMCxcbiAgUGx1Z2luQXJyYXk6IDAsXG4gIFNWR0xlbmd0aExpc3Q6IDAsXG4gIFNWR051bWJlckxpc3Q6IDAsXG4gIFNWR1BhdGhTZWdMaXN0OiAwLFxuICBTVkdQb2ludExpc3Q6IDAsXG4gIFNWR1N0cmluZ0xpc3Q6IDAsXG4gIFNWR1RyYW5zZm9ybUxpc3Q6IDAsXG4gIFNvdXJjZUJ1ZmZlckxpc3Q6IDAsXG4gIFN0eWxlU2hlZXRMaXN0OiAwLFxuICBUZXh0VHJhY2tDdWVMaXN0OiAwLFxuICBUZXh0VHJhY2tMaXN0OiAwLFxuICBUb3VjaExpc3Q6IDBcbn07XG4iLCIvLyBJRTgtIGRvbid0IGVudW0gYnVnIGtleXNcbm1vZHVsZS5leHBvcnRzID0gW1xuICAnY29uc3RydWN0b3InLFxuICAnaGFzT3duUHJvcGVydHknLFxuICAnaXNQcm90b3R5cGVPZicsXG4gICdwcm9wZXJ0eUlzRW51bWVyYWJsZScsXG4gICd0b0xvY2FsZVN0cmluZycsXG4gICd0b1N0cmluZycsXG4gICd2YWx1ZU9mJ1xuXTtcbiIsInZhciBnbG9iYWwgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZ2xvYmFsJyk7XG52YXIgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL29iamVjdC1nZXQtb3duLXByb3BlcnR5LWRlc2NyaXB0b3InKS5mO1xudmFyIGhpZGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaGlkZScpO1xudmFyIHJlZGVmaW5lID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3JlZGVmaW5lJyk7XG52YXIgc2V0R2xvYmFsID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3NldC1nbG9iYWwnKTtcbnZhciBjb3B5Q29uc3RydWN0b3JQcm9wZXJ0aWVzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2NvcHktY29uc3RydWN0b3ItcHJvcGVydGllcycpO1xudmFyIGlzRm9yY2VkID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2lzLWZvcmNlZCcpO1xuXG4vKlxuICBvcHRpb25zLnRhcmdldCAgICAgIC0gbmFtZSBvZiB0aGUgdGFyZ2V0IG9iamVjdFxuICBvcHRpb25zLmdsb2JhbCAgICAgIC0gdGFyZ2V0IGlzIHRoZSBnbG9iYWwgb2JqZWN0XG4gIG9wdGlvbnMuc3RhdCAgICAgICAgLSBleHBvcnQgYXMgc3RhdGljIG1ldGhvZHMgb2YgdGFyZ2V0XG4gIG9wdGlvbnMucHJvdG8gICAgICAgLSBleHBvcnQgYXMgcHJvdG90eXBlIG1ldGhvZHMgb2YgdGFyZ2V0XG4gIG9wdGlvbnMucmVhbCAgICAgICAgLSByZWFsIHByb3RvdHlwZSBtZXRob2QgZm9yIHRoZSBgcHVyZWAgdmVyc2lvblxuICBvcHRpb25zLmZvcmNlZCAgICAgIC0gZXhwb3J0IGV2ZW4gaWYgdGhlIG5hdGl2ZSBmZWF0dXJlIGlzIGF2YWlsYWJsZVxuICBvcHRpb25zLmJpbmQgICAgICAgIC0gYmluZCBtZXRob2RzIHRvIHRoZSB0YXJnZXQsIHJlcXVpcmVkIGZvciB0aGUgYHB1cmVgIHZlcnNpb25cbiAgb3B0aW9ucy53cmFwICAgICAgICAtIHdyYXAgY29uc3RydWN0b3JzIHRvIHByZXZlbnRpbmcgZ2xvYmFsIHBvbGx1dGlvbiwgcmVxdWlyZWQgZm9yIHRoZSBgcHVyZWAgdmVyc2lvblxuICBvcHRpb25zLnVuc2FmZSAgICAgIC0gdXNlIHRoZSBzaW1wbGUgYXNzaWdubWVudCBvZiBwcm9wZXJ0eSBpbnN0ZWFkIG9mIGRlbGV0ZSArIGRlZmluZVByb3BlcnR5XG4gIG9wdGlvbnMuc2hhbSAgICAgICAgLSBhZGQgYSBmbGFnIHRvIG5vdCBjb21wbGV0ZWx5IGZ1bGwgcG9seWZpbGxzXG4gIG9wdGlvbnMuZW51bWVyYWJsZSAgLSBleHBvcnQgYXMgZW51bWVyYWJsZSBwcm9wZXJ0eVxuICBvcHRpb25zLm5vVGFyZ2V0R2V0IC0gcHJldmVudCBjYWxsaW5nIGEgZ2V0dGVyIG9uIHRhcmdldFxuKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG9wdGlvbnMsIHNvdXJjZSkge1xuICB2YXIgVEFSR0VUID0gb3B0aW9ucy50YXJnZXQ7XG4gIHZhciBHTE9CQUwgPSBvcHRpb25zLmdsb2JhbDtcbiAgdmFyIFNUQVRJQyA9IG9wdGlvbnMuc3RhdDtcbiAgdmFyIEZPUkNFRCwgdGFyZ2V0LCBrZXksIHRhcmdldFByb3BlcnR5LCBzb3VyY2VQcm9wZXJ0eSwgZGVzY3JpcHRvcjtcbiAgaWYgKEdMT0JBTCkge1xuICAgIHRhcmdldCA9IGdsb2JhbDtcbiAgfSBlbHNlIGlmIChTVEFUSUMpIHtcbiAgICB0YXJnZXQgPSBnbG9iYWxbVEFSR0VUXSB8fCBzZXRHbG9iYWwoVEFSR0VULCB7fSk7XG4gIH0gZWxzZSB7XG4gICAgdGFyZ2V0ID0gKGdsb2JhbFtUQVJHRVRdIHx8IHt9KS5wcm90b3R5cGU7XG4gIH1cbiAgaWYgKHRhcmdldCkgZm9yIChrZXkgaW4gc291cmNlKSB7XG4gICAgc291cmNlUHJvcGVydHkgPSBzb3VyY2Vba2V5XTtcbiAgICBpZiAob3B0aW9ucy5ub1RhcmdldEdldCkge1xuICAgICAgZGVzY3JpcHRvciA9IGdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIGtleSk7XG4gICAgICB0YXJnZXRQcm9wZXJ0eSA9IGRlc2NyaXB0b3IgJiYgZGVzY3JpcHRvci52YWx1ZTtcbiAgICB9IGVsc2UgdGFyZ2V0UHJvcGVydHkgPSB0YXJnZXRba2V5XTtcbiAgICBGT1JDRUQgPSBpc0ZvcmNlZChHTE9CQUwgPyBrZXkgOiBUQVJHRVQgKyAoU1RBVElDID8gJy4nIDogJyMnKSArIGtleSwgb3B0aW9ucy5mb3JjZWQpO1xuICAgIC8vIGNvbnRhaW5lZCBpbiB0YXJnZXRcbiAgICBpZiAoIUZPUkNFRCAmJiB0YXJnZXRQcm9wZXJ0eSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAodHlwZW9mIHNvdXJjZVByb3BlcnR5ID09PSB0eXBlb2YgdGFyZ2V0UHJvcGVydHkpIGNvbnRpbnVlO1xuICAgICAgY29weUNvbnN0cnVjdG9yUHJvcGVydGllcyhzb3VyY2VQcm9wZXJ0eSwgdGFyZ2V0UHJvcGVydHkpO1xuICAgIH1cbiAgICAvLyBhZGQgYSBmbGFnIHRvIG5vdCBjb21wbGV0ZWx5IGZ1bGwgcG9seWZpbGxzXG4gICAgaWYgKG9wdGlvbnMuc2hhbSB8fCAodGFyZ2V0UHJvcGVydHkgJiYgdGFyZ2V0UHJvcGVydHkuc2hhbSkpIHtcbiAgICAgIGhpZGUoc291cmNlUHJvcGVydHksICdzaGFtJywgdHJ1ZSk7XG4gICAgfVxuICAgIC8vIGV4dGVuZCBnbG9iYWxcbiAgICByZWRlZmluZSh0YXJnZXQsIGtleSwgc291cmNlUHJvcGVydHksIG9wdGlvbnMpO1xuICB9XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZXhlYykge1xuICB0cnkge1xuICAgIHJldHVybiAhIWV4ZWMoKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBoaWRlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2hpZGUnKTtcbnZhciByZWRlZmluZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9yZWRlZmluZScpO1xudmFyIGZhaWxzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2ZhaWxzJyk7XG52YXIgd2VsbEtub3duU3ltYm9sID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3dlbGwta25vd24tc3ltYm9sJyk7XG52YXIgcmVnZXhwRXhlYyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9yZWdleHAtZXhlYycpO1xuXG52YXIgU1BFQ0lFUyA9IHdlbGxLbm93blN5bWJvbCgnc3BlY2llcycpO1xuXG52YXIgUkVQTEFDRV9TVVBQT1JUU19OQU1FRF9HUk9VUFMgPSAhZmFpbHMoZnVuY3Rpb24gKCkge1xuICAvLyAjcmVwbGFjZSBuZWVkcyBidWlsdC1pbiBzdXBwb3J0IGZvciBuYW1lZCBncm91cHMuXG4gIC8vICNtYXRjaCB3b3JrcyBmaW5lIGJlY2F1c2UgaXQganVzdCByZXR1cm4gdGhlIGV4ZWMgcmVzdWx0cywgZXZlbiBpZiBpdCBoYXNcbiAgLy8gYSBcImdyb3BzXCIgcHJvcGVydHkuXG4gIHZhciByZSA9IC8uLztcbiAgcmUuZXhlYyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgcmVzdWx0Lmdyb3VwcyA9IHsgYTogJzcnIH07XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcbiAgcmV0dXJuICcnLnJlcGxhY2UocmUsICckPGE+JykgIT09ICc3Jztcbn0pO1xuXG4vLyBDaHJvbWUgNTEgaGFzIGEgYnVnZ3kgXCJzcGxpdFwiIGltcGxlbWVudGF0aW9uIHdoZW4gUmVnRXhwI2V4ZWMgIT09IG5hdGl2ZUV4ZWNcbi8vIFdlZXggSlMgaGFzIGZyb3plbiBidWlsdC1pbiBwcm90b3R5cGVzLCBzbyB1c2UgdHJ5IC8gY2F0Y2ggd3JhcHBlclxudmFyIFNQTElUX1dPUktTX1dJVEhfT1ZFUldSSVRURU5fRVhFQyA9ICFmYWlscyhmdW5jdGlvbiAoKSB7XG4gIHZhciByZSA9IC8oPzopLztcbiAgdmFyIG9yaWdpbmFsRXhlYyA9IHJlLmV4ZWM7XG4gIHJlLmV4ZWMgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBvcmlnaW5hbEV4ZWMuYXBwbHkodGhpcywgYXJndW1lbnRzKTsgfTtcbiAgdmFyIHJlc3VsdCA9ICdhYicuc3BsaXQocmUpO1xuICByZXR1cm4gcmVzdWx0Lmxlbmd0aCAhPT0gMiB8fCByZXN1bHRbMF0gIT09ICdhJyB8fCByZXN1bHRbMV0gIT09ICdiJztcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChLRVksIGxlbmd0aCwgZXhlYywgc2hhbSkge1xuICB2YXIgU1lNQk9MID0gd2VsbEtub3duU3ltYm9sKEtFWSk7XG5cbiAgdmFyIERFTEVHQVRFU19UT19TWU1CT0wgPSAhZmFpbHMoZnVuY3Rpb24gKCkge1xuICAgIC8vIFN0cmluZyBtZXRob2RzIGNhbGwgc3ltYm9sLW5hbWVkIFJlZ0VwIG1ldGhvZHNcbiAgICB2YXIgTyA9IHt9O1xuICAgIE9bU1lNQk9MXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIDc7IH07XG4gICAgcmV0dXJuICcnW0tFWV0oTykgIT0gNztcbiAgfSk7XG5cbiAgdmFyIERFTEVHQVRFU19UT19FWEVDID0gREVMRUdBVEVTX1RPX1NZTUJPTCAmJiAhZmFpbHMoZnVuY3Rpb24gKCkge1xuICAgIC8vIFN5bWJvbC1uYW1lZCBSZWdFeHAgbWV0aG9kcyBjYWxsIC5leGVjXG4gICAgdmFyIGV4ZWNDYWxsZWQgPSBmYWxzZTtcbiAgICB2YXIgcmUgPSAvYS87XG4gICAgcmUuZXhlYyA9IGZ1bmN0aW9uICgpIHsgZXhlY0NhbGxlZCA9IHRydWU7IHJldHVybiBudWxsOyB9O1xuXG4gICAgaWYgKEtFWSA9PT0gJ3NwbGl0Jykge1xuICAgICAgLy8gUmVnRXhwW0BAc3BsaXRdIGRvZXNuJ3QgY2FsbCB0aGUgcmVnZXgncyBleGVjIG1ldGhvZCwgYnV0IGZpcnN0IGNyZWF0ZXNcbiAgICAgIC8vIGEgbmV3IG9uZS4gV2UgbmVlZCB0byByZXR1cm4gdGhlIHBhdGNoZWQgcmVnZXggd2hlbiBjcmVhdGluZyB0aGUgbmV3IG9uZS5cbiAgICAgIHJlLmNvbnN0cnVjdG9yID0ge307XG4gICAgICByZS5jb25zdHJ1Y3RvcltTUEVDSUVTXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHJlOyB9O1xuICAgIH1cblxuICAgIHJlW1NZTUJPTF0oJycpO1xuICAgIHJldHVybiAhZXhlY0NhbGxlZDtcbiAgfSk7XG5cbiAgaWYgKFxuICAgICFERUxFR0FURVNfVE9fU1lNQk9MIHx8XG4gICAgIURFTEVHQVRFU19UT19FWEVDIHx8XG4gICAgKEtFWSA9PT0gJ3JlcGxhY2UnICYmICFSRVBMQUNFX1NVUFBPUlRTX05BTUVEX0dST1VQUykgfHxcbiAgICAoS0VZID09PSAnc3BsaXQnICYmICFTUExJVF9XT1JLU19XSVRIX09WRVJXUklUVEVOX0VYRUMpXG4gICkge1xuICAgIHZhciBuYXRpdmVSZWdFeHBNZXRob2QgPSAvLi9bU1lNQk9MXTtcbiAgICB2YXIgbWV0aG9kcyA9IGV4ZWMoU1lNQk9MLCAnJ1tLRVldLCBmdW5jdGlvbiAobmF0aXZlTWV0aG9kLCByZWdleHAsIHN0ciwgYXJnMiwgZm9yY2VTdHJpbmdNZXRob2QpIHtcbiAgICAgIGlmIChyZWdleHAuZXhlYyA9PT0gcmVnZXhwRXhlYykge1xuICAgICAgICBpZiAoREVMRUdBVEVTX1RPX1NZTUJPTCAmJiAhZm9yY2VTdHJpbmdNZXRob2QpIHtcbiAgICAgICAgICAvLyBUaGUgbmF0aXZlIFN0cmluZyBtZXRob2QgYWxyZWFkeSBkZWxlZ2F0ZXMgdG8gQEBtZXRob2QgKHRoaXNcbiAgICAgICAgICAvLyBwb2x5ZmlsbGVkIGZ1bmN0aW9uKSwgbGVhc2luZyB0byBpbmZpbml0ZSByZWN1cnNpb24uXG4gICAgICAgICAgLy8gV2UgYXZvaWQgaXQgYnkgZGlyZWN0bHkgY2FsbGluZyB0aGUgbmF0aXZlIEBAbWV0aG9kIG1ldGhvZC5cbiAgICAgICAgICByZXR1cm4geyBkb25lOiB0cnVlLCB2YWx1ZTogbmF0aXZlUmVnRXhwTWV0aG9kLmNhbGwocmVnZXhwLCBzdHIsIGFyZzIpIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgZG9uZTogdHJ1ZSwgdmFsdWU6IG5hdGl2ZU1ldGhvZC5jYWxsKHN0ciwgcmVnZXhwLCBhcmcyKSB9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHsgZG9uZTogZmFsc2UgfTtcbiAgICB9KTtcbiAgICB2YXIgc3RyaW5nTWV0aG9kID0gbWV0aG9kc1swXTtcbiAgICB2YXIgcmVnZXhNZXRob2QgPSBtZXRob2RzWzFdO1xuXG4gICAgcmVkZWZpbmUoU3RyaW5nLnByb3RvdHlwZSwgS0VZLCBzdHJpbmdNZXRob2QpO1xuICAgIHJlZGVmaW5lKFJlZ0V4cC5wcm90b3R5cGUsIFNZTUJPTCwgbGVuZ3RoID09IDJcbiAgICAgIC8vIDIxLjIuNS44IFJlZ0V4cC5wcm90b3R5cGVbQEByZXBsYWNlXShzdHJpbmcsIHJlcGxhY2VWYWx1ZSlcbiAgICAgIC8vIDIxLjIuNS4xMSBSZWdFeHAucHJvdG90eXBlW0BAc3BsaXRdKHN0cmluZywgbGltaXQpXG4gICAgICA/IGZ1bmN0aW9uIChzdHJpbmcsIGFyZykgeyByZXR1cm4gcmVnZXhNZXRob2QuY2FsbChzdHJpbmcsIHRoaXMsIGFyZyk7IH1cbiAgICAgIC8vIDIxLjIuNS42IFJlZ0V4cC5wcm90b3R5cGVbQEBtYXRjaF0oc3RyaW5nKVxuICAgICAgLy8gMjEuMi41LjkgUmVnRXhwLnByb3RvdHlwZVtAQHNlYXJjaF0oc3RyaW5nKVxuICAgICAgOiBmdW5jdGlvbiAoc3RyaW5nKSB7IHJldHVybiByZWdleE1ldGhvZC5jYWxsKHN0cmluZywgdGhpcyk7IH1cbiAgICApO1xuICAgIGlmIChzaGFtKSBoaWRlKFJlZ0V4cC5wcm90b3R5cGVbU1lNQk9MXSwgJ3NoYW0nLCB0cnVlKTtcbiAgfVxufTtcbiIsInZhciBmYWlscyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9mYWlscycpO1xudmFyIHdoaXRlc3BhY2VzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3doaXRlc3BhY2VzJyk7XG5cbnZhciBub24gPSAnXFx1MjAwQlxcdTAwODVcXHUxODBFJztcblxuLy8gY2hlY2sgdGhhdCBhIG1ldGhvZCB3b3JrcyB3aXRoIHRoZSBjb3JyZWN0IGxpc3Rcbi8vIG9mIHdoaXRlc3BhY2VzIGFuZCBoYXMgYSBjb3JyZWN0IG5hbWVcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKE1FVEhPRF9OQU1FKSB7XG4gIHJldHVybiBmYWlscyhmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICEhd2hpdGVzcGFjZXNbTUVUSE9EX05BTUVdKCkgfHwgbm9uW01FVEhPRF9OQU1FXSgpICE9IG5vbiB8fCB3aGl0ZXNwYWNlc1tNRVRIT0RfTkFNRV0ubmFtZSAhPT0gTUVUSE9EX05BTUU7XG4gIH0pO1xufTtcbiIsInZhciBzaGFyZWQgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvc2hhcmVkJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gc2hhcmVkKCduYXRpdmUtZnVuY3Rpb24tdG8tc3RyaW5nJywgRnVuY3Rpb24udG9TdHJpbmcpO1xuIiwidmFyIGNsYXNzb2YgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvY2xhc3NvZicpO1xudmFyIEl0ZXJhdG9ycyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pdGVyYXRvcnMnKTtcbnZhciB3ZWxsS25vd25TeW1ib2wgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvd2VsbC1rbm93bi1zeW1ib2wnKTtcblxudmFyIElURVJBVE9SID0gd2VsbEtub3duU3ltYm9sKCdpdGVyYXRvcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICBpZiAoaXQgIT0gdW5kZWZpbmVkKSByZXR1cm4gaXRbSVRFUkFUT1JdXG4gICAgfHwgaXRbJ0BAaXRlcmF0b3InXVxuICAgIHx8IEl0ZXJhdG9yc1tjbGFzc29mKGl0KV07XG59O1xuIiwidmFyIE8gPSAnb2JqZWN0JztcbnZhciBjaGVjayA9IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gaXQgJiYgaXQuTWF0aCA9PSBNYXRoICYmIGl0O1xufTtcblxuLy8gaHR0cHM6Ly9naXRodWIuY29tL3psb2lyb2NrL2NvcmUtanMvaXNzdWVzLzg2I2lzc3VlY29tbWVudC0xMTU3NTkwMjhcbm1vZHVsZS5leHBvcnRzID1cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXG4gIGNoZWNrKHR5cGVvZiBnbG9iYWxUaGlzID09IE8gJiYgZ2xvYmFsVGhpcykgfHxcbiAgY2hlY2sodHlwZW9mIHdpbmRvdyA9PSBPICYmIHdpbmRvdykgfHxcbiAgY2hlY2sodHlwZW9mIHNlbGYgPT0gTyAmJiBzZWxmKSB8fFxuICBjaGVjayh0eXBlb2YgZ2xvYmFsID09IE8gJiYgZ2xvYmFsKSB8fFxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tbmV3LWZ1bmNcbiAgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcbiIsInZhciBoYXNPd25Qcm9wZXJ0eSA9IHt9Lmhhc093blByb3BlcnR5O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCwga2V5KSB7XG4gIHJldHVybiBoYXNPd25Qcm9wZXJ0eS5jYWxsKGl0LCBrZXkpO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge307XG4iLCJ2YXIgREVTQ1JJUFRPUlMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZGVzY3JpcHRvcnMnKTtcbnZhciBkZWZpbmVQcm9wZXJ0eU1vZHVsZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9vYmplY3QtZGVmaW5lLXByb3BlcnR5Jyk7XG52YXIgY3JlYXRlUHJvcGVydHlEZXNjcmlwdG9yID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2NyZWF0ZS1wcm9wZXJ0eS1kZXNjcmlwdG9yJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gREVTQ1JJUFRPUlMgPyBmdW5jdGlvbiAob2JqZWN0LCBrZXksIHZhbHVlKSB7XG4gIHJldHVybiBkZWZpbmVQcm9wZXJ0eU1vZHVsZS5mKG9iamVjdCwga2V5LCBjcmVhdGVQcm9wZXJ0eURlc2NyaXB0b3IoMSwgdmFsdWUpKTtcbn0gOiBmdW5jdGlvbiAob2JqZWN0LCBrZXksIHZhbHVlKSB7XG4gIG9iamVjdFtrZXldID0gdmFsdWU7XG4gIHJldHVybiBvYmplY3Q7XG59O1xuIiwidmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9nbG9iYWwnKTtcblxudmFyIGRvY3VtZW50ID0gZ2xvYmFsLmRvY3VtZW50O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRvY3VtZW50ICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcbiIsInZhciBERVNDUklQVE9SUyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9kZXNjcmlwdG9ycycpO1xudmFyIGZhaWxzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2ZhaWxzJyk7XG52YXIgY3JlYXRlRWxlbWVudCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9kb2N1bWVudC1jcmVhdGUtZWxlbWVudCcpO1xuXG4vLyBUaGFuaydzIElFOCBmb3IgaGlzIGZ1bm55IGRlZmluZVByb3BlcnR5XG5tb2R1bGUuZXhwb3J0cyA9ICFERVNDUklQVE9SUyAmJiAhZmFpbHMoZnVuY3Rpb24gKCkge1xuICByZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnR5KGNyZWF0ZUVsZW1lbnQoJ2RpdicpLCAnYScsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIDc7IH1cbiAgfSkuYSAhPSA3O1xufSk7XG4iLCIvLyBmYWxsYmFjayBmb3Igbm9uLWFycmF5LWxpa2UgRVMzIGFuZCBub24tZW51bWVyYWJsZSBvbGQgVjggc3RyaW5nc1xudmFyIGZhaWxzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2ZhaWxzJyk7XG52YXIgY2xhc3NvZiA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9jbGFzc29mLXJhdycpO1xuXG52YXIgc3BsaXQgPSAnJy5zcGxpdDtcblxubW9kdWxlLmV4cG9ydHMgPSBmYWlscyhmdW5jdGlvbiAoKSB7XG4gIC8vIHRocm93cyBhbiBlcnJvciBpbiByaGlubywgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9tb3ppbGxhL3JoaW5vL2lzc3Vlcy8zNDZcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXByb3RvdHlwZS1idWlsdGluc1xuICByZXR1cm4gIU9iamVjdCgneicpLnByb3BlcnR5SXNFbnVtZXJhYmxlKDApO1xufSkgPyBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIGNsYXNzb2YoaXQpID09ICdTdHJpbmcnID8gc3BsaXQuY2FsbChpdCwgJycpIDogT2JqZWN0KGl0KTtcbn0gOiBPYmplY3Q7XG4iLCJ2YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaXMtb2JqZWN0Jyk7XG52YXIgc2V0UHJvdG90eXBlT2YgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0LXNldC1wcm90b3R5cGUtb2YnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAodGhhdCwgdGFyZ2V0LCBDKSB7XG4gIHZhciBTID0gdGFyZ2V0LmNvbnN0cnVjdG9yO1xuICB2YXIgUDtcbiAgaWYgKFMgIT09IEMgJiYgdHlwZW9mIFMgPT0gJ2Z1bmN0aW9uJyAmJiAoUCA9IFMucHJvdG90eXBlKSAhPT0gQy5wcm90b3R5cGUgJiYgaXNPYmplY3QoUCkgJiYgc2V0UHJvdG90eXBlT2YpIHtcbiAgICBzZXRQcm90b3R5cGVPZih0aGF0LCBQKTtcbiAgfSByZXR1cm4gdGhhdDtcbn07XG4iLCJ2YXIgTkFUSVZFX1dFQUtfTUFQID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL25hdGl2ZS13ZWFrLW1hcCcpO1xudmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9nbG9iYWwnKTtcbnZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pcy1vYmplY3QnKTtcbnZhciBoaWRlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2hpZGUnKTtcbnZhciBvYmplY3RIYXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaGFzJyk7XG52YXIgc2hhcmVkS2V5ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3NoYXJlZC1rZXknKTtcbnZhciBoaWRkZW5LZXlzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2hpZGRlbi1rZXlzJyk7XG5cbnZhciBXZWFrTWFwID0gZ2xvYmFsLldlYWtNYXA7XG52YXIgc2V0LCBnZXQsIGhhcztcblxudmFyIGVuZm9yY2UgPSBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIGhhcyhpdCkgPyBnZXQoaXQpIDogc2V0KGl0LCB7fSk7XG59O1xuXG52YXIgZ2V0dGVyRm9yID0gZnVuY3Rpb24gKFRZUEUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChpdCkge1xuICAgIHZhciBzdGF0ZTtcbiAgICBpZiAoIWlzT2JqZWN0KGl0KSB8fCAoc3RhdGUgPSBnZXQoaXQpKS50eXBlICE9PSBUWVBFKSB7XG4gICAgICB0aHJvdyBUeXBlRXJyb3IoJ0luY29tcGF0aWJsZSByZWNlaXZlciwgJyArIFRZUEUgKyAnIHJlcXVpcmVkJyk7XG4gICAgfSByZXR1cm4gc3RhdGU7XG4gIH07XG59O1xuXG5pZiAoTkFUSVZFX1dFQUtfTUFQKSB7XG4gIHZhciBzdG9yZSA9IG5ldyBXZWFrTWFwKCk7XG4gIHZhciB3bWdldCA9IHN0b3JlLmdldDtcbiAgdmFyIHdtaGFzID0gc3RvcmUuaGFzO1xuICB2YXIgd21zZXQgPSBzdG9yZS5zZXQ7XG4gIHNldCA9IGZ1bmN0aW9uIChpdCwgbWV0YWRhdGEpIHtcbiAgICB3bXNldC5jYWxsKHN0b3JlLCBpdCwgbWV0YWRhdGEpO1xuICAgIHJldHVybiBtZXRhZGF0YTtcbiAgfTtcbiAgZ2V0ID0gZnVuY3Rpb24gKGl0KSB7XG4gICAgcmV0dXJuIHdtZ2V0LmNhbGwoc3RvcmUsIGl0KSB8fCB7fTtcbiAgfTtcbiAgaGFzID0gZnVuY3Rpb24gKGl0KSB7XG4gICAgcmV0dXJuIHdtaGFzLmNhbGwoc3RvcmUsIGl0KTtcbiAgfTtcbn0gZWxzZSB7XG4gIHZhciBTVEFURSA9IHNoYXJlZEtleSgnc3RhdGUnKTtcbiAgaGlkZGVuS2V5c1tTVEFURV0gPSB0cnVlO1xuICBzZXQgPSBmdW5jdGlvbiAoaXQsIG1ldGFkYXRhKSB7XG4gICAgaGlkZShpdCwgU1RBVEUsIG1ldGFkYXRhKTtcbiAgICByZXR1cm4gbWV0YWRhdGE7XG4gIH07XG4gIGdldCA9IGZ1bmN0aW9uIChpdCkge1xuICAgIHJldHVybiBvYmplY3RIYXMoaXQsIFNUQVRFKSA/IGl0W1NUQVRFXSA6IHt9O1xuICB9O1xuICBoYXMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgICByZXR1cm4gb2JqZWN0SGFzKGl0LCBTVEFURSk7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBzZXQ6IHNldCxcbiAgZ2V0OiBnZXQsXG4gIGhhczogaGFzLFxuICBlbmZvcmNlOiBlbmZvcmNlLFxuICBnZXR0ZXJGb3I6IGdldHRlckZvclxufTtcbiIsInZhciB3ZWxsS25vd25TeW1ib2wgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvd2VsbC1rbm93bi1zeW1ib2wnKTtcbnZhciBJdGVyYXRvcnMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaXRlcmF0b3JzJyk7XG5cbnZhciBJVEVSQVRPUiA9IHdlbGxLbm93blN5bWJvbCgnaXRlcmF0b3InKTtcbnZhciBBcnJheVByb3RvdHlwZSA9IEFycmF5LnByb3RvdHlwZTtcblxuLy8gY2hlY2sgb24gZGVmYXVsdCBBcnJheSBpdGVyYXRvclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIGl0ICE9PSB1bmRlZmluZWQgJiYgKEl0ZXJhdG9ycy5BcnJheSA9PT0gaXQgfHwgQXJyYXlQcm90b3R5cGVbSVRFUkFUT1JdID09PSBpdCk7XG59O1xuIiwidmFyIGNsYXNzb2YgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvY2xhc3NvZi1yYXcnKTtcblxuLy8gYElzQXJyYXlgIGFic3RyYWN0IG9wZXJhdGlvblxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtaXNhcnJheVxubW9kdWxlLmV4cG9ydHMgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uIGlzQXJyYXkoYXJnKSB7XG4gIHJldHVybiBjbGFzc29mKGFyZykgPT0gJ0FycmF5Jztcbn07XG4iLCJ2YXIgZmFpbHMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZmFpbHMnKTtcblxudmFyIHJlcGxhY2VtZW50ID0gLyN8XFwucHJvdG90eXBlXFwuLztcblxudmFyIGlzRm9yY2VkID0gZnVuY3Rpb24gKGZlYXR1cmUsIGRldGVjdGlvbikge1xuICB2YXIgdmFsdWUgPSBkYXRhW25vcm1hbGl6ZShmZWF0dXJlKV07XG4gIHJldHVybiB2YWx1ZSA9PSBQT0xZRklMTCA/IHRydWVcbiAgICA6IHZhbHVlID09IE5BVElWRSA/IGZhbHNlXG4gICAgOiB0eXBlb2YgZGV0ZWN0aW9uID09ICdmdW5jdGlvbicgPyBmYWlscyhkZXRlY3Rpb24pXG4gICAgOiAhIWRldGVjdGlvbjtcbn07XG5cbnZhciBub3JtYWxpemUgPSBpc0ZvcmNlZC5ub3JtYWxpemUgPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gIHJldHVybiBTdHJpbmcoc3RyaW5nKS5yZXBsYWNlKHJlcGxhY2VtZW50LCAnLicpLnRvTG93ZXJDYXNlKCk7XG59O1xuXG52YXIgZGF0YSA9IGlzRm9yY2VkLmRhdGEgPSB7fTtcbnZhciBOQVRJVkUgPSBpc0ZvcmNlZC5OQVRJVkUgPSAnTic7XG52YXIgUE9MWUZJTEwgPSBpc0ZvcmNlZC5QT0xZRklMTCA9ICdQJztcblxubW9kdWxlLmV4cG9ydHMgPSBpc0ZvcmNlZDtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiB0eXBlb2YgaXQgPT09ICdvYmplY3QnID8gaXQgIT09IG51bGwgOiB0eXBlb2YgaXQgPT09ICdmdW5jdGlvbic7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmYWxzZTtcbiIsInZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pcy1vYmplY3QnKTtcbnZhciBjbGFzc29mID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2NsYXNzb2YtcmF3Jyk7XG52YXIgd2VsbEtub3duU3ltYm9sID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3dlbGwta25vd24tc3ltYm9sJyk7XG5cbnZhciBNQVRDSCA9IHdlbGxLbm93blN5bWJvbCgnbWF0Y2gnKTtcblxuLy8gYElzUmVnRXhwYCBhYnN0cmFjdCBvcGVyYXRpb25cbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLWlzcmVnZXhwXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICB2YXIgaXNSZWdFeHA7XG4gIHJldHVybiBpc09iamVjdChpdCkgJiYgKChpc1JlZ0V4cCA9IGl0W01BVENIXSkgIT09IHVuZGVmaW5lZCA/ICEhaXNSZWdFeHAgOiBjbGFzc29mKGl0KSA9PSAnUmVnRXhwJyk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIGdldFByb3RvdHlwZU9mID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL29iamVjdC1nZXQtcHJvdG90eXBlLW9mJyk7XG52YXIgaGlkZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9oaWRlJyk7XG52YXIgaGFzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2hhcycpO1xudmFyIHdlbGxLbm93blN5bWJvbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy93ZWxsLWtub3duLXN5bWJvbCcpO1xudmFyIElTX1BVUkUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaXMtcHVyZScpO1xuXG52YXIgSVRFUkFUT1IgPSB3ZWxsS25vd25TeW1ib2woJ2l0ZXJhdG9yJyk7XG52YXIgQlVHR1lfU0FGQVJJX0lURVJBVE9SUyA9IGZhbHNlO1xuXG52YXIgcmV0dXJuVGhpcyA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH07XG5cbi8vIGAlSXRlcmF0b3JQcm90b3R5cGUlYCBvYmplY3Rcbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLSVpdGVyYXRvcnByb3RvdHlwZSUtb2JqZWN0XG52YXIgSXRlcmF0b3JQcm90b3R5cGUsIFByb3RvdHlwZU9mQXJyYXlJdGVyYXRvclByb3RvdHlwZSwgYXJyYXlJdGVyYXRvcjtcblxuaWYgKFtdLmtleXMpIHtcbiAgYXJyYXlJdGVyYXRvciA9IFtdLmtleXMoKTtcbiAgLy8gU2FmYXJpIDggaGFzIGJ1Z2d5IGl0ZXJhdG9ycyB3L28gYG5leHRgXG4gIGlmICghKCduZXh0JyBpbiBhcnJheUl0ZXJhdG9yKSkgQlVHR1lfU0FGQVJJX0lURVJBVE9SUyA9IHRydWU7XG4gIGVsc2Uge1xuICAgIFByb3RvdHlwZU9mQXJyYXlJdGVyYXRvclByb3RvdHlwZSA9IGdldFByb3RvdHlwZU9mKGdldFByb3RvdHlwZU9mKGFycmF5SXRlcmF0b3IpKTtcbiAgICBpZiAoUHJvdG90eXBlT2ZBcnJheUl0ZXJhdG9yUHJvdG90eXBlICE9PSBPYmplY3QucHJvdG90eXBlKSBJdGVyYXRvclByb3RvdHlwZSA9IFByb3RvdHlwZU9mQXJyYXlJdGVyYXRvclByb3RvdHlwZTtcbiAgfVxufVxuXG5pZiAoSXRlcmF0b3JQcm90b3R5cGUgPT0gdW5kZWZpbmVkKSBJdGVyYXRvclByb3RvdHlwZSA9IHt9O1xuXG4vLyAyNS4xLjIuMS4xICVJdGVyYXRvclByb3RvdHlwZSVbQEBpdGVyYXRvcl0oKVxuaWYgKCFJU19QVVJFICYmICFoYXMoSXRlcmF0b3JQcm90b3R5cGUsIElURVJBVE9SKSkgaGlkZShJdGVyYXRvclByb3RvdHlwZSwgSVRFUkFUT1IsIHJldHVyblRoaXMpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgSXRlcmF0b3JQcm90b3R5cGU6IEl0ZXJhdG9yUHJvdG90eXBlLFxuICBCVUdHWV9TQUZBUklfSVRFUkFUT1JTOiBCVUdHWV9TQUZBUklfSVRFUkFUT1JTXG59O1xuIiwidmFyIGZhaWxzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2ZhaWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gISFPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzICYmICFmYWlscyhmdW5jdGlvbiAoKSB7XG4gIC8vIENocm9tZSAzOCBTeW1ib2wgaGFzIGluY29ycmVjdCB0b1N0cmluZyBjb252ZXJzaW9uXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxuICByZXR1cm4gIVN0cmluZyhTeW1ib2woKSk7XG59KTtcbiIsInZhciBnbG9iYWwgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZ2xvYmFsJyk7XG52YXIgbmF0aXZlRnVuY3Rpb25Ub1N0cmluZyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9mdW5jdGlvbi10by1zdHJpbmcnKTtcblxudmFyIFdlYWtNYXAgPSBnbG9iYWwuV2Vha01hcDtcblxubW9kdWxlLmV4cG9ydHMgPSB0eXBlb2YgV2Vha01hcCA9PT0gJ2Z1bmN0aW9uJyAmJiAvbmF0aXZlIGNvZGUvLnRlc3QobmF0aXZlRnVuY3Rpb25Ub1N0cmluZy5jYWxsKFdlYWtNYXApKTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBERVNDUklQVE9SUyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9kZXNjcmlwdG9ycycpO1xudmFyIGZhaWxzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2ZhaWxzJyk7XG52YXIgb2JqZWN0S2V5cyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9vYmplY3Qta2V5cycpO1xudmFyIGdldE93blByb3BlcnR5U3ltYm9sc01vZHVsZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9vYmplY3QtZ2V0LW93bi1wcm9wZXJ0eS1zeW1ib2xzJyk7XG52YXIgcHJvcGVydHlJc0VudW1lcmFibGVNb2R1bGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0LXByb3BlcnR5LWlzLWVudW1lcmFibGUnKTtcbnZhciB0b09iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy90by1vYmplY3QnKTtcbnZhciBJbmRleGVkT2JqZWN0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2luZGV4ZWQtb2JqZWN0Jyk7XG5cbnZhciBuYXRpdmVBc3NpZ24gPSBPYmplY3QuYXNzaWduO1xuXG4vLyAxOS4xLjIuMSBPYmplY3QuYXNzaWduKHRhcmdldCwgc291cmNlLCAuLi4pXG4vLyBzaG91bGQgd29yayB3aXRoIHN5bWJvbHMgYW5kIHNob3VsZCBoYXZlIGRldGVybWluaXN0aWMgcHJvcGVydHkgb3JkZXIgKFY4IGJ1Zylcbm1vZHVsZS5leHBvcnRzID0gIW5hdGl2ZUFzc2lnbiB8fCBmYWlscyhmdW5jdGlvbiAoKSB7XG4gIHZhciBBID0ge307XG4gIHZhciBCID0ge307XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxuICB2YXIgc3ltYm9sID0gU3ltYm9sKCk7XG4gIHZhciBhbHBoYWJldCA9ICdhYmNkZWZnaGlqa2xtbm9wcXJzdCc7XG4gIEFbc3ltYm9sXSA9IDc7XG4gIGFscGhhYmV0LnNwbGl0KCcnKS5mb3JFYWNoKGZ1bmN0aW9uIChjaHIpIHsgQltjaHJdID0gY2hyOyB9KTtcbiAgcmV0dXJuIG5hdGl2ZUFzc2lnbih7fSwgQSlbc3ltYm9sXSAhPSA3IHx8IG9iamVjdEtleXMobmF0aXZlQXNzaWduKHt9LCBCKSkuam9pbignJykgIT0gYWxwaGFiZXQ7XG59KSA/IGZ1bmN0aW9uIGFzc2lnbih0YXJnZXQsIHNvdXJjZSkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gIHZhciBUID0gdG9PYmplY3QodGFyZ2V0KTtcbiAgdmFyIGFyZ3VtZW50c0xlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gIHZhciBpbmRleCA9IDE7XG4gIHZhciBnZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPSBnZXRPd25Qcm9wZXJ0eVN5bWJvbHNNb2R1bGUuZjtcbiAgdmFyIHByb3BlcnR5SXNFbnVtZXJhYmxlID0gcHJvcGVydHlJc0VudW1lcmFibGVNb2R1bGUuZjtcbiAgd2hpbGUgKGFyZ3VtZW50c0xlbmd0aCA+IGluZGV4KSB7XG4gICAgdmFyIFMgPSBJbmRleGVkT2JqZWN0KGFyZ3VtZW50c1tpbmRleCsrXSk7XG4gICAgdmFyIGtleXMgPSBnZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPyBvYmplY3RLZXlzKFMpLmNvbmNhdChnZXRPd25Qcm9wZXJ0eVN5bWJvbHMoUykpIDogb2JqZWN0S2V5cyhTKTtcbiAgICB2YXIgbGVuZ3RoID0ga2V5cy5sZW5ndGg7XG4gICAgdmFyIGogPSAwO1xuICAgIHZhciBrZXk7XG4gICAgd2hpbGUgKGxlbmd0aCA+IGopIHtcbiAgICAgIGtleSA9IGtleXNbaisrXTtcbiAgICAgIGlmICghREVTQ1JJUFRPUlMgfHwgcHJvcGVydHlJc0VudW1lcmFibGUuY2FsbChTLCBrZXkpKSBUW2tleV0gPSBTW2tleV07XG4gICAgfVxuICB9IHJldHVybiBUO1xufSA6IG5hdGl2ZUFzc2lnbjtcbiIsInZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9hbi1vYmplY3QnKTtcbnZhciBkZWZpbmVQcm9wZXJ0aWVzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL29iamVjdC1kZWZpbmUtcHJvcGVydGllcycpO1xudmFyIGVudW1CdWdLZXlzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2VudW0tYnVnLWtleXMnKTtcbnZhciBoaWRkZW5LZXlzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2hpZGRlbi1rZXlzJyk7XG52YXIgaHRtbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9odG1sJyk7XG52YXIgZG9jdW1lbnRDcmVhdGVFbGVtZW50ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2RvY3VtZW50LWNyZWF0ZS1lbGVtZW50Jyk7XG52YXIgc2hhcmVkS2V5ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3NoYXJlZC1rZXknKTtcbnZhciBJRV9QUk9UTyA9IHNoYXJlZEtleSgnSUVfUFJPVE8nKTtcblxudmFyIFBST1RPVFlQRSA9ICdwcm90b3R5cGUnO1xudmFyIEVtcHR5ID0gZnVuY3Rpb24gKCkgeyAvKiBlbXB0eSAqLyB9O1xuXG4vLyBDcmVhdGUgb2JqZWN0IHdpdGggZmFrZSBgbnVsbGAgcHJvdG90eXBlOiB1c2UgaWZyYW1lIE9iamVjdCB3aXRoIGNsZWFyZWQgcHJvdG90eXBlXG52YXIgY3JlYXRlRGljdCA9IGZ1bmN0aW9uICgpIHtcbiAgLy8gVGhyYXNoLCB3YXN0ZSBhbmQgc29kb215OiBJRSBHQyBidWdcbiAgdmFyIGlmcmFtZSA9IGRvY3VtZW50Q3JlYXRlRWxlbWVudCgnaWZyYW1lJyk7XG4gIHZhciBsZW5ndGggPSBlbnVtQnVnS2V5cy5sZW5ndGg7XG4gIHZhciBsdCA9ICc8JztcbiAgdmFyIHNjcmlwdCA9ICdzY3JpcHQnO1xuICB2YXIgZ3QgPSAnPic7XG4gIHZhciBqcyA9ICdqYXZhJyArIHNjcmlwdCArICc6JztcbiAgdmFyIGlmcmFtZURvY3VtZW50O1xuICBpZnJhbWUuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgaHRtbC5hcHBlbmRDaGlsZChpZnJhbWUpO1xuICBpZnJhbWUuc3JjID0gU3RyaW5nKGpzKTtcbiAgaWZyYW1lRG9jdW1lbnQgPSBpZnJhbWUuY29udGVudFdpbmRvdy5kb2N1bWVudDtcbiAgaWZyYW1lRG9jdW1lbnQub3BlbigpO1xuICBpZnJhbWVEb2N1bWVudC53cml0ZShsdCArIHNjcmlwdCArIGd0ICsgJ2RvY3VtZW50LkY9T2JqZWN0JyArIGx0ICsgJy8nICsgc2NyaXB0ICsgZ3QpO1xuICBpZnJhbWVEb2N1bWVudC5jbG9zZSgpO1xuICBjcmVhdGVEaWN0ID0gaWZyYW1lRG9jdW1lbnQuRjtcbiAgd2hpbGUgKGxlbmd0aC0tKSBkZWxldGUgY3JlYXRlRGljdFtQUk9UT1RZUEVdW2VudW1CdWdLZXlzW2xlbmd0aF1dO1xuICByZXR1cm4gY3JlYXRlRGljdCgpO1xufTtcblxuLy8gMTkuMS4yLjIgLyAxNS4yLjMuNSBPYmplY3QuY3JlYXRlKE8gWywgUHJvcGVydGllc10pXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5jcmVhdGUgfHwgZnVuY3Rpb24gY3JlYXRlKE8sIFByb3BlcnRpZXMpIHtcbiAgdmFyIHJlc3VsdDtcbiAgaWYgKE8gIT09IG51bGwpIHtcbiAgICBFbXB0eVtQUk9UT1RZUEVdID0gYW5PYmplY3QoTyk7XG4gICAgcmVzdWx0ID0gbmV3IEVtcHR5KCk7XG4gICAgRW1wdHlbUFJPVE9UWVBFXSA9IG51bGw7XG4gICAgLy8gYWRkIFwiX19wcm90b19fXCIgZm9yIE9iamVjdC5nZXRQcm90b3R5cGVPZiBwb2x5ZmlsbFxuICAgIHJlc3VsdFtJRV9QUk9UT10gPSBPO1xuICB9IGVsc2UgcmVzdWx0ID0gY3JlYXRlRGljdCgpO1xuICByZXR1cm4gUHJvcGVydGllcyA9PT0gdW5kZWZpbmVkID8gcmVzdWx0IDogZGVmaW5lUHJvcGVydGllcyhyZXN1bHQsIFByb3BlcnRpZXMpO1xufTtcblxuaGlkZGVuS2V5c1tJRV9QUk9UT10gPSB0cnVlO1xuIiwidmFyIERFU0NSSVBUT1JTID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2Rlc2NyaXB0b3JzJyk7XG52YXIgZGVmaW5lUHJvcGVydHlNb2R1bGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0LWRlZmluZS1wcm9wZXJ0eScpO1xudmFyIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2FuLW9iamVjdCcpO1xudmFyIG9iamVjdEtleXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0LWtleXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBERVNDUklQVE9SUyA/IE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzIDogZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyhPLCBQcm9wZXJ0aWVzKSB7XG4gIGFuT2JqZWN0KE8pO1xuICB2YXIga2V5cyA9IG9iamVjdEtleXMoUHJvcGVydGllcyk7XG4gIHZhciBsZW5ndGggPSBrZXlzLmxlbmd0aDtcbiAgdmFyIGkgPSAwO1xuICB2YXIga2V5O1xuICB3aGlsZSAobGVuZ3RoID4gaSkgZGVmaW5lUHJvcGVydHlNb2R1bGUuZihPLCBrZXkgPSBrZXlzW2krK10sIFByb3BlcnRpZXNba2V5XSk7XG4gIHJldHVybiBPO1xufTtcbiIsInZhciBERVNDUklQVE9SUyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9kZXNjcmlwdG9ycycpO1xudmFyIElFOF9ET01fREVGSU5FID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2llOC1kb20tZGVmaW5lJyk7XG52YXIgYW5PYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvYW4tb2JqZWN0Jyk7XG52YXIgdG9QcmltaXRpdmUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvdG8tcHJpbWl0aXZlJyk7XG5cbnZhciBuYXRpdmVEZWZpbmVQcm9wZXJ0eSA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eTtcblxuZXhwb3J0cy5mID0gREVTQ1JJUFRPUlMgPyBuYXRpdmVEZWZpbmVQcm9wZXJ0eSA6IGZ1bmN0aW9uIGRlZmluZVByb3BlcnR5KE8sIFAsIEF0dHJpYnV0ZXMpIHtcbiAgYW5PYmplY3QoTyk7XG4gIFAgPSB0b1ByaW1pdGl2ZShQLCB0cnVlKTtcbiAgYW5PYmplY3QoQXR0cmlidXRlcyk7XG4gIGlmIChJRThfRE9NX0RFRklORSkgdHJ5IHtcbiAgICByZXR1cm4gbmF0aXZlRGVmaW5lUHJvcGVydHkoTywgUCwgQXR0cmlidXRlcyk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7IC8qIGVtcHR5ICovIH1cbiAgaWYgKCdnZXQnIGluIEF0dHJpYnV0ZXMgfHwgJ3NldCcgaW4gQXR0cmlidXRlcykgdGhyb3cgVHlwZUVycm9yKCdBY2Nlc3NvcnMgbm90IHN1cHBvcnRlZCcpO1xuICBpZiAoJ3ZhbHVlJyBpbiBBdHRyaWJ1dGVzKSBPW1BdID0gQXR0cmlidXRlcy52YWx1ZTtcbiAgcmV0dXJuIE87XG59O1xuIiwidmFyIERFU0NSSVBUT1JTID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2Rlc2NyaXB0b3JzJyk7XG52YXIgcHJvcGVydHlJc0VudW1lcmFibGVNb2R1bGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0LXByb3BlcnR5LWlzLWVudW1lcmFibGUnKTtcbnZhciBjcmVhdGVQcm9wZXJ0eURlc2NyaXB0b3IgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvY3JlYXRlLXByb3BlcnR5LWRlc2NyaXB0b3InKTtcbnZhciB0b0luZGV4ZWRPYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvdG8taW5kZXhlZC1vYmplY3QnKTtcbnZhciB0b1ByaW1pdGl2ZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy90by1wcmltaXRpdmUnKTtcbnZhciBoYXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaGFzJyk7XG52YXIgSUU4X0RPTV9ERUZJTkUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaWU4LWRvbS1kZWZpbmUnKTtcblxudmFyIG5hdGl2ZUdldE93blByb3BlcnR5RGVzY3JpcHRvciA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I7XG5cbmV4cG9ydHMuZiA9IERFU0NSSVBUT1JTID8gbmF0aXZlR2V0T3duUHJvcGVydHlEZXNjcmlwdG9yIDogZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKE8sIFApIHtcbiAgTyA9IHRvSW5kZXhlZE9iamVjdChPKTtcbiAgUCA9IHRvUHJpbWl0aXZlKFAsIHRydWUpO1xuICBpZiAoSUU4X0RPTV9ERUZJTkUpIHRyeSB7XG4gICAgcmV0dXJuIG5hdGl2ZUdldE93blByb3BlcnR5RGVzY3JpcHRvcihPLCBQKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHsgLyogZW1wdHkgKi8gfVxuICBpZiAoaGFzKE8sIFApKSByZXR1cm4gY3JlYXRlUHJvcGVydHlEZXNjcmlwdG9yKCFwcm9wZXJ0eUlzRW51bWVyYWJsZU1vZHVsZS5mLmNhbGwoTywgUCksIE9bUF0pO1xufTtcbiIsIi8vIDE5LjEuMi43IC8gMTUuMi4zLjQgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoTylcbnZhciBpbnRlcm5hbE9iamVjdEtleXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0LWtleXMtaW50ZXJuYWwnKTtcbnZhciBlbnVtQnVnS2V5cyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9lbnVtLWJ1Zy1rZXlzJyk7XG5cbnZhciBoaWRkZW5LZXlzID0gZW51bUJ1Z0tleXMuY29uY2F0KCdsZW5ndGgnLCAncHJvdG90eXBlJyk7XG5cbmV4cG9ydHMuZiA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzIHx8IGZ1bmN0aW9uIGdldE93blByb3BlcnR5TmFtZXMoTykge1xuICByZXR1cm4gaW50ZXJuYWxPYmplY3RLZXlzKE8sIGhpZGRlbktleXMpO1xufTtcbiIsImV4cG9ydHMuZiA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHM7XG4iLCJ2YXIgaGFzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2hhcycpO1xudmFyIHRvT2JqZWN0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3RvLW9iamVjdCcpO1xudmFyIHNoYXJlZEtleSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9zaGFyZWQta2V5Jyk7XG52YXIgQ09SUkVDVF9QUk9UT1RZUEVfR0VUVEVSID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2NvcnJlY3QtcHJvdG90eXBlLWdldHRlcicpO1xuXG52YXIgSUVfUFJPVE8gPSBzaGFyZWRLZXkoJ0lFX1BST1RPJyk7XG52YXIgT2JqZWN0UHJvdG90eXBlID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLy8gMTkuMS4yLjkgLyAxNS4yLjMuMiBPYmplY3QuZ2V0UHJvdG90eXBlT2YoTylcbm1vZHVsZS5leHBvcnRzID0gQ09SUkVDVF9QUk9UT1RZUEVfR0VUVEVSID8gT2JqZWN0LmdldFByb3RvdHlwZU9mIDogZnVuY3Rpb24gKE8pIHtcbiAgTyA9IHRvT2JqZWN0KE8pO1xuICBpZiAoaGFzKE8sIElFX1BST1RPKSkgcmV0dXJuIE9bSUVfUFJPVE9dO1xuICBpZiAodHlwZW9mIE8uY29uc3RydWN0b3IgPT0gJ2Z1bmN0aW9uJyAmJiBPIGluc3RhbmNlb2YgTy5jb25zdHJ1Y3Rvcikge1xuICAgIHJldHVybiBPLmNvbnN0cnVjdG9yLnByb3RvdHlwZTtcbiAgfSByZXR1cm4gTyBpbnN0YW5jZW9mIE9iamVjdCA/IE9iamVjdFByb3RvdHlwZSA6IG51bGw7XG59O1xuIiwidmFyIGhhcyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9oYXMnKTtcbnZhciB0b0luZGV4ZWRPYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvdG8taW5kZXhlZC1vYmplY3QnKTtcbnZhciBhcnJheUluY2x1ZGVzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2FycmF5LWluY2x1ZGVzJyk7XG52YXIgaGlkZGVuS2V5cyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9oaWRkZW4ta2V5cycpO1xuXG52YXIgYXJyYXlJbmRleE9mID0gYXJyYXlJbmNsdWRlcyhmYWxzZSk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG9iamVjdCwgbmFtZXMpIHtcbiAgdmFyIE8gPSB0b0luZGV4ZWRPYmplY3Qob2JqZWN0KTtcbiAgdmFyIGkgPSAwO1xuICB2YXIgcmVzdWx0ID0gW107XG4gIHZhciBrZXk7XG4gIGZvciAoa2V5IGluIE8pICFoYXMoaGlkZGVuS2V5cywga2V5KSAmJiBoYXMoTywga2V5KSAmJiByZXN1bHQucHVzaChrZXkpO1xuICAvLyBEb24ndCBlbnVtIGJ1ZyAmIGhpZGRlbiBrZXlzXG4gIHdoaWxlIChuYW1lcy5sZW5ndGggPiBpKSBpZiAoaGFzKE8sIGtleSA9IG5hbWVzW2krK10pKSB7XG4gICAgfmFycmF5SW5kZXhPZihyZXN1bHQsIGtleSkgfHwgcmVzdWx0LnB1c2goa2V5KTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufTtcbiIsInZhciBpbnRlcm5hbE9iamVjdEtleXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0LWtleXMtaW50ZXJuYWwnKTtcbnZhciBlbnVtQnVnS2V5cyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9lbnVtLWJ1Zy1rZXlzJyk7XG5cbi8vIDE5LjEuMi4xNCAvIDE1LjIuMy4xNCBPYmplY3Qua2V5cyhPKVxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3Qua2V5cyB8fCBmdW5jdGlvbiBrZXlzKE8pIHtcbiAgcmV0dXJuIGludGVybmFsT2JqZWN0S2V5cyhPLCBlbnVtQnVnS2V5cyk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIG5hdGl2ZVByb3BlcnR5SXNFbnVtZXJhYmxlID0ge30ucHJvcGVydHlJc0VudW1lcmFibGU7XG52YXIgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcjtcblxuLy8gTmFzaG9ybiB+IEpESzggYnVnXG52YXIgTkFTSE9STl9CVUcgPSBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgJiYgIW5hdGl2ZVByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwoeyAxOiAyIH0sIDEpO1xuXG5leHBvcnRzLmYgPSBOQVNIT1JOX0JVRyA/IGZ1bmN0aW9uIHByb3BlcnR5SXNFbnVtZXJhYmxlKFYpIHtcbiAgdmFyIGRlc2NyaXB0b3IgPSBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGhpcywgVik7XG4gIHJldHVybiAhIWRlc2NyaXB0b3IgJiYgZGVzY3JpcHRvci5lbnVtZXJhYmxlO1xufSA6IG5hdGl2ZVByb3BlcnR5SXNFbnVtZXJhYmxlO1xuIiwidmFyIHZhbGlkYXRlU2V0UHJvdG90eXBlT2ZBcmd1bWVudHMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvdmFsaWRhdGUtc2V0LXByb3RvdHlwZS1vZi1hcmd1bWVudHMnKTtcblxuLy8gV29ya3Mgd2l0aCBfX3Byb3RvX18gb25seS4gT2xkIHY4IGNhbid0IHdvcmsgd2l0aCBudWxsIHByb3RvIG9iamVjdHMuXG4vKiBlc2xpbnQtZGlzYWJsZSBuby1wcm90byAqL1xubW9kdWxlLmV4cG9ydHMgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHwgKCdfX3Byb3RvX18nIGluIHt9ID8gZnVuY3Rpb24gKCkge1xuICB2YXIgY29ycmVjdFNldHRlciA9IGZhbHNlO1xuICB2YXIgdGVzdCA9IHt9O1xuICB2YXIgc2V0dGVyO1xuICB0cnkge1xuICAgIHNldHRlciA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoT2JqZWN0LnByb3RvdHlwZSwgJ19fcHJvdG9fXycpLnNldDtcbiAgICBzZXR0ZXIuY2FsbCh0ZXN0LCBbXSk7XG4gICAgY29ycmVjdFNldHRlciA9IHRlc3QgaW5zdGFuY2VvZiBBcnJheTtcbiAgfSBjYXRjaCAoZXJyb3IpIHsgLyogZW1wdHkgKi8gfVxuICByZXR1cm4gZnVuY3Rpb24gc2V0UHJvdG90eXBlT2YoTywgcHJvdG8pIHtcbiAgICB2YWxpZGF0ZVNldFByb3RvdHlwZU9mQXJndW1lbnRzKE8sIHByb3RvKTtcbiAgICBpZiAoY29ycmVjdFNldHRlcikgc2V0dGVyLmNhbGwoTywgcHJvdG8pO1xuICAgIGVsc2UgTy5fX3Byb3RvX18gPSBwcm90bztcbiAgICByZXR1cm4gTztcbiAgfTtcbn0oKSA6IHVuZGVmaW5lZCk7XG4iLCJ2YXIgREVTQ1JJUFRPUlMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZGVzY3JpcHRvcnMnKTtcbnZhciBvYmplY3RLZXlzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL29iamVjdC1rZXlzJyk7XG52YXIgdG9JbmRleGVkT2JqZWN0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3RvLWluZGV4ZWQtb2JqZWN0Jyk7XG52YXIgcHJvcGVydHlJc0VudW1lcmFibGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0LXByb3BlcnR5LWlzLWVudW1lcmFibGUnKS5mO1xuXG4vLyBUT19FTlRSSUVTOiB0cnVlICAtPiBPYmplY3QuZW50cmllc1xuLy8gVE9fRU5UUklFUzogZmFsc2UgLT4gT2JqZWN0LnZhbHVlc1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQsIFRPX0VOVFJJRVMpIHtcbiAgdmFyIE8gPSB0b0luZGV4ZWRPYmplY3QoaXQpO1xuICB2YXIga2V5cyA9IG9iamVjdEtleXMoTyk7XG4gIHZhciBsZW5ndGggPSBrZXlzLmxlbmd0aDtcbiAgdmFyIGkgPSAwO1xuICB2YXIgcmVzdWx0ID0gW107XG4gIHZhciBrZXk7XG4gIHdoaWxlIChsZW5ndGggPiBpKSB7XG4gICAga2V5ID0ga2V5c1tpKytdO1xuICAgIGlmICghREVTQ1JJUFRPUlMgfHwgcHJvcGVydHlJc0VudW1lcmFibGUuY2FsbChPLCBrZXkpKSB7XG4gICAgICByZXN1bHQucHVzaChUT19FTlRSSUVTID8gW2tleSwgT1trZXldXSA6IE9ba2V5XSk7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIGNsYXNzb2YgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvY2xhc3NvZicpO1xudmFyIHdlbGxLbm93blN5bWJvbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy93ZWxsLWtub3duLXN5bWJvbCcpO1xuXG52YXIgVE9fU1RSSU5HX1RBRyA9IHdlbGxLbm93blN5bWJvbCgndG9TdHJpbmdUYWcnKTtcbnZhciB0ZXN0ID0ge307XG5cbnRlc3RbVE9fU1RSSU5HX1RBR10gPSAneic7XG5cbi8vIGBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nYCBtZXRob2QgaW1wbGVtZW50YXRpb25cbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLW9iamVjdC5wcm90b3R5cGUudG9zdHJpbmdcbm1vZHVsZS5leHBvcnRzID0gU3RyaW5nKHRlc3QpICE9PSAnW29iamVjdCB6XScgPyBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgcmV0dXJuICdbb2JqZWN0ICcgKyBjbGFzc29mKHRoaXMpICsgJ10nO1xufSA6IHRlc3QudG9TdHJpbmc7XG4iLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2dsb2JhbCcpO1xudmFyIGdldE93blByb3BlcnR5TmFtZXNNb2R1bGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0LWdldC1vd24tcHJvcGVydHktbmFtZXMnKTtcbnZhciBnZXRPd25Qcm9wZXJ0eVN5bWJvbHNNb2R1bGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0LWdldC1vd24tcHJvcGVydHktc3ltYm9scycpO1xudmFyIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2FuLW9iamVjdCcpO1xuXG52YXIgUmVmbGVjdCA9IGdsb2JhbC5SZWZsZWN0O1xuXG4vLyBhbGwgb2JqZWN0IGtleXMsIGluY2x1ZGVzIG5vbi1lbnVtZXJhYmxlIGFuZCBzeW1ib2xzXG5tb2R1bGUuZXhwb3J0cyA9IFJlZmxlY3QgJiYgUmVmbGVjdC5vd25LZXlzIHx8IGZ1bmN0aW9uIG93bktleXMoaXQpIHtcbiAgdmFyIGtleXMgPSBnZXRPd25Qcm9wZXJ0eU5hbWVzTW9kdWxlLmYoYW5PYmplY3QoaXQpKTtcbiAgdmFyIGdldE93blByb3BlcnR5U3ltYm9scyA9IGdldE93blByb3BlcnR5U3ltYm9sc01vZHVsZS5mO1xuICByZXR1cm4gZ2V0T3duUHJvcGVydHlTeW1ib2xzID8ga2V5cy5jb25jYXQoZ2V0T3duUHJvcGVydHlTeW1ib2xzKGl0KSkgOiBrZXlzO1xufTtcbiIsInZhciBnbG9iYWwgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZ2xvYmFsJyk7XG52YXIgc2hhcmVkID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3NoYXJlZCcpO1xudmFyIGhpZGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaGlkZScpO1xudmFyIGhhcyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9oYXMnKTtcbnZhciBzZXRHbG9iYWwgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvc2V0LWdsb2JhbCcpO1xudmFyIG5hdGl2ZUZ1bmN0aW9uVG9TdHJpbmcgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZnVuY3Rpb24tdG8tc3RyaW5nJyk7XG52YXIgSW50ZXJuYWxTdGF0ZU1vZHVsZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pbnRlcm5hbC1zdGF0ZScpO1xuXG52YXIgZ2V0SW50ZXJuYWxTdGF0ZSA9IEludGVybmFsU3RhdGVNb2R1bGUuZ2V0O1xudmFyIGVuZm9yY2VJbnRlcm5hbFN0YXRlID0gSW50ZXJuYWxTdGF0ZU1vZHVsZS5lbmZvcmNlO1xudmFyIFRFTVBMQVRFID0gU3RyaW5nKG5hdGl2ZUZ1bmN0aW9uVG9TdHJpbmcpLnNwbGl0KCd0b1N0cmluZycpO1xuXG5zaGFyZWQoJ2luc3BlY3RTb3VyY2UnLCBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIG5hdGl2ZUZ1bmN0aW9uVG9TdHJpbmcuY2FsbChpdCk7XG59KTtcblxuKG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKE8sIGtleSwgdmFsdWUsIG9wdGlvbnMpIHtcbiAgdmFyIHVuc2FmZSA9IG9wdGlvbnMgPyAhIW9wdGlvbnMudW5zYWZlIDogZmFsc2U7XG4gIHZhciBzaW1wbGUgPSBvcHRpb25zID8gISFvcHRpb25zLmVudW1lcmFibGUgOiBmYWxzZTtcbiAgdmFyIG5vVGFyZ2V0R2V0ID0gb3B0aW9ucyA/ICEhb3B0aW9ucy5ub1RhcmdldEdldCA6IGZhbHNlO1xuICBpZiAodHlwZW9mIHZhbHVlID09ICdmdW5jdGlvbicpIHtcbiAgICBpZiAodHlwZW9mIGtleSA9PSAnc3RyaW5nJyAmJiAhaGFzKHZhbHVlLCAnbmFtZScpKSBoaWRlKHZhbHVlLCAnbmFtZScsIGtleSk7XG4gICAgZW5mb3JjZUludGVybmFsU3RhdGUodmFsdWUpLnNvdXJjZSA9IFRFTVBMQVRFLmpvaW4odHlwZW9mIGtleSA9PSAnc3RyaW5nJyA/IGtleSA6ICcnKTtcbiAgfVxuICBpZiAoTyA9PT0gZ2xvYmFsKSB7XG4gICAgaWYgKHNpbXBsZSkgT1trZXldID0gdmFsdWU7XG4gICAgZWxzZSBzZXRHbG9iYWwoa2V5LCB2YWx1ZSk7XG4gICAgcmV0dXJuO1xuICB9IGVsc2UgaWYgKCF1bnNhZmUpIHtcbiAgICBkZWxldGUgT1trZXldO1xuICB9IGVsc2UgaWYgKCFub1RhcmdldEdldCAmJiBPW2tleV0pIHtcbiAgICBzaW1wbGUgPSB0cnVlO1xuICB9XG4gIGlmIChzaW1wbGUpIE9ba2V5XSA9IHZhbHVlO1xuICBlbHNlIGhpZGUoTywga2V5LCB2YWx1ZSk7XG4vLyBhZGQgZmFrZSBGdW5jdGlvbiN0b1N0cmluZyBmb3IgY29ycmVjdCB3b3JrIHdyYXBwZWQgbWV0aG9kcyAvIGNvbnN0cnVjdG9ycyB3aXRoIG1ldGhvZHMgbGlrZSBMb0Rhc2ggaXNOYXRpdmVcbn0pKEZ1bmN0aW9uLnByb3RvdHlwZSwgJ3RvU3RyaW5nJywgZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gIHJldHVybiB0eXBlb2YgdGhpcyA9PSAnZnVuY3Rpb24nICYmIGdldEludGVybmFsU3RhdGUodGhpcykuc291cmNlIHx8IG5hdGl2ZUZ1bmN0aW9uVG9TdHJpbmcuY2FsbCh0aGlzKTtcbn0pO1xuIiwidmFyIGNsYXNzb2YgPSByZXF1aXJlKCcuL2NsYXNzb2YtcmF3Jyk7XG52YXIgcmVnZXhwRXhlYyA9IHJlcXVpcmUoJy4vcmVnZXhwLWV4ZWMnKTtcblxuLy8gYFJlZ0V4cEV4ZWNgIGFic3RyYWN0IG9wZXJhdGlvblxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtcmVnZXhwZXhlY1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoUiwgUykge1xuICB2YXIgZXhlYyA9IFIuZXhlYztcbiAgaWYgKHR5cGVvZiBleGVjID09PSAnZnVuY3Rpb24nKSB7XG4gICAgdmFyIHJlc3VsdCA9IGV4ZWMuY2FsbChSLCBTKTtcbiAgICBpZiAodHlwZW9mIHJlc3VsdCAhPT0gJ29iamVjdCcpIHtcbiAgICAgIHRocm93IFR5cGVFcnJvcignUmVnRXhwIGV4ZWMgbWV0aG9kIHJldHVybmVkIHNvbWV0aGluZyBvdGhlciB0aGFuIGFuIE9iamVjdCBvciBudWxsJyk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBpZiAoY2xhc3NvZihSKSAhPT0gJ1JlZ0V4cCcpIHtcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ1JlZ0V4cCNleGVjIGNhbGxlZCBvbiBpbmNvbXBhdGlibGUgcmVjZWl2ZXInKTtcbiAgfVxuXG4gIHJldHVybiByZWdleHBFeGVjLmNhbGwoUiwgUyk7XG59O1xuXG4iLCIndXNlIHN0cmljdCc7XG52YXIgcmVnZXhwRmxhZ3MgPSByZXF1aXJlKCcuL3JlZ2V4cC1mbGFncycpO1xuXG52YXIgbmF0aXZlRXhlYyA9IFJlZ0V4cC5wcm90b3R5cGUuZXhlYztcbi8vIFRoaXMgYWx3YXlzIHJlZmVycyB0byB0aGUgbmF0aXZlIGltcGxlbWVudGF0aW9uLCBiZWNhdXNlIHRoZVxuLy8gU3RyaW5nI3JlcGxhY2UgcG9seWZpbGwgdXNlcyAuL2ZpeC1yZWdleHAtd2VsbC1rbm93bi1zeW1ib2wtbG9naWMuanMsXG4vLyB3aGljaCBsb2FkcyB0aGlzIGZpbGUgYmVmb3JlIHBhdGNoaW5nIHRoZSBtZXRob2QuXG52YXIgbmF0aXZlUmVwbGFjZSA9IFN0cmluZy5wcm90b3R5cGUucmVwbGFjZTtcblxudmFyIHBhdGNoZWRFeGVjID0gbmF0aXZlRXhlYztcblxudmFyIFVQREFURVNfTEFTVF9JTkRFWF9XUk9ORyA9IChmdW5jdGlvbiAoKSB7XG4gIHZhciByZTEgPSAvYS87XG4gIHZhciByZTIgPSAvYiovZztcbiAgbmF0aXZlRXhlYy5jYWxsKHJlMSwgJ2EnKTtcbiAgbmF0aXZlRXhlYy5jYWxsKHJlMiwgJ2EnKTtcbiAgcmV0dXJuIHJlMS5sYXN0SW5kZXggIT09IDAgfHwgcmUyLmxhc3RJbmRleCAhPT0gMDtcbn0pKCk7XG5cbi8vIG5vbnBhcnRpY2lwYXRpbmcgY2FwdHVyaW5nIGdyb3VwLCBjb3BpZWQgZnJvbSBlczUtc2hpbSdzIFN0cmluZyNzcGxpdCBwYXRjaC5cbnZhciBOUENHX0lOQ0xVREVEID0gLygpPz8vLmV4ZWMoJycpWzFdICE9PSB1bmRlZmluZWQ7XG5cbnZhciBQQVRDSCA9IFVQREFURVNfTEFTVF9JTkRFWF9XUk9ORyB8fCBOUENHX0lOQ0xVREVEO1xuXG5pZiAoUEFUQ0gpIHtcbiAgcGF0Y2hlZEV4ZWMgPSBmdW5jdGlvbiBleGVjKHN0cikge1xuICAgIHZhciByZSA9IHRoaXM7XG4gICAgdmFyIGxhc3RJbmRleCwgcmVDb3B5LCBtYXRjaCwgaTtcblxuICAgIGlmIChOUENHX0lOQ0xVREVEKSB7XG4gICAgICByZUNvcHkgPSBuZXcgUmVnRXhwKCdeJyArIHJlLnNvdXJjZSArICckKD8hXFxcXHMpJywgcmVnZXhwRmxhZ3MuY2FsbChyZSkpO1xuICAgIH1cbiAgICBpZiAoVVBEQVRFU19MQVNUX0lOREVYX1dST05HKSBsYXN0SW5kZXggPSByZS5sYXN0SW5kZXg7XG5cbiAgICBtYXRjaCA9IG5hdGl2ZUV4ZWMuY2FsbChyZSwgc3RyKTtcblxuICAgIGlmIChVUERBVEVTX0xBU1RfSU5ERVhfV1JPTkcgJiYgbWF0Y2gpIHtcbiAgICAgIHJlLmxhc3RJbmRleCA9IHJlLmdsb2JhbCA/IG1hdGNoLmluZGV4ICsgbWF0Y2hbMF0ubGVuZ3RoIDogbGFzdEluZGV4O1xuICAgIH1cbiAgICBpZiAoTlBDR19JTkNMVURFRCAmJiBtYXRjaCAmJiBtYXRjaC5sZW5ndGggPiAxKSB7XG4gICAgICAvLyBGaXggYnJvd3NlcnMgd2hvc2UgYGV4ZWNgIG1ldGhvZHMgZG9uJ3QgY29uc2lzdGVudGx5IHJldHVybiBgdW5kZWZpbmVkYFxuICAgICAgLy8gZm9yIE5QQ0csIGxpa2UgSUU4LiBOT1RFOiBUaGlzIGRvZXNuJyB3b3JrIGZvciAvKC4/KT8vXG4gICAgICBuYXRpdmVSZXBsYWNlLmNhbGwobWF0Y2hbMF0sIHJlQ29weSwgZnVuY3Rpb24gKCkge1xuICAgICAgICBmb3IgKGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aCAtIDI7IGkrKykge1xuICAgICAgICAgIGlmIChhcmd1bWVudHNbaV0gPT09IHVuZGVmaW5lZCkgbWF0Y2hbaV0gPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBtYXRjaDtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBwYXRjaGVkRXhlYztcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9hbi1vYmplY3QnKTtcblxuLy8gYFJlZ0V4cC5wcm90b3R5cGUuZmxhZ3NgIGdldHRlciBpbXBsZW1lbnRhdGlvblxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtZ2V0LXJlZ2V4cC5wcm90b3R5cGUuZmxhZ3Ncbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICB2YXIgdGhhdCA9IGFuT2JqZWN0KHRoaXMpO1xuICB2YXIgcmVzdWx0ID0gJyc7XG4gIGlmICh0aGF0Lmdsb2JhbCkgcmVzdWx0ICs9ICdnJztcbiAgaWYgKHRoYXQuaWdub3JlQ2FzZSkgcmVzdWx0ICs9ICdpJztcbiAgaWYgKHRoYXQubXVsdGlsaW5lKSByZXN1bHQgKz0gJ20nO1xuICBpZiAodGhhdC51bmljb2RlKSByZXN1bHQgKz0gJ3UnO1xuICBpZiAodGhhdC5zdGlja3kpIHJlc3VsdCArPSAneSc7XG4gIHJldHVybiByZXN1bHQ7XG59O1xuIiwiLy8gYFJlcXVpcmVPYmplY3RDb2VyY2libGVgIGFic3RyYWN0IG9wZXJhdGlvblxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtcmVxdWlyZW9iamVjdGNvZXJjaWJsZVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgaWYgKGl0ID09IHVuZGVmaW5lZCkgdGhyb3cgVHlwZUVycm9yKFwiQ2FuJ3QgY2FsbCBtZXRob2Qgb24gXCIgKyBpdCk7XG4gIHJldHVybiBpdDtcbn07XG4iLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2dsb2JhbCcpO1xudmFyIGhpZGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaGlkZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gIHRyeSB7XG4gICAgaGlkZShnbG9iYWwsIGtleSwgdmFsdWUpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGdsb2JhbFtrZXldID0gdmFsdWU7XG4gIH0gcmV0dXJuIHZhbHVlO1xufTtcbiIsInZhciBkZWZpbmVQcm9wZXJ0eSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9vYmplY3QtZGVmaW5lLXByb3BlcnR5JykuZjtcbnZhciBoYXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaGFzJyk7XG52YXIgd2VsbEtub3duU3ltYm9sID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3dlbGwta25vd24tc3ltYm9sJyk7XG5cbnZhciBUT19TVFJJTkdfVEFHID0gd2VsbEtub3duU3ltYm9sKCd0b1N0cmluZ1RhZycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCwgVEFHLCBTVEFUSUMpIHtcbiAgaWYgKGl0ICYmICFoYXMoaXQgPSBTVEFUSUMgPyBpdCA6IGl0LnByb3RvdHlwZSwgVE9fU1RSSU5HX1RBRykpIHtcbiAgICBkZWZpbmVQcm9wZXJ0eShpdCwgVE9fU1RSSU5HX1RBRywgeyBjb25maWd1cmFibGU6IHRydWUsIHZhbHVlOiBUQUcgfSk7XG4gIH1cbn07XG4iLCJ2YXIgc2hhcmVkID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3NoYXJlZCcpO1xudmFyIHVpZCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy91aWQnKTtcblxudmFyIGtleXMgPSBzaGFyZWQoJ2tleXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoa2V5KSB7XG4gIHJldHVybiBrZXlzW2tleV0gfHwgKGtleXNba2V5XSA9IHVpZChrZXkpKTtcbn07XG4iLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2dsb2JhbCcpO1xudmFyIHNldEdsb2JhbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9zZXQtZ2xvYmFsJyk7XG52YXIgSVNfUFVSRSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pcy1wdXJlJyk7XG5cbnZhciBTSEFSRUQgPSAnX19jb3JlLWpzX3NoYXJlZF9fJztcbnZhciBzdG9yZSA9IGdsb2JhbFtTSEFSRURdIHx8IHNldEdsb2JhbChTSEFSRUQsIHt9KTtcblxuKG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgcmV0dXJuIHN0b3JlW2tleV0gfHwgKHN0b3JlW2tleV0gPSB2YWx1ZSAhPT0gdW5kZWZpbmVkID8gdmFsdWUgOiB7fSk7XG59KSgndmVyc2lvbnMnLCBbXSkucHVzaCh7XG4gIHZlcnNpb246ICczLjEuMycsXG4gIG1vZGU6IElTX1BVUkUgPyAncHVyZScgOiAnZ2xvYmFsJyxcbiAgY29weXJpZ2h0OiAnwqkgMjAxOSBEZW5pcyBQdXNoa2FyZXYgKHpsb2lyb2NrLnJ1KSdcbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIGZhaWxzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2ZhaWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKE1FVEhPRF9OQU1FLCBhcmd1bWVudCkge1xuICB2YXIgbWV0aG9kID0gW11bTUVUSE9EX05BTUVdO1xuICByZXR1cm4gIW1ldGhvZCB8fCAhZmFpbHMoZnVuY3Rpb24gKCkge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11c2VsZXNzLWNhbGwsbm8tdGhyb3ctbGl0ZXJhbFxuICAgIG1ldGhvZC5jYWxsKG51bGwsIGFyZ3VtZW50IHx8IGZ1bmN0aW9uICgpIHsgdGhyb3cgMTsgfSwgMSk7XG4gIH0pO1xufTtcbiIsInZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9hbi1vYmplY3QnKTtcbnZhciBhRnVuY3Rpb24gPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvYS1mdW5jdGlvbicpO1xudmFyIHdlbGxLbm93blN5bWJvbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy93ZWxsLWtub3duLXN5bWJvbCcpO1xuXG52YXIgU1BFQ0lFUyA9IHdlbGxLbm93blN5bWJvbCgnc3BlY2llcycpO1xuXG4vLyBgU3BlY2llc0NvbnN0cnVjdG9yYCBhYnN0cmFjdCBvcGVyYXRpb25cbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLXNwZWNpZXNjb25zdHJ1Y3RvclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoTywgZGVmYXVsdENvbnN0cnVjdG9yKSB7XG4gIHZhciBDID0gYW5PYmplY3QoTykuY29uc3RydWN0b3I7XG4gIHZhciBTO1xuICByZXR1cm4gQyA9PT0gdW5kZWZpbmVkIHx8IChTID0gYW5PYmplY3QoQylbU1BFQ0lFU10pID09IHVuZGVmaW5lZCA/IGRlZmF1bHRDb25zdHJ1Y3RvciA6IGFGdW5jdGlvbihTKTtcbn07XG4iLCJ2YXIgdG9JbnRlZ2VyID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3RvLWludGVnZXInKTtcbnZhciByZXF1aXJlT2JqZWN0Q29lcmNpYmxlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3JlcXVpcmUtb2JqZWN0LWNvZXJjaWJsZScpO1xuXG4vLyBDT05WRVJUX1RPX1NUUklORzogdHJ1ZSAgLT4gU3RyaW5nI2F0XG4vLyBDT05WRVJUX1RPX1NUUklORzogZmFsc2UgLT4gU3RyaW5nI2NvZGVQb2ludEF0XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh0aGF0LCBwb3MsIENPTlZFUlRfVE9fU1RSSU5HKSB7XG4gIHZhciBTID0gU3RyaW5nKHJlcXVpcmVPYmplY3RDb2VyY2libGUodGhhdCkpO1xuICB2YXIgcG9zaXRpb24gPSB0b0ludGVnZXIocG9zKTtcbiAgdmFyIHNpemUgPSBTLmxlbmd0aDtcbiAgdmFyIGZpcnN0LCBzZWNvbmQ7XG4gIGlmIChwb3NpdGlvbiA8IDAgfHwgcG9zaXRpb24gPj0gc2l6ZSkgcmV0dXJuIENPTlZFUlRfVE9fU1RSSU5HID8gJycgOiB1bmRlZmluZWQ7XG4gIGZpcnN0ID0gUy5jaGFyQ29kZUF0KHBvc2l0aW9uKTtcbiAgcmV0dXJuIGZpcnN0IDwgMHhEODAwIHx8IGZpcnN0ID4gMHhEQkZGIHx8IHBvc2l0aW9uICsgMSA9PT0gc2l6ZVxuICAgIHx8IChzZWNvbmQgPSBTLmNoYXJDb2RlQXQocG9zaXRpb24gKyAxKSkgPCAweERDMDAgfHwgc2Vjb25kID4gMHhERkZGXG4gICAgICA/IENPTlZFUlRfVE9fU1RSSU5HID8gUy5jaGFyQXQocG9zaXRpb24pIDogZmlyc3RcbiAgICAgIDogQ09OVkVSVF9UT19TVFJJTkcgPyBTLnNsaWNlKHBvc2l0aW9uLCBwb3NpdGlvbiArIDIpIDogKGZpcnN0IC0gMHhEODAwIDw8IDEwKSArIChzZWNvbmQgLSAweERDMDApICsgMHgxMDAwMDtcbn07XG4iLCJ2YXIgcmVxdWlyZU9iamVjdENvZXJjaWJsZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9yZXF1aXJlLW9iamVjdC1jb2VyY2libGUnKTtcbnZhciB3aGl0ZXNwYWNlcyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy93aGl0ZXNwYWNlcycpO1xuXG52YXIgd2hpdGVzcGFjZSA9ICdbJyArIHdoaXRlc3BhY2VzICsgJ10nO1xudmFyIGx0cmltID0gUmVnRXhwKCdeJyArIHdoaXRlc3BhY2UgKyB3aGl0ZXNwYWNlICsgJyonKTtcbnZhciBydHJpbSA9IFJlZ0V4cCh3aGl0ZXNwYWNlICsgd2hpdGVzcGFjZSArICcqJCcpO1xuXG4vLyAxIC0+IFN0cmluZyN0cmltU3RhcnRcbi8vIDIgLT4gU3RyaW5nI3RyaW1FbmRcbi8vIDMgLT4gU3RyaW5nI3RyaW1cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHN0cmluZywgVFlQRSkge1xuICBzdHJpbmcgPSBTdHJpbmcocmVxdWlyZU9iamVjdENvZXJjaWJsZShzdHJpbmcpKTtcbiAgaWYgKFRZUEUgJiAxKSBzdHJpbmcgPSBzdHJpbmcucmVwbGFjZShsdHJpbSwgJycpO1xuICBpZiAoVFlQRSAmIDIpIHN0cmluZyA9IHN0cmluZy5yZXBsYWNlKHJ0cmltLCAnJyk7XG4gIHJldHVybiBzdHJpbmc7XG59O1xuIiwidmFyIHRvSW50ZWdlciA9IHJlcXVpcmUoJy4uL2ludGVybmFscy90by1pbnRlZ2VyJyk7XG5cbnZhciBtYXggPSBNYXRoLm1heDtcbnZhciBtaW4gPSBNYXRoLm1pbjtcblxuLy8gSGVscGVyIGZvciBhIHBvcHVsYXIgcmVwZWF0aW5nIGNhc2Ugb2YgdGhlIHNwZWM6XG4vLyBMZXQgaW50ZWdlciBiZSA/IFRvSW50ZWdlcihpbmRleCkuXG4vLyBJZiBpbnRlZ2VyIDwgMCwgbGV0IHJlc3VsdCBiZSBtYXgoKGxlbmd0aCArIGludGVnZXIpLCAwKTsgZWxzZSBsZXQgcmVzdWx0IGJlIG1pbihsZW5ndGgsIGxlbmd0aCkuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpbmRleCwgbGVuZ3RoKSB7XG4gIHZhciBpbnRlZ2VyID0gdG9JbnRlZ2VyKGluZGV4KTtcbiAgcmV0dXJuIGludGVnZXIgPCAwID8gbWF4KGludGVnZXIgKyBsZW5ndGgsIDApIDogbWluKGludGVnZXIsIGxlbmd0aCk7XG59O1xuIiwiLy8gdG9PYmplY3Qgd2l0aCBmYWxsYmFjayBmb3Igbm9uLWFycmF5LWxpa2UgRVMzIHN0cmluZ3NcbnZhciBJbmRleGVkT2JqZWN0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2luZGV4ZWQtb2JqZWN0Jyk7XG52YXIgcmVxdWlyZU9iamVjdENvZXJjaWJsZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9yZXF1aXJlLW9iamVjdC1jb2VyY2libGUnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIEluZGV4ZWRPYmplY3QocmVxdWlyZU9iamVjdENvZXJjaWJsZShpdCkpO1xufTtcbiIsInZhciBjZWlsID0gTWF0aC5jZWlsO1xudmFyIGZsb29yID0gTWF0aC5mbG9vcjtcblxuLy8gYFRvSW50ZWdlcmAgYWJzdHJhY3Qgb3BlcmF0aW9uXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy10b2ludGVnZXJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGFyZ3VtZW50KSB7XG4gIHJldHVybiBpc05hTihhcmd1bWVudCA9ICthcmd1bWVudCkgPyAwIDogKGFyZ3VtZW50ID4gMCA/IGZsb29yIDogY2VpbCkoYXJndW1lbnQpO1xufTtcbiIsInZhciB0b0ludGVnZXIgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvdG8taW50ZWdlcicpO1xuXG52YXIgbWluID0gTWF0aC5taW47XG5cbi8vIGBUb0xlbmd0aGAgYWJzdHJhY3Qgb3BlcmF0aW9uXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy10b2xlbmd0aFxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoYXJndW1lbnQpIHtcbiAgcmV0dXJuIGFyZ3VtZW50ID4gMCA/IG1pbih0b0ludGVnZXIoYXJndW1lbnQpLCAweDFGRkZGRkZGRkZGRkZGKSA6IDA7IC8vIDIgKiogNTMgLSAxID09IDkwMDcxOTkyNTQ3NDA5OTFcbn07XG4iLCJ2YXIgcmVxdWlyZU9iamVjdENvZXJjaWJsZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9yZXF1aXJlLW9iamVjdC1jb2VyY2libGUnKTtcblxuLy8gYFRvT2JqZWN0YCBhYnN0cmFjdCBvcGVyYXRpb25cbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLXRvb2JqZWN0XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChhcmd1bWVudCkge1xuICByZXR1cm4gT2JqZWN0KHJlcXVpcmVPYmplY3RDb2VyY2libGUoYXJndW1lbnQpKTtcbn07XG4iLCJ2YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaXMtb2JqZWN0Jyk7XG5cbi8vIDcuMS4xIFRvUHJpbWl0aXZlKGlucHV0IFssIFByZWZlcnJlZFR5cGVdKVxuLy8gaW5zdGVhZCBvZiB0aGUgRVM2IHNwZWMgdmVyc2lvbiwgd2UgZGlkbid0IGltcGxlbWVudCBAQHRvUHJpbWl0aXZlIGNhc2Vcbi8vIGFuZCB0aGUgc2Vjb25kIGFyZ3VtZW50IC0gZmxhZyAtIHByZWZlcnJlZCB0eXBlIGlzIGEgc3RyaW5nXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCwgUykge1xuICBpZiAoIWlzT2JqZWN0KGl0KSkgcmV0dXJuIGl0O1xuICB2YXIgZm4sIHZhbDtcbiAgaWYgKFMgJiYgdHlwZW9mIChmbiA9IGl0LnRvU3RyaW5nKSA9PSAnZnVuY3Rpb24nICYmICFpc09iamVjdCh2YWwgPSBmbi5jYWxsKGl0KSkpIHJldHVybiB2YWw7XG4gIGlmICh0eXBlb2YgKGZuID0gaXQudmFsdWVPZikgPT0gJ2Z1bmN0aW9uJyAmJiAhaXNPYmplY3QodmFsID0gZm4uY2FsbChpdCkpKSByZXR1cm4gdmFsO1xuICBpZiAoIVMgJiYgdHlwZW9mIChmbiA9IGl0LnRvU3RyaW5nKSA9PSAnZnVuY3Rpb24nICYmICFpc09iamVjdCh2YWwgPSBmbi5jYWxsKGl0KSkpIHJldHVybiB2YWw7XG4gIHRocm93IFR5cGVFcnJvcihcIkNhbid0IGNvbnZlcnQgb2JqZWN0IHRvIHByaW1pdGl2ZSB2YWx1ZVwiKTtcbn07XG4iLCJ2YXIgaWQgPSAwO1xudmFyIHBvc3RmaXggPSBNYXRoLnJhbmRvbSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgcmV0dXJuICdTeW1ib2woJy5jb25jYXQoa2V5ID09PSB1bmRlZmluZWQgPyAnJyA6IGtleSwgJylfJywgKCsraWQgKyBwb3N0Zml4KS50b1N0cmluZygzNikpO1xufTtcbiIsInZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pcy1vYmplY3QnKTtcbnZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9hbi1vYmplY3QnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoTywgcHJvdG8pIHtcbiAgYW5PYmplY3QoTyk7XG4gIGlmICghaXNPYmplY3QocHJvdG8pICYmIHByb3RvICE9PSBudWxsKSB7XG4gICAgdGhyb3cgVHlwZUVycm9yKFwiQ2FuJ3Qgc2V0IFwiICsgU3RyaW5nKHByb3RvKSArICcgYXMgYSBwcm90b3R5cGUnKTtcbiAgfVxufTtcbiIsIi8vIGhlbHBlciBmb3IgU3RyaW5nI3tzdGFydHNXaXRoLCBlbmRzV2l0aCwgaW5jbHVkZXN9XG52YXIgaXNSZWdFeHAgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaXMtcmVnZXhwJyk7XG52YXIgcmVxdWlyZU9iamVjdENvZXJjaWJsZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9yZXF1aXJlLW9iamVjdC1jb2VyY2libGUnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAodGhhdCwgc2VhcmNoU3RyaW5nLCBOQU1FKSB7XG4gIGlmIChpc1JlZ0V4cChzZWFyY2hTdHJpbmcpKSB7XG4gICAgdGhyb3cgVHlwZUVycm9yKCdTdHJpbmcucHJvdG90eXBlLicgKyBOQU1FICsgXCIgZG9lc24ndCBhY2NlcHQgcmVnZXhcIik7XG4gIH0gcmV0dXJuIFN0cmluZyhyZXF1aXJlT2JqZWN0Q29lcmNpYmxlKHRoYXQpKTtcbn07XG4iLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2dsb2JhbCcpO1xudmFyIHNoYXJlZCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9zaGFyZWQnKTtcbnZhciB1aWQgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvdWlkJyk7XG52YXIgTkFUSVZFX1NZTUJPTCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9uYXRpdmUtc3ltYm9sJyk7XG5cbnZhciBTeW1ib2wgPSBnbG9iYWwuU3ltYm9sO1xudmFyIHN0b3JlID0gc2hhcmVkKCd3a3MnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobmFtZSkge1xuICByZXR1cm4gc3RvcmVbbmFtZV0gfHwgKHN0b3JlW25hbWVdID0gTkFUSVZFX1NZTUJPTCAmJiBTeW1ib2xbbmFtZV1cbiAgICB8fCAoTkFUSVZFX1NZTUJPTCA/IFN5bWJvbCA6IHVpZCkoJ1N5bWJvbC4nICsgbmFtZSkpO1xufTtcbiIsIi8vIGEgc3RyaW5nIG9mIGFsbCB2YWxpZCB1bmljb2RlIHdoaXRlc3BhY2VzXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbWF4LWxlblxubW9kdWxlLmV4cG9ydHMgPSAnXFx1MDAwOVxcdTAwMEFcXHUwMDBCXFx1MDAwQ1xcdTAwMERcXHUwMDIwXFx1MDBBMFxcdTE2ODBcXHUyMDAwXFx1MjAwMVxcdTIwMDJcXHUyMDAzXFx1MjAwNFxcdTIwMDVcXHUyMDA2XFx1MjAwN1xcdTIwMDhcXHUyMDA5XFx1MjAwQVxcdTIwMkZcXHUyMDVGXFx1MzAwMFxcdTIwMjhcXHUyMDI5XFx1RkVGRic7XG4iLCIndXNlIHN0cmljdCc7XG52YXIgJCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9leHBvcnQnKTtcbnZhciBhcnJheU1ldGhvZHMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvYXJyYXktbWV0aG9kcycpO1xudmFyIGFycmF5TWV0aG9kSGFzU3BlY2llc1N1cHBvcnQgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvYXJyYXktbWV0aG9kLWhhcy1zcGVjaWVzLXN1cHBvcnQnKTtcblxudmFyIGludGVybmFsRmlsdGVyID0gYXJyYXlNZXRob2RzKDIpO1xudmFyIFNQRUNJRVNfU1VQUE9SVCA9IGFycmF5TWV0aG9kSGFzU3BlY2llc1N1cHBvcnQoJ2ZpbHRlcicpO1xuXG4vLyBgQXJyYXkucHJvdG90eXBlLmZpbHRlcmAgbWV0aG9kXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1hcnJheS5wcm90b3R5cGUuZmlsdGVyXG4vLyB3aXRoIGFkZGluZyBzdXBwb3J0IG9mIEBAc3BlY2llc1xuJCh7IHRhcmdldDogJ0FycmF5JywgcHJvdG86IHRydWUsIGZvcmNlZDogIVNQRUNJRVNfU1VQUE9SVCB9LCB7XG4gIGZpbHRlcjogZnVuY3Rpb24gZmlsdGVyKGNhbGxiYWNrZm4gLyogLCB0aGlzQXJnICovKSB7XG4gICAgcmV0dXJuIGludGVybmFsRmlsdGVyKHRoaXMsIGNhbGxiYWNrZm4sIGFyZ3VtZW50c1sxXSk7XG4gIH1cbn0pO1xuIiwidmFyICQgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZXhwb3J0Jyk7XG52YXIgZnJvbSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9hcnJheS1mcm9tJyk7XG52YXIgY2hlY2tDb3JyZWN0bmVzc09mSXRlcmF0aW9uID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2NoZWNrLWNvcnJlY3RuZXNzLW9mLWl0ZXJhdGlvbicpO1xuXG52YXIgSU5DT1JSRUNUX0lURVJBVElPTiA9ICFjaGVja0NvcnJlY3RuZXNzT2ZJdGVyYXRpb24oZnVuY3Rpb24gKGl0ZXJhYmxlKSB7XG4gIEFycmF5LmZyb20oaXRlcmFibGUpO1xufSk7XG5cbi8vIGBBcnJheS5mcm9tYCBtZXRob2Rcbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLWFycmF5LmZyb21cbiQoeyB0YXJnZXQ6ICdBcnJheScsIHN0YXQ6IHRydWUsIGZvcmNlZDogSU5DT1JSRUNUX0lURVJBVElPTiB9LCB7XG4gIGZyb206IGZyb21cbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyICQgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZXhwb3J0Jyk7XG52YXIgYXJyYXlJbmNsdWRlcyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9hcnJheS1pbmNsdWRlcycpO1xudmFyIGFkZFRvVW5zY29wYWJsZXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvYWRkLXRvLXVuc2NvcGFibGVzJyk7XG5cbnZhciBpbnRlcm5hbEluY2x1ZGVzID0gYXJyYXlJbmNsdWRlcyh0cnVlKTtcblxuLy8gYEFycmF5LnByb3RvdHlwZS5pbmNsdWRlc2AgbWV0aG9kXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1hcnJheS5wcm90b3R5cGUuaW5jbHVkZXNcbiQoeyB0YXJnZXQ6ICdBcnJheScsIHByb3RvOiB0cnVlIH0sIHtcbiAgaW5jbHVkZXM6IGZ1bmN0aW9uIGluY2x1ZGVzKGVsIC8qICwgZnJvbUluZGV4ID0gMCAqLykge1xuICAgIHJldHVybiBpbnRlcm5hbEluY2x1ZGVzKHRoaXMsIGVsLCBhcmd1bWVudHMubGVuZ3RoID4gMSA/IGFyZ3VtZW50c1sxXSA6IHVuZGVmaW5lZCk7XG4gIH1cbn0pO1xuXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1hcnJheS5wcm90b3R5cGUtQEB1bnNjb3BhYmxlc1xuYWRkVG9VbnNjb3BhYmxlcygnaW5jbHVkZXMnKTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciAkID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2V4cG9ydCcpO1xudmFyIEluZGV4ZWRPYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaW5kZXhlZC1vYmplY3QnKTtcbnZhciB0b0luZGV4ZWRPYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvdG8taW5kZXhlZC1vYmplY3QnKTtcbnZhciBzbG9wcHlBcnJheU1ldGhvZCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9zbG9wcHktYXJyYXktbWV0aG9kJyk7XG5cbnZhciBuYXRpdmVKb2luID0gW10uam9pbjtcblxudmFyIEVTM19TVFJJTkdTID0gSW5kZXhlZE9iamVjdCAhPSBPYmplY3Q7XG52YXIgU0xPUFBZX01FVEhPRCA9IHNsb3BweUFycmF5TWV0aG9kKCdqb2luJywgJywnKTtcblxuLy8gYEFycmF5LnByb3RvdHlwZS5qb2luYCBtZXRob2Rcbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLWFycmF5LnByb3RvdHlwZS5qb2luXG4kKHsgdGFyZ2V0OiAnQXJyYXknLCBwcm90bzogdHJ1ZSwgZm9yY2VkOiBFUzNfU1RSSU5HUyB8fCBTTE9QUFlfTUVUSE9EIH0sIHtcbiAgam9pbjogZnVuY3Rpb24gam9pbihzZXBhcmF0b3IpIHtcbiAgICByZXR1cm4gbmF0aXZlSm9pbi5jYWxsKHRvSW5kZXhlZE9iamVjdCh0aGlzKSwgc2VwYXJhdG9yID09PSB1bmRlZmluZWQgPyAnLCcgOiBzZXBhcmF0b3IpO1xuICB9XG59KTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciAkID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2V4cG9ydCcpO1xudmFyIGFycmF5TWV0aG9kcyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9hcnJheS1tZXRob2RzJyk7XG52YXIgYXJyYXlNZXRob2RIYXNTcGVjaWVzU3VwcG9ydCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9hcnJheS1tZXRob2QtaGFzLXNwZWNpZXMtc3VwcG9ydCcpO1xuXG52YXIgaW50ZXJuYWxNYXAgPSBhcnJheU1ldGhvZHMoMSk7XG52YXIgU1BFQ0lFU19TVVBQT1JUID0gYXJyYXlNZXRob2RIYXNTcGVjaWVzU3VwcG9ydCgnbWFwJyk7XG5cbi8vIGBBcnJheS5wcm90b3R5cGUubWFwYCBtZXRob2Rcbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLWFycmF5LnByb3RvdHlwZS5tYXBcbi8vIHdpdGggYWRkaW5nIHN1cHBvcnQgb2YgQEBzcGVjaWVzXG4kKHsgdGFyZ2V0OiAnQXJyYXknLCBwcm90bzogdHJ1ZSwgZm9yY2VkOiAhU1BFQ0lFU19TVVBQT1JUIH0sIHtcbiAgbWFwOiBmdW5jdGlvbiBtYXAoY2FsbGJhY2tmbiAvKiAsIHRoaXNBcmcgKi8pIHtcbiAgICByZXR1cm4gaW50ZXJuYWxNYXAodGhpcywgY2FsbGJhY2tmbiwgYXJndW1lbnRzWzFdKTtcbiAgfVxufSk7XG4iLCIndXNlIHN0cmljdCc7XG52YXIgJCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9leHBvcnQnKTtcbnZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pcy1vYmplY3QnKTtcbnZhciBpc0FycmF5ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2lzLWFycmF5Jyk7XG52YXIgdG9BYnNvbHV0ZUluZGV4ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3RvLWFic29sdXRlLWluZGV4Jyk7XG52YXIgdG9MZW5ndGggPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvdG8tbGVuZ3RoJyk7XG52YXIgdG9JbmRleGVkT2JqZWN0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3RvLWluZGV4ZWQtb2JqZWN0Jyk7XG52YXIgY3JlYXRlUHJvcGVydHkgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvY3JlYXRlLXByb3BlcnR5Jyk7XG52YXIgYXJyYXlNZXRob2RIYXNTcGVjaWVzU3VwcG9ydCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9hcnJheS1tZXRob2QtaGFzLXNwZWNpZXMtc3VwcG9ydCcpO1xudmFyIHdlbGxLbm93blN5bWJvbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy93ZWxsLWtub3duLXN5bWJvbCcpO1xuXG52YXIgU1BFQ0lFUyA9IHdlbGxLbm93blN5bWJvbCgnc3BlY2llcycpO1xudmFyIG5hdGl2ZVNsaWNlID0gW10uc2xpY2U7XG52YXIgbWF4ID0gTWF0aC5tYXg7XG5cbnZhciBTUEVDSUVTX1NVUFBPUlQgPSBhcnJheU1ldGhvZEhhc1NwZWNpZXNTdXBwb3J0KCdzbGljZScpO1xuXG4vLyBgQXJyYXkucHJvdG90eXBlLnNsaWNlYCBtZXRob2Rcbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLWFycmF5LnByb3RvdHlwZS5zbGljZVxuLy8gZmFsbGJhY2sgZm9yIG5vdCBhcnJheS1saWtlIEVTMyBzdHJpbmdzIGFuZCBET00gb2JqZWN0c1xuJCh7IHRhcmdldDogJ0FycmF5JywgcHJvdG86IHRydWUsIGZvcmNlZDogIVNQRUNJRVNfU1VQUE9SVCB9LCB7XG4gIHNsaWNlOiBmdW5jdGlvbiBzbGljZShzdGFydCwgZW5kKSB7XG4gICAgdmFyIE8gPSB0b0luZGV4ZWRPYmplY3QodGhpcyk7XG4gICAgdmFyIGxlbmd0aCA9IHRvTGVuZ3RoKE8ubGVuZ3RoKTtcbiAgICB2YXIgayA9IHRvQWJzb2x1dGVJbmRleChzdGFydCwgbGVuZ3RoKTtcbiAgICB2YXIgZmluID0gdG9BYnNvbHV0ZUluZGV4KGVuZCA9PT0gdW5kZWZpbmVkID8gbGVuZ3RoIDogZW5kLCBsZW5ndGgpO1xuICAgIC8vIGlubGluZSBgQXJyYXlTcGVjaWVzQ3JlYXRlYCBmb3IgdXNhZ2UgbmF0aXZlIGBBcnJheSNzbGljZWAgd2hlcmUgaXQncyBwb3NzaWJsZVxuICAgIHZhciBDb25zdHJ1Y3RvciwgcmVzdWx0LCBuO1xuICAgIGlmIChpc0FycmF5KE8pKSB7XG4gICAgICBDb25zdHJ1Y3RvciA9IE8uY29uc3RydWN0b3I7XG4gICAgICAvLyBjcm9zcy1yZWFsbSBmYWxsYmFja1xuICAgICAgaWYgKHR5cGVvZiBDb25zdHJ1Y3RvciA9PSAnZnVuY3Rpb24nICYmIChDb25zdHJ1Y3RvciA9PT0gQXJyYXkgfHwgaXNBcnJheShDb25zdHJ1Y3Rvci5wcm90b3R5cGUpKSkge1xuICAgICAgICBDb25zdHJ1Y3RvciA9IHVuZGVmaW5lZDtcbiAgICAgIH0gZWxzZSBpZiAoaXNPYmplY3QoQ29uc3RydWN0b3IpKSB7XG4gICAgICAgIENvbnN0cnVjdG9yID0gQ29uc3RydWN0b3JbU1BFQ0lFU107XG4gICAgICAgIGlmIChDb25zdHJ1Y3RvciA9PT0gbnVsbCkgQ29uc3RydWN0b3IgPSB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgICBpZiAoQ29uc3RydWN0b3IgPT09IEFycmF5IHx8IENvbnN0cnVjdG9yID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIG5hdGl2ZVNsaWNlLmNhbGwoTywgaywgZmluKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmVzdWx0ID0gbmV3IChDb25zdHJ1Y3RvciA9PT0gdW5kZWZpbmVkID8gQXJyYXkgOiBDb25zdHJ1Y3RvcikobWF4KGZpbiAtIGssIDApKTtcbiAgICBmb3IgKG4gPSAwOyBrIDwgZmluOyBrKyssIG4rKykgaWYgKGsgaW4gTykgY3JlYXRlUHJvcGVydHkocmVzdWx0LCBuLCBPW2tdKTtcbiAgICByZXN1bHQubGVuZ3RoID0gbjtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG59KTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciAkID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2V4cG9ydCcpO1xudmFyIHRvQWJzb2x1dGVJbmRleCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy90by1hYnNvbHV0ZS1pbmRleCcpO1xudmFyIHRvSW50ZWdlciA9IHJlcXVpcmUoJy4uL2ludGVybmFscy90by1pbnRlZ2VyJyk7XG52YXIgdG9MZW5ndGggPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvdG8tbGVuZ3RoJyk7XG52YXIgdG9PYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvdG8tb2JqZWN0Jyk7XG52YXIgYXJyYXlTcGVjaWVzQ3JlYXRlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2FycmF5LXNwZWNpZXMtY3JlYXRlJyk7XG52YXIgY3JlYXRlUHJvcGVydHkgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvY3JlYXRlLXByb3BlcnR5Jyk7XG52YXIgYXJyYXlNZXRob2RIYXNTcGVjaWVzU3VwcG9ydCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9hcnJheS1tZXRob2QtaGFzLXNwZWNpZXMtc3VwcG9ydCcpO1xuXG52YXIgbWF4ID0gTWF0aC5tYXg7XG52YXIgbWluID0gTWF0aC5taW47XG52YXIgTUFYX1NBRkVfSU5URUdFUiA9IDB4MUZGRkZGRkZGRkZGRkY7XG52YXIgTUFYSU1VTV9BTExPV0VEX0xFTkdUSF9FWENFRURFRCA9ICdNYXhpbXVtIGFsbG93ZWQgbGVuZ3RoIGV4Y2VlZGVkJztcblxudmFyIFNQRUNJRVNfU1VQUE9SVCA9IGFycmF5TWV0aG9kSGFzU3BlY2llc1N1cHBvcnQoJ3NwbGljZScpO1xuXG4vLyBgQXJyYXkucHJvdG90eXBlLnNwbGljZWAgbWV0aG9kXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1hcnJheS5wcm90b3R5cGUuc3BsaWNlXG4vLyB3aXRoIGFkZGluZyBzdXBwb3J0IG9mIEBAc3BlY2llc1xuJCh7IHRhcmdldDogJ0FycmF5JywgcHJvdG86IHRydWUsIGZvcmNlZDogIVNQRUNJRVNfU1VQUE9SVCB9LCB7XG4gIHNwbGljZTogZnVuY3Rpb24gc3BsaWNlKHN0YXJ0LCBkZWxldGVDb3VudCAvKiAsIC4uLml0ZW1zICovKSB7XG4gICAgdmFyIE8gPSB0b09iamVjdCh0aGlzKTtcbiAgICB2YXIgbGVuID0gdG9MZW5ndGgoTy5sZW5ndGgpO1xuICAgIHZhciBhY3R1YWxTdGFydCA9IHRvQWJzb2x1dGVJbmRleChzdGFydCwgbGVuKTtcbiAgICB2YXIgYXJndW1lbnRzTGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICB2YXIgaW5zZXJ0Q291bnQsIGFjdHVhbERlbGV0ZUNvdW50LCBBLCBrLCBmcm9tLCB0bztcbiAgICBpZiAoYXJndW1lbnRzTGVuZ3RoID09PSAwKSB7XG4gICAgICBpbnNlcnRDb3VudCA9IGFjdHVhbERlbGV0ZUNvdW50ID0gMDtcbiAgICB9IGVsc2UgaWYgKGFyZ3VtZW50c0xlbmd0aCA9PT0gMSkge1xuICAgICAgaW5zZXJ0Q291bnQgPSAwO1xuICAgICAgYWN0dWFsRGVsZXRlQ291bnQgPSBsZW4gLSBhY3R1YWxTdGFydDtcbiAgICB9IGVsc2Uge1xuICAgICAgaW5zZXJ0Q291bnQgPSBhcmd1bWVudHNMZW5ndGggLSAyO1xuICAgICAgYWN0dWFsRGVsZXRlQ291bnQgPSBtaW4obWF4KHRvSW50ZWdlcihkZWxldGVDb3VudCksIDApLCBsZW4gLSBhY3R1YWxTdGFydCk7XG4gICAgfVxuICAgIGlmIChsZW4gKyBpbnNlcnRDb3VudCAtIGFjdHVhbERlbGV0ZUNvdW50ID4gTUFYX1NBRkVfSU5URUdFUikge1xuICAgICAgdGhyb3cgVHlwZUVycm9yKE1BWElNVU1fQUxMT1dFRF9MRU5HVEhfRVhDRUVERUQpO1xuICAgIH1cbiAgICBBID0gYXJyYXlTcGVjaWVzQ3JlYXRlKE8sIGFjdHVhbERlbGV0ZUNvdW50KTtcbiAgICBmb3IgKGsgPSAwOyBrIDwgYWN0dWFsRGVsZXRlQ291bnQ7IGsrKykge1xuICAgICAgZnJvbSA9IGFjdHVhbFN0YXJ0ICsgaztcbiAgICAgIGlmIChmcm9tIGluIE8pIGNyZWF0ZVByb3BlcnR5KEEsIGssIE9bZnJvbV0pO1xuICAgIH1cbiAgICBBLmxlbmd0aCA9IGFjdHVhbERlbGV0ZUNvdW50O1xuICAgIGlmIChpbnNlcnRDb3VudCA8IGFjdHVhbERlbGV0ZUNvdW50KSB7XG4gICAgICBmb3IgKGsgPSBhY3R1YWxTdGFydDsgayA8IGxlbiAtIGFjdHVhbERlbGV0ZUNvdW50OyBrKyspIHtcbiAgICAgICAgZnJvbSA9IGsgKyBhY3R1YWxEZWxldGVDb3VudDtcbiAgICAgICAgdG8gPSBrICsgaW5zZXJ0Q291bnQ7XG4gICAgICAgIGlmIChmcm9tIGluIE8pIE9bdG9dID0gT1tmcm9tXTtcbiAgICAgICAgZWxzZSBkZWxldGUgT1t0b107XG4gICAgICB9XG4gICAgICBmb3IgKGsgPSBsZW47IGsgPiBsZW4gLSBhY3R1YWxEZWxldGVDb3VudCArIGluc2VydENvdW50OyBrLS0pIGRlbGV0ZSBPW2sgLSAxXTtcbiAgICB9IGVsc2UgaWYgKGluc2VydENvdW50ID4gYWN0dWFsRGVsZXRlQ291bnQpIHtcbiAgICAgIGZvciAoayA9IGxlbiAtIGFjdHVhbERlbGV0ZUNvdW50OyBrID4gYWN0dWFsU3RhcnQ7IGstLSkge1xuICAgICAgICBmcm9tID0gayArIGFjdHVhbERlbGV0ZUNvdW50IC0gMTtcbiAgICAgICAgdG8gPSBrICsgaW5zZXJ0Q291bnQgLSAxO1xuICAgICAgICBpZiAoZnJvbSBpbiBPKSBPW3RvXSA9IE9bZnJvbV07XG4gICAgICAgIGVsc2UgZGVsZXRlIE9bdG9dO1xuICAgICAgfVxuICAgIH1cbiAgICBmb3IgKGsgPSAwOyBrIDwgaW5zZXJ0Q291bnQ7IGsrKykge1xuICAgICAgT1trICsgYWN0dWFsU3RhcnRdID0gYXJndW1lbnRzW2sgKyAyXTtcbiAgICB9XG4gICAgTy5sZW5ndGggPSBsZW4gLSBhY3R1YWxEZWxldGVDb3VudCArIGluc2VydENvdW50O1xuICAgIHJldHVybiBBO1xuICB9XG59KTtcbiIsInZhciBERVNDUklQVE9SUyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9kZXNjcmlwdG9ycycpO1xudmFyIGRlZmluZVByb3BlcnR5ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL29iamVjdC1kZWZpbmUtcHJvcGVydHknKS5mO1xuXG52YXIgRnVuY3Rpb25Qcm90b3R5cGUgPSBGdW5jdGlvbi5wcm90b3R5cGU7XG52YXIgRnVuY3Rpb25Qcm90b3R5cGVUb1N0cmluZyA9IEZ1bmN0aW9uUHJvdG90eXBlLnRvU3RyaW5nO1xudmFyIG5hbWVSRSA9IC9eXFxzKmZ1bmN0aW9uIChbXiAoXSopLztcbnZhciBOQU1FID0gJ25hbWUnO1xuXG4vLyBGdW5jdGlvbiBpbnN0YW5jZXMgYC5uYW1lYCBwcm9wZXJ0eVxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtZnVuY3Rpb24taW5zdGFuY2VzLW5hbWVcbmlmIChERVNDUklQVE9SUyAmJiAhKE5BTUUgaW4gRnVuY3Rpb25Qcm90b3R5cGUpKSB7XG4gIGRlZmluZVByb3BlcnR5KEZ1bmN0aW9uUHJvdG90eXBlLCBOQU1FLCB7XG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIEZ1bmN0aW9uUHJvdG90eXBlVG9TdHJpbmcuY2FsbCh0aGlzKS5tYXRjaChuYW1lUkUpWzFdO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG59XG4iLCIndXNlIHN0cmljdCc7XG52YXIgREVTQ1JJUFRPUlMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZGVzY3JpcHRvcnMnKTtcbnZhciBnbG9iYWwgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZ2xvYmFsJyk7XG52YXIgaXNGb3JjZWQgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaXMtZm9yY2VkJyk7XG52YXIgcmVkZWZpbmUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvcmVkZWZpbmUnKTtcbnZhciBoYXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaGFzJyk7XG52YXIgY2xhc3NvZiA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9jbGFzc29mLXJhdycpO1xudmFyIGluaGVyaXRJZlJlcXVpcmVkID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2luaGVyaXQtaWYtcmVxdWlyZWQnKTtcbnZhciB0b1ByaW1pdGl2ZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy90by1wcmltaXRpdmUnKTtcbnZhciBmYWlscyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9mYWlscycpO1xudmFyIGNyZWF0ZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9vYmplY3QtY3JlYXRlJyk7XG52YXIgZ2V0T3duUHJvcGVydHlOYW1lcyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9vYmplY3QtZ2V0LW93bi1wcm9wZXJ0eS1uYW1lcycpLmY7XG52YXIgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL29iamVjdC1nZXQtb3duLXByb3BlcnR5LWRlc2NyaXB0b3InKS5mO1xudmFyIGRlZmluZVByb3BlcnR5ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL29iamVjdC1kZWZpbmUtcHJvcGVydHknKS5mO1xudmFyIGludGVybmFsU3RyaW5nVHJpbSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9zdHJpbmctdHJpbScpO1xuXG52YXIgTlVNQkVSID0gJ051bWJlcic7XG52YXIgTmF0aXZlTnVtYmVyID0gZ2xvYmFsW05VTUJFUl07XG52YXIgTnVtYmVyUHJvdG90eXBlID0gTmF0aXZlTnVtYmVyLnByb3RvdHlwZTtcblxuLy8gT3BlcmEgfjEyIGhhcyBicm9rZW4gT2JqZWN0I3RvU3RyaW5nXG52YXIgQlJPS0VOX0NMQVNTT0YgPSBjbGFzc29mKGNyZWF0ZShOdW1iZXJQcm90b3R5cGUpKSA9PSBOVU1CRVI7XG52YXIgTkFUSVZFX1RSSU0gPSAndHJpbScgaW4gU3RyaW5nLnByb3RvdHlwZTtcblxuLy8gYFRvTnVtYmVyYCBhYnN0cmFjdCBvcGVyYXRpb25cbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLXRvbnVtYmVyXG52YXIgdG9OdW1iZXIgPSBmdW5jdGlvbiAoYXJndW1lbnQpIHtcbiAgdmFyIGl0ID0gdG9QcmltaXRpdmUoYXJndW1lbnQsIGZhbHNlKTtcbiAgdmFyIGZpcnN0LCB0aGlyZCwgcmFkaXgsIG1heENvZGUsIGRpZ2l0cywgbGVuZ3RoLCBpLCBjb2RlO1xuICBpZiAodHlwZW9mIGl0ID09ICdzdHJpbmcnICYmIGl0Lmxlbmd0aCA+IDIpIHtcbiAgICBpdCA9IE5BVElWRV9UUklNID8gaXQudHJpbSgpIDogaW50ZXJuYWxTdHJpbmdUcmltKGl0LCAzKTtcbiAgICBmaXJzdCA9IGl0LmNoYXJDb2RlQXQoMCk7XG4gICAgaWYgKGZpcnN0ID09PSA0MyB8fCBmaXJzdCA9PT0gNDUpIHtcbiAgICAgIHRoaXJkID0gaXQuY2hhckNvZGVBdCgyKTtcbiAgICAgIGlmICh0aGlyZCA9PT0gODggfHwgdGhpcmQgPT09IDEyMCkgcmV0dXJuIE5hTjsgLy8gTnVtYmVyKCcrMHgxJykgc2hvdWxkIGJlIE5hTiwgb2xkIFY4IGZpeFxuICAgIH0gZWxzZSBpZiAoZmlyc3QgPT09IDQ4KSB7XG4gICAgICBzd2l0Y2ggKGl0LmNoYXJDb2RlQXQoMSkpIHtcbiAgICAgICAgY2FzZSA2NjogY2FzZSA5ODogcmFkaXggPSAyOyBtYXhDb2RlID0gNDk7IGJyZWFrOyAvLyBmYXN0IGVxdWFsIG9mIC9eMGJbMDFdKyQvaVxuICAgICAgICBjYXNlIDc5OiBjYXNlIDExMTogcmFkaXggPSA4OyBtYXhDb2RlID0gNTU7IGJyZWFrOyAvLyBmYXN0IGVxdWFsIG9mIC9eMG9bMC03XSskL2lcbiAgICAgICAgZGVmYXVsdDogcmV0dXJuICtpdDtcbiAgICAgIH1cbiAgICAgIGRpZ2l0cyA9IGl0LnNsaWNlKDIpO1xuICAgICAgbGVuZ3RoID0gZGlnaXRzLmxlbmd0aDtcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBjb2RlID0gZGlnaXRzLmNoYXJDb2RlQXQoaSk7XG4gICAgICAgIC8vIHBhcnNlSW50IHBhcnNlcyBhIHN0cmluZyB0byBhIGZpcnN0IHVuYXZhaWxhYmxlIHN5bWJvbFxuICAgICAgICAvLyBidXQgVG9OdW1iZXIgc2hvdWxkIHJldHVybiBOYU4gaWYgYSBzdHJpbmcgY29udGFpbnMgdW5hdmFpbGFibGUgc3ltYm9sc1xuICAgICAgICBpZiAoY29kZSA8IDQ4IHx8IGNvZGUgPiBtYXhDb2RlKSByZXR1cm4gTmFOO1xuICAgICAgfSByZXR1cm4gcGFyc2VJbnQoZGlnaXRzLCByYWRpeCk7XG4gICAgfVxuICB9IHJldHVybiAraXQ7XG59O1xuXG4vLyBgTnVtYmVyYCBjb25zdHJ1Y3RvclxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtbnVtYmVyLWNvbnN0cnVjdG9yXG5pZiAoaXNGb3JjZWQoTlVNQkVSLCAhTmF0aXZlTnVtYmVyKCcgMG8xJykgfHwgIU5hdGl2ZU51bWJlcignMGIxJykgfHwgTmF0aXZlTnVtYmVyKCcrMHgxJykpKSB7XG4gIHZhciBOdW1iZXJXcmFwcGVyID0gZnVuY3Rpb24gTnVtYmVyKHZhbHVlKSB7XG4gICAgdmFyIGl0ID0gYXJndW1lbnRzLmxlbmd0aCA8IDEgPyAwIDogdmFsdWU7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgIHJldHVybiB0aGF0IGluc3RhbmNlb2YgTnVtYmVyV3JhcHBlclxuICAgICAgLy8gY2hlY2sgb24gMS4uY29uc3RydWN0b3IoZm9vKSBjYXNlXG4gICAgICAmJiAoQlJPS0VOX0NMQVNTT0YgPyBmYWlscyhmdW5jdGlvbiAoKSB7IE51bWJlclByb3RvdHlwZS52YWx1ZU9mLmNhbGwodGhhdCk7IH0pIDogY2xhc3NvZih0aGF0KSAhPSBOVU1CRVIpXG4gICAgICAgID8gaW5oZXJpdElmUmVxdWlyZWQobmV3IE5hdGl2ZU51bWJlcih0b051bWJlcihpdCkpLCB0aGF0LCBOdW1iZXJXcmFwcGVyKSA6IHRvTnVtYmVyKGl0KTtcbiAgfTtcbiAgZm9yICh2YXIga2V5cyA9IERFU0NSSVBUT1JTID8gZ2V0T3duUHJvcGVydHlOYW1lcyhOYXRpdmVOdW1iZXIpIDogKFxuICAgIC8vIEVTMzpcbiAgICAnTUFYX1ZBTFVFLE1JTl9WQUxVRSxOYU4sTkVHQVRJVkVfSU5GSU5JVFksUE9TSVRJVkVfSU5GSU5JVFksJyArXG4gICAgLy8gRVMyMDE1IChpbiBjYXNlLCBpZiBtb2R1bGVzIHdpdGggRVMyMDE1IE51bWJlciBzdGF0aWNzIHJlcXVpcmVkIGJlZm9yZSk6XG4gICAgJ0VQU0lMT04saXNGaW5pdGUsaXNJbnRlZ2VyLGlzTmFOLGlzU2FmZUludGVnZXIsTUFYX1NBRkVfSU5URUdFUiwnICtcbiAgICAnTUlOX1NBRkVfSU5URUdFUixwYXJzZUZsb2F0LHBhcnNlSW50LGlzSW50ZWdlcidcbiAgKS5zcGxpdCgnLCcpLCBqID0gMCwga2V5OyBrZXlzLmxlbmd0aCA+IGo7IGorKykge1xuICAgIGlmIChoYXMoTmF0aXZlTnVtYmVyLCBrZXkgPSBrZXlzW2pdKSAmJiAhaGFzKE51bWJlcldyYXBwZXIsIGtleSkpIHtcbiAgICAgIGRlZmluZVByb3BlcnR5KE51bWJlcldyYXBwZXIsIGtleSwgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKE5hdGl2ZU51bWJlciwga2V5KSk7XG4gICAgfVxuICB9XG4gIE51bWJlcldyYXBwZXIucHJvdG90eXBlID0gTnVtYmVyUHJvdG90eXBlO1xuICBOdW1iZXJQcm90b3R5cGUuY29uc3RydWN0b3IgPSBOdW1iZXJXcmFwcGVyO1xuICByZWRlZmluZShnbG9iYWwsIE5VTUJFUiwgTnVtYmVyV3JhcHBlcik7XG59XG4iLCJ2YXIgJCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9leHBvcnQnKTtcbnZhciBhc3NpZ24gPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0LWFzc2lnbicpO1xuXG4vLyBgT2JqZWN0LmFzc2lnbmAgbWV0aG9kXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1vYmplY3QuYXNzaWduXG4kKHsgdGFyZ2V0OiAnT2JqZWN0Jywgc3RhdDogdHJ1ZSwgZm9yY2VkOiBPYmplY3QuYXNzaWduICE9PSBhc3NpZ24gfSwge1xuICBhc3NpZ246IGFzc2lnblxufSk7XG4iLCJ2YXIgJCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9leHBvcnQnKTtcbnZhciBvYmplY3RUb0FycmF5ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL29iamVjdC10by1hcnJheScpO1xuXG4vLyBgT2JqZWN0LmVudHJpZXNgIG1ldGhvZFxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtb2JqZWN0LmVudHJpZXNcbiQoeyB0YXJnZXQ6ICdPYmplY3QnLCBzdGF0OiB0cnVlIH0sIHtcbiAgZW50cmllczogZnVuY3Rpb24gZW50cmllcyhPKSB7XG4gICAgcmV0dXJuIG9iamVjdFRvQXJyYXkoTywgdHJ1ZSk7XG4gIH1cbn0pO1xuIiwidmFyICQgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZXhwb3J0Jyk7XG52YXIgdG9PYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvdG8tb2JqZWN0Jyk7XG52YXIgbmF0aXZlS2V5cyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9vYmplY3Qta2V5cycpO1xudmFyIGZhaWxzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2ZhaWxzJyk7XG5cbnZhciBGQUlMU19PTl9QUklNSVRJVkVTID0gZmFpbHMoZnVuY3Rpb24gKCkgeyBuYXRpdmVLZXlzKDEpOyB9KTtcblxuLy8gYE9iamVjdC5rZXlzYCBtZXRob2Rcbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLW9iamVjdC5rZXlzXG4kKHsgdGFyZ2V0OiAnT2JqZWN0Jywgc3RhdDogdHJ1ZSwgZm9yY2VkOiBGQUlMU19PTl9QUklNSVRJVkVTIH0sIHtcbiAga2V5czogZnVuY3Rpb24ga2V5cyhpdCkge1xuICAgIHJldHVybiBuYXRpdmVLZXlzKHRvT2JqZWN0KGl0KSk7XG4gIH1cbn0pO1xuIiwidmFyIHJlZGVmaW5lID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3JlZGVmaW5lJyk7XG52YXIgdG9TdHJpbmcgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0LXRvLXN0cmluZycpO1xuXG52YXIgT2JqZWN0UHJvdG90eXBlID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLy8gYE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmdgIG1ldGhvZFxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtb2JqZWN0LnByb3RvdHlwZS50b3N0cmluZ1xuaWYgKHRvU3RyaW5nICE9PSBPYmplY3RQcm90b3R5cGUudG9TdHJpbmcpIHtcbiAgcmVkZWZpbmUoT2JqZWN0UHJvdG90eXBlLCAndG9TdHJpbmcnLCB0b1N0cmluZywgeyB1bnNhZmU6IHRydWUgfSk7XG59XG4iLCIndXNlIHN0cmljdCc7XG52YXIgcmVkZWZpbmUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvcmVkZWZpbmUnKTtcbnZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9hbi1vYmplY3QnKTtcbnZhciBmYWlscyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9mYWlscycpO1xudmFyIGZsYWdzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3JlZ2V4cC1mbGFncycpO1xuXG52YXIgVE9fU1RSSU5HID0gJ3RvU3RyaW5nJztcbnZhciBuYXRpdmVUb1N0cmluZyA9IC8uL1tUT19TVFJJTkddO1xudmFyIFJlZ0V4cFByb3RvdHlwZSA9IFJlZ0V4cC5wcm90b3R5cGU7XG5cbnZhciBOT1RfR0VORVJJQyA9IGZhaWxzKGZ1bmN0aW9uICgpIHsgcmV0dXJuIG5hdGl2ZVRvU3RyaW5nLmNhbGwoeyBzb3VyY2U6ICdhJywgZmxhZ3M6ICdiJyB9KSAhPSAnL2EvYic7IH0pO1xuLy8gRkY0NC0gUmVnRXhwI3RvU3RyaW5nIGhhcyBhIHdyb25nIG5hbWVcbnZhciBJTkNPUlJFQ1RfTkFNRSA9IG5hdGl2ZVRvU3RyaW5nLm5hbWUgIT0gVE9fU1RSSU5HO1xuXG4vLyBgUmVnRXhwLnByb3RvdHlwZS50b1N0cmluZ2AgbWV0aG9kXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1yZWdleHAucHJvdG90eXBlLnRvc3RyaW5nXG5pZiAoTk9UX0dFTkVSSUMgfHwgSU5DT1JSRUNUX05BTUUpIHtcbiAgcmVkZWZpbmUoUmVnRXhwLnByb3RvdHlwZSwgVE9fU1RSSU5HLCBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgICB2YXIgUiA9IGFuT2JqZWN0KHRoaXMpO1xuICAgIHZhciBwID0gU3RyaW5nKFIuc291cmNlKTtcbiAgICB2YXIgcmYgPSBSLmZsYWdzO1xuICAgIHZhciBmID0gU3RyaW5nKHJmID09PSB1bmRlZmluZWQgJiYgUiBpbnN0YW5jZW9mIFJlZ0V4cCAmJiAhKCdmbGFncycgaW4gUmVnRXhwUHJvdG90eXBlKSA/IGZsYWdzLmNhbGwoUikgOiByZik7XG4gICAgcmV0dXJuICcvJyArIHAgKyAnLycgKyBmO1xuICB9LCB7IHVuc2FmZTogdHJ1ZSB9KTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcbnZhciAkID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2V4cG9ydCcpO1xudmFyIHZhbGlkYXRlQXJndW1lbnRzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3ZhbGlkYXRlLXN0cmluZy1tZXRob2QtYXJndW1lbnRzJyk7XG52YXIgY29ycmVjdElzUmVnRXhwTG9naWMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvY29ycmVjdC1pcy1yZWdleHAtbG9naWMnKTtcblxuLy8gYFN0cmluZy5wcm90b3R5cGUuaW5jbHVkZXNgIG1ldGhvZFxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtc3RyaW5nLnByb3RvdHlwZS5pbmNsdWRlc1xuJCh7IHRhcmdldDogJ1N0cmluZycsIHByb3RvOiB0cnVlLCBmb3JjZWQ6ICFjb3JyZWN0SXNSZWdFeHBMb2dpYygnaW5jbHVkZXMnKSB9LCB7XG4gIGluY2x1ZGVzOiBmdW5jdGlvbiBpbmNsdWRlcyhzZWFyY2hTdHJpbmcgLyogLCBwb3NpdGlvbiA9IDAgKi8pIHtcbiAgICByZXR1cm4gISF+dmFsaWRhdGVBcmd1bWVudHModGhpcywgc2VhcmNoU3RyaW5nLCAnaW5jbHVkZXMnKVxuICAgICAgLmluZGV4T2Yoc2VhcmNoU3RyaW5nLCBhcmd1bWVudHMubGVuZ3RoID4gMSA/IGFyZ3VtZW50c1sxXSA6IHVuZGVmaW5lZCk7XG4gIH1cbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIGNvZGVQb2ludEF0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3N0cmluZy1hdCcpO1xudmFyIEludGVybmFsU3RhdGVNb2R1bGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaW50ZXJuYWwtc3RhdGUnKTtcbnZhciBkZWZpbmVJdGVyYXRvciA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9kZWZpbmUtaXRlcmF0b3InKTtcblxudmFyIFNUUklOR19JVEVSQVRPUiA9ICdTdHJpbmcgSXRlcmF0b3InO1xudmFyIHNldEludGVybmFsU3RhdGUgPSBJbnRlcm5hbFN0YXRlTW9kdWxlLnNldDtcbnZhciBnZXRJbnRlcm5hbFN0YXRlID0gSW50ZXJuYWxTdGF0ZU1vZHVsZS5nZXR0ZXJGb3IoU1RSSU5HX0lURVJBVE9SKTtcblxuLy8gYFN0cmluZy5wcm90b3R5cGVbQEBpdGVyYXRvcl1gIG1ldGhvZFxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtc3RyaW5nLnByb3RvdHlwZS1AQGl0ZXJhdG9yXG5kZWZpbmVJdGVyYXRvcihTdHJpbmcsICdTdHJpbmcnLCBmdW5jdGlvbiAoaXRlcmF0ZWQpIHtcbiAgc2V0SW50ZXJuYWxTdGF0ZSh0aGlzLCB7XG4gICAgdHlwZTogU1RSSU5HX0lURVJBVE9SLFxuICAgIHN0cmluZzogU3RyaW5nKGl0ZXJhdGVkKSxcbiAgICBpbmRleDogMFxuICB9KTtcbi8vIGAlU3RyaW5nSXRlcmF0b3JQcm90b3R5cGUlLm5leHRgIG1ldGhvZFxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtJXN0cmluZ2l0ZXJhdG9ycHJvdG90eXBlJS5uZXh0XG59LCBmdW5jdGlvbiBuZXh0KCkge1xuICB2YXIgc3RhdGUgPSBnZXRJbnRlcm5hbFN0YXRlKHRoaXMpO1xuICB2YXIgc3RyaW5nID0gc3RhdGUuc3RyaW5nO1xuICB2YXIgaW5kZXggPSBzdGF0ZS5pbmRleDtcbiAgdmFyIHBvaW50O1xuICBpZiAoaW5kZXggPj0gc3RyaW5nLmxlbmd0aCkgcmV0dXJuIHsgdmFsdWU6IHVuZGVmaW5lZCwgZG9uZTogdHJ1ZSB9O1xuICBwb2ludCA9IGNvZGVQb2ludEF0KHN0cmluZywgaW5kZXgsIHRydWUpO1xuICBzdGF0ZS5pbmRleCArPSBwb2ludC5sZW5ndGg7XG4gIHJldHVybiB7IHZhbHVlOiBwb2ludCwgZG9uZTogZmFsc2UgfTtcbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIGZpeFJlZ0V4cFdlbGxLbm93blN5bWJvbExvZ2ljID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2ZpeC1yZWdleHAtd2VsbC1rbm93bi1zeW1ib2wtbG9naWMnKTtcbnZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9hbi1vYmplY3QnKTtcbnZhciB0b0xlbmd0aCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy90by1sZW5ndGgnKTtcbnZhciByZXF1aXJlT2JqZWN0Q29lcmNpYmxlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3JlcXVpcmUtb2JqZWN0LWNvZXJjaWJsZScpO1xudmFyIGFkdmFuY2VTdHJpbmdJbmRleCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9hZHZhbmNlLXN0cmluZy1pbmRleCcpO1xudmFyIHJlZ0V4cEV4ZWMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvcmVnZXhwLWV4ZWMtYWJzdHJhY3QnKTtcblxuLy8gQEBtYXRjaCBsb2dpY1xuZml4UmVnRXhwV2VsbEtub3duU3ltYm9sTG9naWMoJ21hdGNoJywgMSwgZnVuY3Rpb24gKE1BVENILCBuYXRpdmVNYXRjaCwgbWF5YmVDYWxsTmF0aXZlKSB7XG4gIHJldHVybiBbXG4gICAgLy8gYFN0cmluZy5wcm90b3R5cGUubWF0Y2hgIG1ldGhvZFxuICAgIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLXN0cmluZy5wcm90b3R5cGUubWF0Y2hcbiAgICBmdW5jdGlvbiBtYXRjaChyZWdleHApIHtcbiAgICAgIHZhciBPID0gcmVxdWlyZU9iamVjdENvZXJjaWJsZSh0aGlzKTtcbiAgICAgIHZhciBtYXRjaGVyID0gcmVnZXhwID09IHVuZGVmaW5lZCA/IHVuZGVmaW5lZCA6IHJlZ2V4cFtNQVRDSF07XG4gICAgICByZXR1cm4gbWF0Y2hlciAhPT0gdW5kZWZpbmVkID8gbWF0Y2hlci5jYWxsKHJlZ2V4cCwgTykgOiBuZXcgUmVnRXhwKHJlZ2V4cClbTUFUQ0hdKFN0cmluZyhPKSk7XG4gICAgfSxcbiAgICAvLyBgUmVnRXhwLnByb3RvdHlwZVtAQG1hdGNoXWAgbWV0aG9kXG4gICAgLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtcmVnZXhwLnByb3RvdHlwZS1AQG1hdGNoXG4gICAgZnVuY3Rpb24gKHJlZ2V4cCkge1xuICAgICAgdmFyIHJlcyA9IG1heWJlQ2FsbE5hdGl2ZShuYXRpdmVNYXRjaCwgcmVnZXhwLCB0aGlzKTtcbiAgICAgIGlmIChyZXMuZG9uZSkgcmV0dXJuIHJlcy52YWx1ZTtcblxuICAgICAgdmFyIHJ4ID0gYW5PYmplY3QocmVnZXhwKTtcbiAgICAgIHZhciBTID0gU3RyaW5nKHRoaXMpO1xuXG4gICAgICBpZiAoIXJ4Lmdsb2JhbCkgcmV0dXJuIHJlZ0V4cEV4ZWMocngsIFMpO1xuXG4gICAgICB2YXIgZnVsbFVuaWNvZGUgPSByeC51bmljb2RlO1xuICAgICAgcngubGFzdEluZGV4ID0gMDtcbiAgICAgIHZhciBBID0gW107XG4gICAgICB2YXIgbiA9IDA7XG4gICAgICB2YXIgcmVzdWx0O1xuICAgICAgd2hpbGUgKChyZXN1bHQgPSByZWdFeHBFeGVjKHJ4LCBTKSkgIT09IG51bGwpIHtcbiAgICAgICAgdmFyIG1hdGNoU3RyID0gU3RyaW5nKHJlc3VsdFswXSk7XG4gICAgICAgIEFbbl0gPSBtYXRjaFN0cjtcbiAgICAgICAgaWYgKG1hdGNoU3RyID09PSAnJykgcngubGFzdEluZGV4ID0gYWR2YW5jZVN0cmluZ0luZGV4KFMsIHRvTGVuZ3RoKHJ4Lmxhc3RJbmRleCksIGZ1bGxVbmljb2RlKTtcbiAgICAgICAgbisrO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG4gPT09IDAgPyBudWxsIDogQTtcbiAgICB9XG4gIF07XG59KTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBmaXhSZWdFeHBXZWxsS25vd25TeW1ib2xMb2dpYyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9maXgtcmVnZXhwLXdlbGwta25vd24tc3ltYm9sLWxvZ2ljJyk7XG52YXIgYW5PYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvYW4tb2JqZWN0Jyk7XG52YXIgdG9PYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvdG8tb2JqZWN0Jyk7XG52YXIgdG9MZW5ndGggPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvdG8tbGVuZ3RoJyk7XG52YXIgdG9JbnRlZ2VyID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3RvLWludGVnZXInKTtcbnZhciByZXF1aXJlT2JqZWN0Q29lcmNpYmxlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3JlcXVpcmUtb2JqZWN0LWNvZXJjaWJsZScpO1xudmFyIGFkdmFuY2VTdHJpbmdJbmRleCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9hZHZhbmNlLXN0cmluZy1pbmRleCcpO1xudmFyIHJlZ0V4cEV4ZWMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvcmVnZXhwLWV4ZWMtYWJzdHJhY3QnKTtcblxudmFyIG1heCA9IE1hdGgubWF4O1xudmFyIG1pbiA9IE1hdGgubWluO1xudmFyIGZsb29yID0gTWF0aC5mbG9vcjtcbnZhciBTVUJTVElUVVRJT05fU1lNQk9MUyA9IC9cXCQoWyQmJ2BdfFxcZFxcZD98PFtePl0qPikvZztcbnZhciBTVUJTVElUVVRJT05fU1lNQk9MU19OT19OQU1FRCA9IC9cXCQoWyQmJ2BdfFxcZFxcZD8pL2c7XG5cbnZhciBtYXliZVRvU3RyaW5nID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBpdCA9PT0gdW5kZWZpbmVkID8gaXQgOiBTdHJpbmcoaXQpO1xufTtcblxuLy8gQEByZXBsYWNlIGxvZ2ljXG5maXhSZWdFeHBXZWxsS25vd25TeW1ib2xMb2dpYygncmVwbGFjZScsIDIsIGZ1bmN0aW9uIChSRVBMQUNFLCBuYXRpdmVSZXBsYWNlLCBtYXliZUNhbGxOYXRpdmUpIHtcbiAgcmV0dXJuIFtcbiAgICAvLyBgU3RyaW5nLnByb3RvdHlwZS5yZXBsYWNlYCBtZXRob2RcbiAgICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1zdHJpbmcucHJvdG90eXBlLnJlcGxhY2VcbiAgICBmdW5jdGlvbiByZXBsYWNlKHNlYXJjaFZhbHVlLCByZXBsYWNlVmFsdWUpIHtcbiAgICAgIHZhciBPID0gcmVxdWlyZU9iamVjdENvZXJjaWJsZSh0aGlzKTtcbiAgICAgIHZhciByZXBsYWNlciA9IHNlYXJjaFZhbHVlID09IHVuZGVmaW5lZCA/IHVuZGVmaW5lZCA6IHNlYXJjaFZhbHVlW1JFUExBQ0VdO1xuICAgICAgcmV0dXJuIHJlcGxhY2VyICE9PSB1bmRlZmluZWRcbiAgICAgICAgPyByZXBsYWNlci5jYWxsKHNlYXJjaFZhbHVlLCBPLCByZXBsYWNlVmFsdWUpXG4gICAgICAgIDogbmF0aXZlUmVwbGFjZS5jYWxsKFN0cmluZyhPKSwgc2VhcmNoVmFsdWUsIHJlcGxhY2VWYWx1ZSk7XG4gICAgfSxcbiAgICAvLyBgUmVnRXhwLnByb3RvdHlwZVtAQHJlcGxhY2VdYCBtZXRob2RcbiAgICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1yZWdleHAucHJvdG90eXBlLUBAcmVwbGFjZVxuICAgIGZ1bmN0aW9uIChyZWdleHAsIHJlcGxhY2VWYWx1ZSkge1xuICAgICAgdmFyIHJlcyA9IG1heWJlQ2FsbE5hdGl2ZShuYXRpdmVSZXBsYWNlLCByZWdleHAsIHRoaXMsIHJlcGxhY2VWYWx1ZSk7XG4gICAgICBpZiAocmVzLmRvbmUpIHJldHVybiByZXMudmFsdWU7XG5cbiAgICAgIHZhciByeCA9IGFuT2JqZWN0KHJlZ2V4cCk7XG4gICAgICB2YXIgUyA9IFN0cmluZyh0aGlzKTtcblxuICAgICAgdmFyIGZ1bmN0aW9uYWxSZXBsYWNlID0gdHlwZW9mIHJlcGxhY2VWYWx1ZSA9PT0gJ2Z1bmN0aW9uJztcbiAgICAgIGlmICghZnVuY3Rpb25hbFJlcGxhY2UpIHJlcGxhY2VWYWx1ZSA9IFN0cmluZyhyZXBsYWNlVmFsdWUpO1xuXG4gICAgICB2YXIgZ2xvYmFsID0gcnguZ2xvYmFsO1xuICAgICAgaWYgKGdsb2JhbCkge1xuICAgICAgICB2YXIgZnVsbFVuaWNvZGUgPSByeC51bmljb2RlO1xuICAgICAgICByeC5sYXN0SW5kZXggPSAwO1xuICAgICAgfVxuICAgICAgdmFyIHJlc3VsdHMgPSBbXTtcbiAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSByZWdFeHBFeGVjKHJ4LCBTKTtcbiAgICAgICAgaWYgKHJlc3VsdCA9PT0gbnVsbCkgYnJlYWs7XG5cbiAgICAgICAgcmVzdWx0cy5wdXNoKHJlc3VsdCk7XG4gICAgICAgIGlmICghZ2xvYmFsKSBicmVhaztcblxuICAgICAgICB2YXIgbWF0Y2hTdHIgPSBTdHJpbmcocmVzdWx0WzBdKTtcbiAgICAgICAgaWYgKG1hdGNoU3RyID09PSAnJykgcngubGFzdEluZGV4ID0gYWR2YW5jZVN0cmluZ0luZGV4KFMsIHRvTGVuZ3RoKHJ4Lmxhc3RJbmRleCksIGZ1bGxVbmljb2RlKTtcbiAgICAgIH1cblxuICAgICAgdmFyIGFjY3VtdWxhdGVkUmVzdWx0ID0gJyc7XG4gICAgICB2YXIgbmV4dFNvdXJjZVBvc2l0aW9uID0gMDtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVzdWx0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICByZXN1bHQgPSByZXN1bHRzW2ldO1xuXG4gICAgICAgIHZhciBtYXRjaGVkID0gU3RyaW5nKHJlc3VsdFswXSk7XG4gICAgICAgIHZhciBwb3NpdGlvbiA9IG1heChtaW4odG9JbnRlZ2VyKHJlc3VsdC5pbmRleCksIFMubGVuZ3RoKSwgMCk7XG4gICAgICAgIHZhciBjYXB0dXJlcyA9IFtdO1xuICAgICAgICAvLyBOT1RFOiBUaGlzIGlzIGVxdWl2YWxlbnQgdG9cbiAgICAgICAgLy8gICBjYXB0dXJlcyA9IHJlc3VsdC5zbGljZSgxKS5tYXAobWF5YmVUb1N0cmluZylcbiAgICAgICAgLy8gYnV0IGZvciBzb21lIHJlYXNvbiBgbmF0aXZlU2xpY2UuY2FsbChyZXN1bHQsIDEsIHJlc3VsdC5sZW5ndGgpYCAoY2FsbGVkIGluXG4gICAgICAgIC8vIHRoZSBzbGljZSBwb2x5ZmlsbCB3aGVuIHNsaWNpbmcgbmF0aXZlIGFycmF5cykgXCJkb2Vzbid0IHdvcmtcIiBpbiBzYWZhcmkgOSBhbmRcbiAgICAgICAgLy8gY2F1c2VzIGEgY3Jhc2ggKGh0dHBzOi8vcGFzdGViaW4uY29tL04yMVF6ZVFBKSB3aGVuIHRyeWluZyB0byBkZWJ1ZyBpdC5cbiAgICAgICAgZm9yICh2YXIgaiA9IDE7IGogPCByZXN1bHQubGVuZ3RoOyBqKyspIGNhcHR1cmVzLnB1c2gobWF5YmVUb1N0cmluZyhyZXN1bHRbal0pKTtcbiAgICAgICAgdmFyIG5hbWVkQ2FwdHVyZXMgPSByZXN1bHQuZ3JvdXBzO1xuICAgICAgICBpZiAoZnVuY3Rpb25hbFJlcGxhY2UpIHtcbiAgICAgICAgICB2YXIgcmVwbGFjZXJBcmdzID0gW21hdGNoZWRdLmNvbmNhdChjYXB0dXJlcywgcG9zaXRpb24sIFMpO1xuICAgICAgICAgIGlmIChuYW1lZENhcHR1cmVzICE9PSB1bmRlZmluZWQpIHJlcGxhY2VyQXJncy5wdXNoKG5hbWVkQ2FwdHVyZXMpO1xuICAgICAgICAgIHZhciByZXBsYWNlbWVudCA9IFN0cmluZyhyZXBsYWNlVmFsdWUuYXBwbHkodW5kZWZpbmVkLCByZXBsYWNlckFyZ3MpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXBsYWNlbWVudCA9IGdldFN1YnN0aXR1dGlvbihtYXRjaGVkLCBTLCBwb3NpdGlvbiwgY2FwdHVyZXMsIG5hbWVkQ2FwdHVyZXMsIHJlcGxhY2VWYWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBvc2l0aW9uID49IG5leHRTb3VyY2VQb3NpdGlvbikge1xuICAgICAgICAgIGFjY3VtdWxhdGVkUmVzdWx0ICs9IFMuc2xpY2UobmV4dFNvdXJjZVBvc2l0aW9uLCBwb3NpdGlvbikgKyByZXBsYWNlbWVudDtcbiAgICAgICAgICBuZXh0U291cmNlUG9zaXRpb24gPSBwb3NpdGlvbiArIG1hdGNoZWQubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gYWNjdW11bGF0ZWRSZXN1bHQgKyBTLnNsaWNlKG5leHRTb3VyY2VQb3NpdGlvbik7XG4gICAgfVxuICBdO1xuXG4gIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLWdldHN1YnN0aXR1dGlvblxuICBmdW5jdGlvbiBnZXRTdWJzdGl0dXRpb24obWF0Y2hlZCwgc3RyLCBwb3NpdGlvbiwgY2FwdHVyZXMsIG5hbWVkQ2FwdHVyZXMsIHJlcGxhY2VtZW50KSB7XG4gICAgdmFyIHRhaWxQb3MgPSBwb3NpdGlvbiArIG1hdGNoZWQubGVuZ3RoO1xuICAgIHZhciBtID0gY2FwdHVyZXMubGVuZ3RoO1xuICAgIHZhciBzeW1ib2xzID0gU1VCU1RJVFVUSU9OX1NZTUJPTFNfTk9fTkFNRUQ7XG4gICAgaWYgKG5hbWVkQ2FwdHVyZXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgbmFtZWRDYXB0dXJlcyA9IHRvT2JqZWN0KG5hbWVkQ2FwdHVyZXMpO1xuICAgICAgc3ltYm9scyA9IFNVQlNUSVRVVElPTl9TWU1CT0xTO1xuICAgIH1cbiAgICByZXR1cm4gbmF0aXZlUmVwbGFjZS5jYWxsKHJlcGxhY2VtZW50LCBzeW1ib2xzLCBmdW5jdGlvbiAobWF0Y2gsIGNoKSB7XG4gICAgICB2YXIgY2FwdHVyZTtcbiAgICAgIHN3aXRjaCAoY2guY2hhckF0KDApKSB7XG4gICAgICAgIGNhc2UgJyQnOiByZXR1cm4gJyQnO1xuICAgICAgICBjYXNlICcmJzogcmV0dXJuIG1hdGNoZWQ7XG4gICAgICAgIGNhc2UgJ2AnOiByZXR1cm4gc3RyLnNsaWNlKDAsIHBvc2l0aW9uKTtcbiAgICAgICAgY2FzZSBcIidcIjogcmV0dXJuIHN0ci5zbGljZSh0YWlsUG9zKTtcbiAgICAgICAgY2FzZSAnPCc6XG4gICAgICAgICAgY2FwdHVyZSA9IG5hbWVkQ2FwdHVyZXNbY2guc2xpY2UoMSwgLTEpXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDogLy8gXFxkXFxkP1xuICAgICAgICAgIHZhciBuID0gK2NoO1xuICAgICAgICAgIGlmIChuID09PSAwKSByZXR1cm4gbWF0Y2g7XG4gICAgICAgICAgaWYgKG4gPiBtKSB7XG4gICAgICAgICAgICB2YXIgZiA9IGZsb29yKG4gLyAxMCk7XG4gICAgICAgICAgICBpZiAoZiA9PT0gMCkgcmV0dXJuIG1hdGNoO1xuICAgICAgICAgICAgaWYgKGYgPD0gbSkgcmV0dXJuIGNhcHR1cmVzW2YgLSAxXSA9PT0gdW5kZWZpbmVkID8gY2guY2hhckF0KDEpIDogY2FwdHVyZXNbZiAtIDFdICsgY2guY2hhckF0KDEpO1xuICAgICAgICAgICAgcmV0dXJuIG1hdGNoO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjYXB0dXJlID0gY2FwdHVyZXNbbiAtIDFdO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNhcHR1cmUgPT09IHVuZGVmaW5lZCA/ICcnIDogY2FwdHVyZTtcbiAgICB9KTtcbiAgfVxufSk7XG4iLCIndXNlIHN0cmljdCc7XG52YXIgZml4UmVnRXhwV2VsbEtub3duU3ltYm9sTG9naWMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZml4LXJlZ2V4cC13ZWxsLWtub3duLXN5bWJvbC1sb2dpYycpO1xudmFyIGlzUmVnRXhwID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2lzLXJlZ2V4cCcpO1xudmFyIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2FuLW9iamVjdCcpO1xudmFyIHJlcXVpcmVPYmplY3RDb2VyY2libGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvcmVxdWlyZS1vYmplY3QtY29lcmNpYmxlJyk7XG52YXIgc3BlY2llc0NvbnN0cnVjdG9yID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3NwZWNpZXMtY29uc3RydWN0b3InKTtcbnZhciBhZHZhbmNlU3RyaW5nSW5kZXggPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvYWR2YW5jZS1zdHJpbmctaW5kZXgnKTtcbnZhciB0b0xlbmd0aCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy90by1sZW5ndGgnKTtcbnZhciBjYWxsUmVnRXhwRXhlYyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9yZWdleHAtZXhlYy1hYnN0cmFjdCcpO1xudmFyIHJlZ2V4cEV4ZWMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvcmVnZXhwLWV4ZWMnKTtcbnZhciBmYWlscyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9mYWlscycpO1xuXG52YXIgYXJyYXlQdXNoID0gW10ucHVzaDtcbnZhciBtaW4gPSBNYXRoLm1pbjtcbnZhciBNQVhfVUlOVDMyID0gMHhGRkZGRkZGRjtcblxuLy8gYmFiZWwtbWluaWZ5IHRyYW5zcGlsZXMgUmVnRXhwKCd4JywgJ3knKSAtPiAveC95IGFuZCBpdCBjYXVzZXMgU3ludGF4RXJyb3JcbnZhciBTVVBQT1JUU19ZID0gIWZhaWxzKGZ1bmN0aW9uICgpIHsgcmV0dXJuICFSZWdFeHAoTUFYX1VJTlQzMiwgJ3knKTsgfSk7XG5cbi8vIEBAc3BsaXQgbG9naWNcbmZpeFJlZ0V4cFdlbGxLbm93blN5bWJvbExvZ2ljKCdzcGxpdCcsIDIsIGZ1bmN0aW9uIChTUExJVCwgbmF0aXZlU3BsaXQsIG1heWJlQ2FsbE5hdGl2ZSkge1xuICB2YXIgaW50ZXJuYWxTcGxpdDtcbiAgaWYgKFxuICAgICdhYmJjJy5zcGxpdCgvKGIpKi8pWzFdID09ICdjJyB8fFxuICAgICd0ZXN0Jy5zcGxpdCgvKD86KS8sIC0xKS5sZW5ndGggIT0gNCB8fFxuICAgICdhYicuc3BsaXQoLyg/OmFiKSovKS5sZW5ndGggIT0gMiB8fFxuICAgICcuJy5zcGxpdCgvKC4/KSguPykvKS5sZW5ndGggIT0gNCB8fFxuICAgICcuJy5zcGxpdCgvKCkoKS8pLmxlbmd0aCA+IDEgfHxcbiAgICAnJy5zcGxpdCgvLj8vKS5sZW5ndGhcbiAgKSB7XG4gICAgLy8gYmFzZWQgb24gZXM1LXNoaW0gaW1wbGVtZW50YXRpb24sIG5lZWQgdG8gcmV3b3JrIGl0XG4gICAgaW50ZXJuYWxTcGxpdCA9IGZ1bmN0aW9uIChzZXBhcmF0b3IsIGxpbWl0KSB7XG4gICAgICB2YXIgc3RyaW5nID0gU3RyaW5nKHJlcXVpcmVPYmplY3RDb2VyY2libGUodGhpcykpO1xuICAgICAgdmFyIGxpbSA9IGxpbWl0ID09PSB1bmRlZmluZWQgPyBNQVhfVUlOVDMyIDogbGltaXQgPj4+IDA7XG4gICAgICBpZiAobGltID09PSAwKSByZXR1cm4gW107XG4gICAgICBpZiAoc2VwYXJhdG9yID09PSB1bmRlZmluZWQpIHJldHVybiBbc3RyaW5nXTtcbiAgICAgIC8vIElmIGBzZXBhcmF0b3JgIGlzIG5vdCBhIHJlZ2V4LCB1c2UgbmF0aXZlIHNwbGl0XG4gICAgICBpZiAoIWlzUmVnRXhwKHNlcGFyYXRvcikpIHtcbiAgICAgICAgcmV0dXJuIG5hdGl2ZVNwbGl0LmNhbGwoc3RyaW5nLCBzZXBhcmF0b3IsIGxpbSk7XG4gICAgICB9XG4gICAgICB2YXIgb3V0cHV0ID0gW107XG4gICAgICB2YXIgZmxhZ3MgPSAoc2VwYXJhdG9yLmlnbm9yZUNhc2UgPyAnaScgOiAnJykgK1xuICAgICAgICAgICAgICAgICAgKHNlcGFyYXRvci5tdWx0aWxpbmUgPyAnbScgOiAnJykgK1xuICAgICAgICAgICAgICAgICAgKHNlcGFyYXRvci51bmljb2RlID8gJ3UnIDogJycpICtcbiAgICAgICAgICAgICAgICAgIChzZXBhcmF0b3Iuc3RpY2t5ID8gJ3knIDogJycpO1xuICAgICAgdmFyIGxhc3RMYXN0SW5kZXggPSAwO1xuICAgICAgLy8gTWFrZSBgZ2xvYmFsYCBhbmQgYXZvaWQgYGxhc3RJbmRleGAgaXNzdWVzIGJ5IHdvcmtpbmcgd2l0aCBhIGNvcHlcbiAgICAgIHZhciBzZXBhcmF0b3JDb3B5ID0gbmV3IFJlZ0V4cChzZXBhcmF0b3Iuc291cmNlLCBmbGFncyArICdnJyk7XG4gICAgICB2YXIgbWF0Y2gsIGxhc3RJbmRleCwgbGFzdExlbmd0aDtcbiAgICAgIHdoaWxlIChtYXRjaCA9IHJlZ2V4cEV4ZWMuY2FsbChzZXBhcmF0b3JDb3B5LCBzdHJpbmcpKSB7XG4gICAgICAgIGxhc3RJbmRleCA9IHNlcGFyYXRvckNvcHkubGFzdEluZGV4O1xuICAgICAgICBpZiAobGFzdEluZGV4ID4gbGFzdExhc3RJbmRleCkge1xuICAgICAgICAgIG91dHB1dC5wdXNoKHN0cmluZy5zbGljZShsYXN0TGFzdEluZGV4LCBtYXRjaC5pbmRleCkpO1xuICAgICAgICAgIGlmIChtYXRjaC5sZW5ndGggPiAxICYmIG1hdGNoLmluZGV4IDwgc3RyaW5nLmxlbmd0aCkgYXJyYXlQdXNoLmFwcGx5KG91dHB1dCwgbWF0Y2guc2xpY2UoMSkpO1xuICAgICAgICAgIGxhc3RMZW5ndGggPSBtYXRjaFswXS5sZW5ndGg7XG4gICAgICAgICAgbGFzdExhc3RJbmRleCA9IGxhc3RJbmRleDtcbiAgICAgICAgICBpZiAob3V0cHV0Lmxlbmd0aCA+PSBsaW0pIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzZXBhcmF0b3JDb3B5Lmxhc3RJbmRleCA9PT0gbWF0Y2guaW5kZXgpIHNlcGFyYXRvckNvcHkubGFzdEluZGV4Kys7IC8vIEF2b2lkIGFuIGluZmluaXRlIGxvb3BcbiAgICAgIH1cbiAgICAgIGlmIChsYXN0TGFzdEluZGV4ID09PSBzdHJpbmcubGVuZ3RoKSB7XG4gICAgICAgIGlmIChsYXN0TGVuZ3RoIHx8ICFzZXBhcmF0b3JDb3B5LnRlc3QoJycpKSBvdXRwdXQucHVzaCgnJyk7XG4gICAgICB9IGVsc2Ugb3V0cHV0LnB1c2goc3RyaW5nLnNsaWNlKGxhc3RMYXN0SW5kZXgpKTtcbiAgICAgIHJldHVybiBvdXRwdXQubGVuZ3RoID4gbGltID8gb3V0cHV0LnNsaWNlKDAsIGxpbSkgOiBvdXRwdXQ7XG4gICAgfTtcbiAgLy8gQ2hha3JhLCBWOFxuICB9IGVsc2UgaWYgKCcwJy5zcGxpdCh1bmRlZmluZWQsIDApLmxlbmd0aCkge1xuICAgIGludGVybmFsU3BsaXQgPSBmdW5jdGlvbiAoc2VwYXJhdG9yLCBsaW1pdCkge1xuICAgICAgcmV0dXJuIHNlcGFyYXRvciA9PT0gdW5kZWZpbmVkICYmIGxpbWl0ID09PSAwID8gW10gOiBuYXRpdmVTcGxpdC5jYWxsKHRoaXMsIHNlcGFyYXRvciwgbGltaXQpO1xuICAgIH07XG4gIH0gZWxzZSBpbnRlcm5hbFNwbGl0ID0gbmF0aXZlU3BsaXQ7XG5cbiAgcmV0dXJuIFtcbiAgICAvLyBgU3RyaW5nLnByb3RvdHlwZS5zcGxpdGAgbWV0aG9kXG4gICAgLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtc3RyaW5nLnByb3RvdHlwZS5zcGxpdFxuICAgIGZ1bmN0aW9uIHNwbGl0KHNlcGFyYXRvciwgbGltaXQpIHtcbiAgICAgIHZhciBPID0gcmVxdWlyZU9iamVjdENvZXJjaWJsZSh0aGlzKTtcbiAgICAgIHZhciBzcGxpdHRlciA9IHNlcGFyYXRvciA9PSB1bmRlZmluZWQgPyB1bmRlZmluZWQgOiBzZXBhcmF0b3JbU1BMSVRdO1xuICAgICAgcmV0dXJuIHNwbGl0dGVyICE9PSB1bmRlZmluZWRcbiAgICAgICAgPyBzcGxpdHRlci5jYWxsKHNlcGFyYXRvciwgTywgbGltaXQpXG4gICAgICAgIDogaW50ZXJuYWxTcGxpdC5jYWxsKFN0cmluZyhPKSwgc2VwYXJhdG9yLCBsaW1pdCk7XG4gICAgfSxcbiAgICAvLyBgUmVnRXhwLnByb3RvdHlwZVtAQHNwbGl0XWAgbWV0aG9kXG4gICAgLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtcmVnZXhwLnByb3RvdHlwZS1AQHNwbGl0XG4gICAgLy9cbiAgICAvLyBOT1RFOiBUaGlzIGNhbm5vdCBiZSBwcm9wZXJseSBwb2x5ZmlsbGVkIGluIGVuZ2luZXMgdGhhdCBkb24ndCBzdXBwb3J0XG4gICAgLy8gdGhlICd5JyBmbGFnLlxuICAgIGZ1bmN0aW9uIChyZWdleHAsIGxpbWl0KSB7XG4gICAgICB2YXIgcmVzID0gbWF5YmVDYWxsTmF0aXZlKGludGVybmFsU3BsaXQsIHJlZ2V4cCwgdGhpcywgbGltaXQsIGludGVybmFsU3BsaXQgIT09IG5hdGl2ZVNwbGl0KTtcbiAgICAgIGlmIChyZXMuZG9uZSkgcmV0dXJuIHJlcy52YWx1ZTtcblxuICAgICAgdmFyIHJ4ID0gYW5PYmplY3QocmVnZXhwKTtcbiAgICAgIHZhciBTID0gU3RyaW5nKHRoaXMpO1xuICAgICAgdmFyIEMgPSBzcGVjaWVzQ29uc3RydWN0b3IocngsIFJlZ0V4cCk7XG5cbiAgICAgIHZhciB1bmljb2RlTWF0Y2hpbmcgPSByeC51bmljb2RlO1xuICAgICAgdmFyIGZsYWdzID0gKHJ4Lmlnbm9yZUNhc2UgPyAnaScgOiAnJykgK1xuICAgICAgICAgICAgICAgICAgKHJ4Lm11bHRpbGluZSA/ICdtJyA6ICcnKSArXG4gICAgICAgICAgICAgICAgICAocngudW5pY29kZSA/ICd1JyA6ICcnKSArXG4gICAgICAgICAgICAgICAgICAoU1VQUE9SVFNfWSA/ICd5JyA6ICdnJyk7XG5cbiAgICAgIC8vIF4oPyArIHJ4ICsgKSBpcyBuZWVkZWQsIGluIGNvbWJpbmF0aW9uIHdpdGggc29tZSBTIHNsaWNpbmcsIHRvXG4gICAgICAvLyBzaW11bGF0ZSB0aGUgJ3knIGZsYWcuXG4gICAgICB2YXIgc3BsaXR0ZXIgPSBuZXcgQyhTVVBQT1JUU19ZID8gcnggOiAnXig/OicgKyByeC5zb3VyY2UgKyAnKScsIGZsYWdzKTtcbiAgICAgIHZhciBsaW0gPSBsaW1pdCA9PT0gdW5kZWZpbmVkID8gTUFYX1VJTlQzMiA6IGxpbWl0ID4+PiAwO1xuICAgICAgaWYgKGxpbSA9PT0gMCkgcmV0dXJuIFtdO1xuICAgICAgaWYgKFMubGVuZ3RoID09PSAwKSByZXR1cm4gY2FsbFJlZ0V4cEV4ZWMoc3BsaXR0ZXIsIFMpID09PSBudWxsID8gW1NdIDogW107XG4gICAgICB2YXIgcCA9IDA7XG4gICAgICB2YXIgcSA9IDA7XG4gICAgICB2YXIgQSA9IFtdO1xuICAgICAgd2hpbGUgKHEgPCBTLmxlbmd0aCkge1xuICAgICAgICBzcGxpdHRlci5sYXN0SW5kZXggPSBTVVBQT1JUU19ZID8gcSA6IDA7XG4gICAgICAgIHZhciB6ID0gY2FsbFJlZ0V4cEV4ZWMoc3BsaXR0ZXIsIFNVUFBPUlRTX1kgPyBTIDogUy5zbGljZShxKSk7XG4gICAgICAgIHZhciBlO1xuICAgICAgICBpZiAoXG4gICAgICAgICAgeiA9PT0gbnVsbCB8fFxuICAgICAgICAgIChlID0gbWluKHRvTGVuZ3RoKHNwbGl0dGVyLmxhc3RJbmRleCArIChTVVBQT1JUU19ZID8gMCA6IHEpKSwgUy5sZW5ndGgpKSA9PT0gcFxuICAgICAgICApIHtcbiAgICAgICAgICBxID0gYWR2YW5jZVN0cmluZ0luZGV4KFMsIHEsIHVuaWNvZGVNYXRjaGluZyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgQS5wdXNoKFMuc2xpY2UocCwgcSkpO1xuICAgICAgICAgIGlmIChBLmxlbmd0aCA9PT0gbGltKSByZXR1cm4gQTtcbiAgICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8PSB6Lmxlbmd0aCAtIDE7IGkrKykge1xuICAgICAgICAgICAgQS5wdXNoKHpbaV0pO1xuICAgICAgICAgICAgaWYgKEEubGVuZ3RoID09PSBsaW0pIHJldHVybiBBO1xuICAgICAgICAgIH1cbiAgICAgICAgICBxID0gcCA9IGU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIEEucHVzaChTLnNsaWNlKHApKTtcbiAgICAgIHJldHVybiBBO1xuICAgIH1cbiAgXTtcbn0sICFTVVBQT1JUU19ZKTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciAkID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2V4cG9ydCcpO1xudmFyIHRvTGVuZ3RoID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3RvLWxlbmd0aCcpO1xudmFyIHZhbGlkYXRlQXJndW1lbnRzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3ZhbGlkYXRlLXN0cmluZy1tZXRob2QtYXJndW1lbnRzJyk7XG52YXIgY29ycmVjdElzUmVnRXhwTG9naWMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvY29ycmVjdC1pcy1yZWdleHAtbG9naWMnKTtcblxudmFyIFNUQVJUU19XSVRIID0gJ3N0YXJ0c1dpdGgnO1xudmFyIG5hdGl2ZVN0YXJ0c1dpdGggPSAnJ1tTVEFSVFNfV0lUSF07XG5cbi8vIGBTdHJpbmcucHJvdG90eXBlLnN0YXJ0c1dpdGhgIG1ldGhvZFxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtc3RyaW5nLnByb3RvdHlwZS5zdGFydHN3aXRoXG4kKHsgdGFyZ2V0OiAnU3RyaW5nJywgcHJvdG86IHRydWUsIGZvcmNlZDogIWNvcnJlY3RJc1JlZ0V4cExvZ2ljKFNUQVJUU19XSVRIKSB9LCB7XG4gIHN0YXJ0c1dpdGg6IGZ1bmN0aW9uIHN0YXJ0c1dpdGgoc2VhcmNoU3RyaW5nIC8qICwgcG9zaXRpb24gPSAwICovKSB7XG4gICAgdmFyIHRoYXQgPSB2YWxpZGF0ZUFyZ3VtZW50cyh0aGlzLCBzZWFyY2hTdHJpbmcsIFNUQVJUU19XSVRIKTtcbiAgICB2YXIgaW5kZXggPSB0b0xlbmd0aChNYXRoLm1pbihhcmd1bWVudHMubGVuZ3RoID4gMSA/IGFyZ3VtZW50c1sxXSA6IHVuZGVmaW5lZCwgdGhhdC5sZW5ndGgpKTtcbiAgICB2YXIgc2VhcmNoID0gU3RyaW5nKHNlYXJjaFN0cmluZyk7XG4gICAgcmV0dXJuIG5hdGl2ZVN0YXJ0c1dpdGhcbiAgICAgID8gbmF0aXZlU3RhcnRzV2l0aC5jYWxsKHRoYXQsIHNlYXJjaCwgaW5kZXgpXG4gICAgICA6IHRoYXQuc2xpY2UoaW5kZXgsIGluZGV4ICsgc2VhcmNoLmxlbmd0aCkgPT09IHNlYXJjaDtcbiAgfVxufSk7XG4iLCIndXNlIHN0cmljdCc7XG52YXIgJCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9leHBvcnQnKTtcbnZhciBpbnRlcm5hbFN0cmluZ1RyaW0gPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvc3RyaW5nLXRyaW0nKTtcbnZhciBmb3JjZWRTdHJpbmdUcmltTWV0aG9kID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2ZvcmNlZC1zdHJpbmctdHJpbS1tZXRob2QnKTtcblxudmFyIEZPUkNFRCA9IGZvcmNlZFN0cmluZ1RyaW1NZXRob2QoJ3RyaW0nKTtcblxuLy8gYFN0cmluZy5wcm90b3R5cGUudHJpbWAgbWV0aG9kXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1zdHJpbmcucHJvdG90eXBlLnRyaW1cbiQoeyB0YXJnZXQ6ICdTdHJpbmcnLCBwcm90bzogdHJ1ZSwgZm9yY2VkOiBGT1JDRUQgfSwge1xuICB0cmltOiBmdW5jdGlvbiB0cmltKCkge1xuICAgIHJldHVybiBpbnRlcm5hbFN0cmluZ1RyaW0odGhpcywgMyk7XG4gIH1cbn0pO1xuIiwidmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9nbG9iYWwnKTtcbnZhciBET01JdGVyYWJsZXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZG9tLWl0ZXJhYmxlcycpO1xudmFyIGZvckVhY2ggPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvYXJyYXktZm9yLWVhY2gnKTtcbnZhciBoaWRlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2hpZGUnKTtcblxuZm9yICh2YXIgQ09MTEVDVElPTl9OQU1FIGluIERPTUl0ZXJhYmxlcykge1xuICB2YXIgQ29sbGVjdGlvbiA9IGdsb2JhbFtDT0xMRUNUSU9OX05BTUVdO1xuICB2YXIgQ29sbGVjdGlvblByb3RvdHlwZSA9IENvbGxlY3Rpb24gJiYgQ29sbGVjdGlvbi5wcm90b3R5cGU7XG4gIC8vIHNvbWUgQ2hyb21lIHZlcnNpb25zIGhhdmUgbm9uLWNvbmZpZ3VyYWJsZSBtZXRob2RzIG9uIERPTVRva2VuTGlzdFxuICBpZiAoQ29sbGVjdGlvblByb3RvdHlwZSAmJiBDb2xsZWN0aW9uUHJvdG90eXBlLmZvckVhY2ggIT09IGZvckVhY2gpIHRyeSB7XG4gICAgaGlkZShDb2xsZWN0aW9uUHJvdG90eXBlLCAnZm9yRWFjaCcsIGZvckVhY2gpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIENvbGxlY3Rpb25Qcm90b3R5cGUuZm9yRWFjaCA9IGZvckVhY2g7XG4gIH1cbn1cbiIsImltcG9ydCB0cmF2ZXJzZSBmcm9tIFwiLi9kb20vVHJhdmVyc2VcIjtcbmltcG9ydCBvYnNlcnZlIGZyb20gXCIuL2RhdGEvT2JzZXJ2ZVwiO1xuaW1wb3J0IHsgcG9zc2libGVFdmVudExpc3QgfSBmcm9tIFwiLi9ldGMvRWxlbWVudEV2ZW50c1wiO1xuaW1wb3J0IGRpZmYgZnJvbSBcIi4vdmRvbS9EaWZmXCI7XG5pbXBvcnQgaHlkcmF0ZSBmcm9tIFwiLi92ZG9tL0h5ZHJhdGVcIjtcblxudHlwZSBmdW5jUHJvcCA9IHsgW2tleTogc3RyaW5nXTogRnVuY3Rpb24gfTtcblxuaW50ZXJmYWNlIFBvbGFyYmVhclBhcmFtcyB7XG4gIGNyZWF0ZWQ/OiBGdW5jdGlvbjsgLy8gSW5zdGFuY2UgY3JlYXRlZCBsaWZlY3ljbGUgaG9va1xuICBkYXRhPzogeyBba2V5OiBzdHJpbmddOiBhbnkgfTsgLy8gSW5zdGFuY2UgZGF0YSBwcm9wZXJ0aWVzXG4gIGVsPzogc3RyaW5nOyAvLyBBcHAgY29udGFpbmVyIGVsZW1lbnQgc2VsZWN0b3JcbiAgZXZlbnRzPzogZnVuY1Byb3A7IC8vIEdsb2JhbCBkb2N1bWVudCBldmVudHNcbiAgZmlsdGVycz86IGZ1bmNQcm9wOyAvLyBDb250ZW50IGludGVycG9sYXRpb24gZmlsdGVyc1xuICBtZXRob2RzPzogZnVuY1Byb3A7IC8vIEluc3RhbmNlIG1ldGhvZHNcbiAgbW91bnRlZD86IEZ1bmN0aW9uOyAvLyBJbnN0YW5jZSBtb3VudGVkIGxpZmVjeWNsZSBob29rXG4gIHdhdGNoPzogZnVuY1Byb3A7IC8vIFByb3BlcnR5IHdhdGNoZXJzXG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBvbGFyYmVhciB7XG4gIC8vIFJvb3QgYXBwIGNvbnRhaW5lciBzZWxlY3RvclxuICAkYXBwQ29udGFpbmVyU2VsOiBzdHJpbmc7XG5cbiAgLy8gUm9vdCBhcHAgY29udGFpbmVyIGVsZW1lbnRcbiAgJGFwcENvbnRhaW5lckVsOiBIVE1MRWxlbWVudDtcblxuICAvLyBWaXJ0dWFsIGRvbVxuICAkbWFzdGVyVkRvbTogYW55ID0ge307XG4gICRjdXJyZW50VkRvbTogYW55ID0ge307XG5cbiAgLy8gUmVmZXJlbmNlcyB0byBkb2N1bWVudCBlbGVtZW50cyB0aGF0IGFyZSB1c2VkIGZvciBlZGdlIGNhc2VzXG4gICRyZWZzOiB7IFtrZXk6IHN0cmluZ106IEVsZW1lbnQgfSA9IHt9O1xuXG4gIC8vIEZpbHRlciBmdW5jdGlvbnMgZm9yIHVzZSB3aXRoIGludGVycG9sYXRpb24gZWxlbWVudHNcbiAgJGZpbHRlcnM6IGZ1bmNQcm9wID0ge307XG5cbiAgLy8gRGF0YSBwcm9wZXJ0aWVzIGZvciBpbnN0YW5jZVxuICAkZGF0YTogeyBba2V5OiBzdHJpbmddOiBhbnkgfSA9IHt9O1xuXG4gIC8vIFByb3BlcnR5IHdhdGNoZXJzIGZvciBjYWxsaW5nIGZ1bmN0aW9ucyBvbiBwcm9wZXJ0eSBjaGFuZ2VzXG4gICR3YXRjaGVyczogeyBba2V5OiBzdHJpbmddOiBGdW5jdGlvbiB9ID0ge307XG5cbiAgLy8gQWxsb3dzIGZvciBvdGhlciBpbnN0YW5jZSBwcm9wZXJ0aWVzIHRvIGJlIGNyZWF0ZWRcbiAgW2tleTogc3RyaW5nXTogYW55O1xuXG4gIGNvbnN0cnVjdG9yKHBhcmFtczogUG9sYXJiZWFyUGFyYW1zKSB7XG4gICAgLy8gQ2FsbCBjcmVhdGVkIG1ldGhvZCBpZiBpdCBleGlzdHNcbiAgICAvLyBJbnN0YW5jZSBoYXMganVzdCBiZWVuIGNyZWF0ZWQuIE5vdGhpbmcgZWxzZSBoYXMgaGFwcGVuZWQgeWV0XG4gICAgaWYgKHBhcmFtcy5jcmVhdGVkKSBwYXJhbXMuY3JlYXRlZCgpO1xuXG4gICAgLy8gR2V0IGFwcCBjb250YWluZXIgc2VsZWN0b3Igc28gdGhhdCBpdCBtYXkgYmUgY29udGludW91cyByZWZlcmVuY2VkIGZvciBtb3VudGluZ1xuICAgIHRoaXMuJGFwcENvbnRhaW5lclNlbCA9IHBhcmFtcy5lbDtcblxuICAgIC8vIEdyYWIgcm9vdCBhcHAgZWxlbWVudFxuICAgIHRoaXMuJGFwcENvbnRhaW5lckVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLiRhcHBDb250YWluZXJTZWwpO1xuICAgIGlmICghdGhpcy4kYXBwQ29udGFpbmVyRWwpIGNvbnNvbGUuZXJyb3IoYE5vIGFwcCBjb250YWluZXIgZm91bmQuYCk7XG5cbiAgICAvLyBDcmVhdGUgb2JzZXJ2YWJsZXMgZm9yIGFsbCBvZiB0aGUgZGF0YSBhdHRyaWJ1dGVzXG4gICAgb2JzZXJ2ZSh0aGlzLCBwYXJhbXMuZGF0YSk7XG5cbiAgICAvLyBNaWdyYXRlIG1ldGhvZHMgdG8gcm9vdCBsZXZlbCBvZiBpbnN0YW5jZSBzbyB0aGF0IHRoZXkgbWF5IGJlIGVhc2lseSB1c2VkXG4gICAgaWYgKHBhcmFtcy5tZXRob2RzKSB7XG4gICAgICBmb3IgKGNvbnN0IG1ldGhvZCBpbiBwYXJhbXMubWV0aG9kcykge1xuICAgICAgICBpZiAocGFyYW1zLm1ldGhvZHMuaGFzT3duUHJvcGVydHkobWV0aG9kKSkge1xuICAgICAgICAgIC8vIFJlbWFwIGNyZWF0ZWQgbWV0aG9kcyB0byByb290IGxldmVsXG4gICAgICAgICAgdGhpc1ttZXRob2RdID0gcGFyYW1zLm1ldGhvZHNbbWV0aG9kXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFRyYXZlcnNlIGFwcCBET00gYW5kIGNvcHkgaW50byBWRE9NXG4gICAgdGhpcy4kbWFzdGVyVkRvbSA9IHRyYXZlcnNlKHRoaXMsIHRoaXMuJGFwcENvbnRhaW5lckVsKTtcbiAgICB0aGlzLiRjdXJyZW50VkRvbSA9IHt9O1xuXG4gICAgLy8gSW5pdGlhbGl6ZSBhbGwgZG9jdW1lbnQgbGV2ZWwgZXZlbnRzIGlmIHRoZXkgZXhpc3RcbiAgICBpZiAocGFyYW1zLmV2ZW50cykge1xuICAgICAgZm9yIChjb25zdCBldmVudCBpbiBwYXJhbXMuZXZlbnRzKSB7XG4gICAgICAgIGlmIChwYXJhbXMuZXZlbnRzLmhhc093blByb3BlcnR5KGV2ZW50KSAmJiBwb3NzaWJsZUV2ZW50TGlzdC5pbmNsdWRlcyhldmVudCkpIHtcbiAgICAgICAgICAvLyBBZGQgZG9jdW1lbnQgbGV2ZWwgZXZlbnQgY2FsbGJhY2tzIGZvciBjaG9zZW4gZXZlbnRzXG4gICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgKGU6IEV2ZW50KSA9PiBwYXJhbXMuZXZlbnRzW2V2ZW50XShlKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihgVW5rbm93biBldmVudCBuYW1lOiAnJHtldmVudH0nLmApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQ29weSBvdmVyIGZpbHRlciBmdW5jdGlvbnMgaW50byBpbnN0YW5jZVxuICAgIGlmIChwYXJhbXMuZmlsdGVycykge1xuICAgICAgZm9yIChjb25zdCBmaWx0ZXIgaW4gcGFyYW1zLmZpbHRlcnMpIHtcbiAgICAgICAgaWYgKHBhcmFtcy5maWx0ZXJzLmhhc093blByb3BlcnR5KGZpbHRlcikpIHtcbiAgICAgICAgICAvLyBDb3B5IGZpbHRlciB0byB0aGUgaW5zdGFuY2VcbiAgICAgICAgICB0aGlzLiRmaWx0ZXJzW2ZpbHRlcl0gPSBwYXJhbXMuZmlsdGVyc1tmaWx0ZXJdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gUGVyZm9ybSBpbml0aWFsIHJlbmRlclxuICAgIHRoaXMucmVuZGVyKCk7XG5cbiAgICAvLyBJbml0aWFsaXplIHByb3BlcnR5IHdhdGNoZXJzXG4gICAgaWYgKHBhcmFtcy53YXRjaCkge1xuICAgICAgZm9yIChjb25zdCBwcm9wIGluIHBhcmFtcy53YXRjaCkge1xuICAgICAgICBpZiAocGFyYW1zLndhdGNoLmhhc093blByb3BlcnR5KHByb3ApKSB7XG4gICAgICAgICAgLy8gQ29weSB0aGUgd2F0Y2hlcidzIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIHRoZSBpbnN0YW5jZVxuICAgICAgICAgIHRoaXMuJHdhdGNoZXJzW3Byb3BdID0gcGFyYW1zLndhdGNoW3Byb3BdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQ2FsbCBtb3VudGVkIG1ldGhvZCBpZiBpdCBleGlzdHNcbiAgICAvLyBJbnN0YW5jZSBoYXMgZmluaXNoZWQgZ2VuZXJhdGlvblxuICAgIGlmIChwYXJhbXMubW91bnRlZCkgcGFyYW1zLm1vdW50ZWQuY2FsbCh0aGlzKTtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCB0ZW1wID0gaHlkcmF0ZSh0aGlzLCB0aGlzLiRtYXN0ZXJWRG9tKTtcbiAgICBjb25zdCBwYXRjaCA9IGRpZmYodGhpcywgdGhpcy4kY3VycmVudFZEb20sIHRlbXApO1xuICAgIHRoaXMuJGFwcENvbnRhaW5lckVsID0gcGF0Y2godGhpcy4kYXBwQ29udGFpbmVyRWwpO1xuICAgIHRoaXMuJGN1cnJlbnRWRG9tID0gdGVtcDtcbiAgfVxufVxuXG4od2luZG93IGFzIGFueSkuUG9sYXJiZWFyID0gUG9sYXJiZWFyO1xuIiwiaW1wb3J0IFBvbGFyYmVhciBmcm9tIFwiLi4vUG9sYXJiZWFyXCI7XG5pbXBvcnQgeyBzZXRQcm9wIH0gZnJvbSBcIi4uL2RhdGEvRGF0YUZuc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjb21wdXRlQmluZGluZyhpbnN0YW5jZTogUG9sYXJiZWFyLCBwcm9wOiBzdHJpbmcsIG1vZGlmaWVyczogc3RyaW5nW10pIHtcbiAgLy8gRGVjaWRlIHdoZXRoZXIgdG8gYmluZCB0aGUgdmFsdWUgb24gdGhlIGVsZW1lbnQncyBpbnB1dCBvciBjaGFuZ2UgZXZlbnRcbiAgbGV0IGV2ZW50TmFtZTogc3RyaW5nID0gXCJpbnB1dFwiO1xuICBpZiAobW9kaWZpZXJzLmluY2x1ZGVzKFwibGF6eVwiKSkgZXZlbnROYW1lID0gXCJjaGFuZ2VcIjtcblxuICAvLyBEZWNpZGUgd2hldGhlciB0byByZXR1cm4gdGhlIGVsZW1lbnQncyB2YWx1ZSBhcyBhIG51bWJlclxuICBsZXQgcmV0dXJuQXNOdW1iZXI6IGJvb2xlYW4gPSBmYWxzZTtcbiAgaWYgKG1vZGlmaWVycy5pbmNsdWRlcyhcIm51bWJlclwiKSkgcmV0dXJuQXNOdW1iZXIgPSB0cnVlO1xuXG4gIC8vIERlY2lkZSB3aGV0aGVyIHRvIHRyaW0gdGhlIGVsZW1lbnQncyB2YWx1ZVxuICBsZXQgdHJpbVJldHVyblZhbHVlOiBib29sZWFuID0gZmFsc2U7XG4gIGlmIChtb2RpZmllcnMuaW5jbHVkZXMoXCJ0cmltXCIpKSB0cmltUmV0dXJuVmFsdWUgPSB0cnVlO1xuXG4gIC8vIFJldHVybiBnZW5lcmF0ZWQgZXZlbnRcbiAgcmV0dXJuIHtcbiAgICBldmVudE5hbWUsXG4gICAgZm46IChlOiBFdmVudCkgPT4ge1xuICAgICAgLy8gUmV0cmlldmUgZWxlbWVudCB2YWx1ZSBmcm9tIGV2ZW50J3MgdGFyZ2V0IGVsZW1lbnRcbiAgICAgIGxldCBlbGVtZW50VmFsdWU6IGFueSA9IChlLnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50KS52YWx1ZTtcblxuICAgICAgLy8gUGFyc2UgdmFsdWUgdG8gbnVtYmVyIGlmIHRoZSBiaW5kdmFsIGhhcyAnbnVtYmVyJyBmbGFnXG4gICAgICBlbGVtZW50VmFsdWUgPSByZXR1cm5Bc051bWJlciA/IGlzTmFOKHBhcnNlRmxvYXQoZWxlbWVudFZhbHVlKSkgPyBlbGVtZW50VmFsdWUgOiBwYXJzZUZsb2F0KGVsZW1lbnRWYWx1ZSkgOiBlbGVtZW50VmFsdWU7XG5cbiAgICAgIC8vIFRyaW0gc3RyaW5nIGlmIHRoZSBiaW5kdmFsIGhhcyAndHJpbScgZmxhZ1xuICAgICAgZWxlbWVudFZhbHVlID0gdHJpbVJldHVyblZhbHVlID8gZWxlbWVudFZhbHVlLnRyaW0oKSA6IGVsZW1lbnRWYWx1ZTtcblxuICAgICAgLy8gVXBkYXRlIHRoZSBwcm9wZXJ0eSBvbiB0aGUgaW5zdGFuY2VcbiAgICAgIHNldFByb3AoaW5zdGFuY2UsIHByb3AsIGVsZW1lbnRWYWx1ZSk7XG4gICAgfVxuICB9O1xufVxuIiwiaW1wb3J0IFBvbGFyYmVhciBmcm9tIFwiLi4vUG9sYXJiZWFyXCI7XG5pbXBvcnQgeyBrZXlDb2RlcyB9IGZyb20gXCIuLi9ldGMvS2V5Q29kZXNcIjtcbmltcG9ydCB7IHBvc3NpYmxlRXZlbnRMaXN0IH0gZnJvbSBcIi4uL2V0Yy9FbGVtZW50RXZlbnRzXCI7XG5pbXBvcnQgeyBwYXJzZSB9IGZyb20gXCIuLi9wYXJzZXIvQ29kZVBhcnNlclwiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjb21wdXRlRXZlbnQoaW5zdGFuY2U6IFBvbGFyYmVhciwgZXZlbnQ6IHN0cmluZywgY2FsbGJhY2tGbjogc3RyaW5nKTogYW55IHtcbiAgLy8gU3BsaXQgcmF3IGV2ZW50IGludG8gaXRzIG5hbWUgYW5kIHBvc3NpYmxlIG1vZGlmaWVyc1xuICBjb25zdCBldmVudENvbXBvbmVudHM6IHN0cmluZ1tdID0gZXZlbnQuc3BsaXQoXCIuXCIpO1xuXG4gIGNvbnN0IGV2ZW50TmFtZTogc3RyaW5nID0gZXZlbnRDb21wb25lbnRzWzBdO1xuICBjb25zdCBldmVudE1vZGlmaWVyczogc3RyaW5nW10gPSBldmVudENvbXBvbmVudHMuc3BsaWNlKDEpO1xuXG4gIC8vIENoZWNrIGZvciB2YWxpZCBldmVudCBuYW1lIGJlZm9yZSBhdHRlbXB0aW5nIHRvIGFkZCBpdCB0byBhbiBlbGVtZW50XG4gIGlmICghcG9zc2libGVFdmVudExpc3QuaW5jbHVkZXMoZXZlbnROYW1lKSkge1xuICAgIGNvbnNvbGUuZXJyb3IoYFVua25vd24gZXZlbnQgbmFtZTogJyR7ZXZlbnROYW1lfScuYCk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gR2V0IGxpc3Qgb2YgY29tbW9uIGtleXMgdGhhdCB3ZSB3YW50IHRvIHJlZmVyZW5jZSBieSBuYW1lIGluc3RlYWQgb2Yga2V5Y29kZXNcbiAgY29uc3QgY29tbW9uS2V5Q29kZU5hbWVzOiBzdHJpbmdbXSA9IE9iamVjdC5rZXlzKGtleUNvZGVzKTtcblxuICAvLyBHZXQgdGhlIGxpc3Qgb2Ygb3RoZXIgZXZlbnQgbW9kaWZpZXJzIHRoYXQgd2Ugd2FudCB0byBjaGVjayBmb3JcbiAgY29uc3Qgb3RoZXJFdmVudE1vZGlmaWVyczogeyBba2V5OiBzdHJpbmddOiBib29sZWFuIH0gPSB7XG4gICAgXCJjYXB0dXJlXCI6IGZhbHNlLFxuICAgIFwicGFzc2l2ZVwiOiBmYWxzZSxcbiAgICBcInByZXZlbnRcIjogZmFsc2UsXG4gICAgXCJvbmNlXCI6IGZhbHNlXG4gIH07XG5cbiAgLy8gTGlzdCBvZiBjb25kaXRpb25hbCBldmFsdWF0aW9ucyB0aGF0IHdpbGwgYmUgam9pbmVkIHRvZ2V0aGVyIHRvIGNoZWNrIHdpdGhpbiB0aGUgZXZlbnQgY2FsbGJhY2tcbiAgbGV0IGNvbmRpdGlvbmFsQ2hlY2tzOiAoc3RyaW5nIHwgbnVtYmVyKVtdID0gW107XG5cbiAgLy8gSXRlcmF0ZSBvdmVyIGV2ZW50IG1vZGlmaWVycyBhbmQgY29tcHV0ZSB0aGVpciByZXNwb25zaWJpbGl0eVxuICBldmVudE1vZGlmaWVycy5mb3JFYWNoKChlbTogc3RyaW5nKSA9PiB7XG4gICAgaWYgKE9iamVjdC5rZXlzKG90aGVyRXZlbnRNb2RpZmllcnMpXG4gICAgICAgICAgICAgIC5pbmNsdWRlcyhlbSkpIHtcbiAgICAgIC8vIENoYW5nZSBtb2RpZmllciB0byB0cnVlIGlmIGl0IGlzIGEgcHJlc2VudCBtb2RpZmllclxuICAgICAgb3RoZXJFdmVudE1vZGlmaWVyc1tlbV0gPSB0cnVlO1xuICAgIH0gZWxzZSBpZiAoY29tbW9uS2V5Q29kZU5hbWVzLmluY2x1ZGVzKGVtKSkge1xuICAgICAgLy8gQWRkIHRoZSByZXNvbHZlZCBrZXktY29kZSB2YWx1ZSB0byB0aGUgY29uZGl0aW9uYWwgY2hlY2tzXG4gICAgICBjb25kaXRpb25hbENoZWNrcy5wdXNoKGAkZXZlbnQua2V5Q29kZSA9PT0gJHtrZXlDb2Rlc1tlbV19YCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEF0dGVtcHQgdG8gY29udmVydCB0aGUgbW9kaWZpZXIgdG8gYSBudW1iZXJcbiAgICAgIGNvbnN0IHBhcnNlZE1vZGlmaWVyOiBudW1iZXIgPSBOdW1iZXIoZW0pO1xuICAgICAgaWYgKCFpc05hTihwYXJzZWRNb2RpZmllcikpIHtcbiAgICAgICAgLy8gSWYgdGhlIG1vZGlmaWVyIGlzIGEgdmFsaWQgbnVtYmVyLCBhZGQgaXQgYXMgYSBrZXktY29kZSBjb25kaXRpb25hbCBjaGVja1xuICAgICAgICBjb25kaXRpb25hbENoZWNrcy5wdXNoKGAkZXZlbnQua2V5Q29kZSA9PT0gJHtwYXJzZWRNb2RpZmllcn1gKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIElmIG5vdCB0aGVuIGp1c3QgYWRkIHRoZSBsaXRlcmFsIGtleSB2YWx1ZSB0byBhIGtleSBjb25kaXRpb25hbCBjaGVja1xuICAgICAgICBjb25kaXRpb25hbENoZWNrcy5wdXNoKGAkZXZlbnQua2V5ID09PSAnJHtlbX0nYCk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICAvLyBDcmVhdGUgYSBjb25kaXRpb25hbCBzdHJpbmcgdG8gZXZhbHVhdGUgd2l0aGluIHRoZSBmdW5jdGlvbiBjYWxsIGJlZm9yZSBldmFsdWF0aW5nIGFjdHVhbCBjb2RlXG4gIGNvbnN0IGNvbmRpdGlvbmFsUnVsZTogc3RyaW5nID0gYGlmICghKCR7Y29uZGl0aW9uYWxDaGVja3Muam9pbihcInx8XCIpfSkpIHsgcmV0dXJuOyB9YDtcblxuICAvLyBQYXJzZSB0aGUgcmVjZWl2ZWQgY29kZSBpbnRvIHVzYWJsZSBjb2RlIGZvciB0aGUgZXZlbnQgbGlzdGVuZXJcbiAgY29uc3QgZmluYWxDb2RlOiBzdHJpbmcgPSBwYXJzZShpbnN0YW5jZSwgY2FsbGJhY2tGbik7XG5cbiAgLy8gUmV0dXJuIGdlbmVyYXRlZCBldmVudFxuICByZXR1cm4ge1xuICAgIGV2ZW50TmFtZSxcbiAgICBmbjogKGU6IEV2ZW50KSA9PiB7XG4gICAgICAvLyBDcmVhdGUgc3RyaWN0IGV2YWx1YXRlZCBmdW5jdGlvbiBjYWxsXG4gICAgICByZXR1cm4gRnVuY3Rpb24oYFxuICAgICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgICBjb25zdCAkZXZlbnQgPSBhcmd1bWVudHNbMF07XG4gICAgICAke290aGVyRXZlbnRNb2RpZmllcnNbXCJwcmV2ZW50XCJdID8gYCRldmVudC5wcmV2ZW50RGVmYXVsdCgpO2AgOiBcIlwifVxuICAgICAgJHtjb25kaXRpb25hbENoZWNrcy5sZW5ndGggPiAwID8gY29uZGl0aW9uYWxSdWxlIDogXCJcIn1cbiAgICAgICR7ZmluYWxDb2RlfVxuICAgICAgYClcbiAgICAgICAgLmNhbGwoaW5zdGFuY2UsIGUpO1xuICAgIH0sXG4gICAgb3RoZXJFdmVudE1vZGlmaWVyc1xuICB9O1xufVxuIiwiaW1wb3J0IFBvbGFyYmVhciBmcm9tIFwiLi4vUG9sYXJiZWFyXCI7XG5pbXBvcnQgeyBnZXRQcm9wIH0gZnJvbSBcIi4uL2RhdGEvRGF0YUZuc1wiO1xuaW1wb3J0IHJlc29sdmVUeXBlIGZyb20gXCIuLi9ldGMvUmVzb2x2ZVR5cGVcIjtcbmltcG9ydCBub3JtYWxpemVTdHJpbmcgZnJvbSBcIi4uL2V0Yy9Ob3JtYWxpemVTdHJpbmdcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY29tcHV0ZUxvb3AoaW5zdGFuY2U6IFBvbGFyYmVhciwgc3RhdGVtZW50OiBzdHJpbmcpIHtcbiAgY29uc3QgbG9vcENvbXBvbmVudHM6IHN0cmluZ1tdID0gc3RhdGVtZW50LnNwbGl0KC9cXHNpblxccy8pO1xuXG4gIGlmIChsb29wQ29tcG9uZW50cy5sZW5ndGggPiAxKSB7XG4gICAgY29uc3Qgc3BlY2lmaWNzID0gbG9vcENvbXBvbmVudHNbMF0udHJpbSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuc3BsaXQoXCIsXCIpO1xuICAgIGNvbnN0IGl0ZXJhYmxlTmFtZTogc3RyaW5nID0gbG9vcENvbXBvbmVudHNbMV0udHJpbSgpO1xuICAgIGxldCBpdGVyYWJsZSA9IGdldFByb3AoaW5zdGFuY2UuJGRhdGEsIGl0ZXJhYmxlTmFtZSkgfHwgaXRlcmFibGVOYW1lO1xuXG4gICAgbGV0IGtleU5hbWUsIHZhbE5hbWUsIGlkeE5hbWUsIGNvdW50O1xuXG4gICAgY29uc3QgdHlwZSA9IHJlc29sdmVUeXBlKGl0ZXJhYmxlKTtcblxuICAgIGlmIChzcGVjaWZpY3MubGVuZ3RoID09PSAxKSB7XG4gICAgICBrZXlOYW1lID0gbm9ybWFsaXplU3RyaW5nKHNwZWNpZmljc1swXSk7XG4gICAgfSBlbHNlIGlmIChzcGVjaWZpY3MubGVuZ3RoID09PSAyKSB7XG4gICAgICBrZXlOYW1lID0gbm9ybWFsaXplU3RyaW5nKHNwZWNpZmljc1swXSk7XG4gICAgICBpZHhOYW1lID0gbm9ybWFsaXplU3RyaW5nKHNwZWNpZmljc1sxXSk7XG4gICAgfSBlbHNlIGlmIChzcGVjaWZpY3MubGVuZ3RoID09PSAzKSB7XG4gICAgICBrZXlOYW1lID0gbm9ybWFsaXplU3RyaW5nKHNwZWNpZmljc1swXSk7XG4gICAgICB2YWxOYW1lID0gbm9ybWFsaXplU3RyaW5nKHNwZWNpZmljc1sxXSk7XG4gICAgICBpZHhOYW1lID0gbm9ybWFsaXplU3RyaW5nKHNwZWNpZmljc1syXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoYFVuYWJsZSB0byBwYXJzZSBsb29wIHN0YXRlbWVudDogJyR7c3RhdGVtZW50fScuYCk7XG4gICAgfVxuXG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICBjYXNlIFwiYXJyYXlcIjpcbiAgICAgICAgY291bnQgPSBpdGVyYWJsZS5sZW5ndGg7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIm9iamVjdFwiOlxuICAgICAgICBpdGVyYWJsZSA9IE9iamVjdC5lbnRyaWVzKGl0ZXJhYmxlKTtcbiAgICAgICAgY291bnQgPSBPYmplY3Qua2V5cyhpdGVyYWJsZSkubGVuZ3RoO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJudW1iZXJcIjpcbiAgICAgICAgY291bnQgPSBwYXJzZUludChpdGVyYWJsZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgY29uc29sZS5lcnJvcihgVW5rbm93biBpdGVyYWJsZSB0eXBlIGZvciAnJHtpdGVyYWJsZU5hbWV9Jy5gKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGtleU5hbWUsXG4gICAgICB2YWxOYW1lLFxuICAgICAgaWR4TmFtZSxcbiAgICAgIGl0ZXJhYmxlLFxuICAgICAgY291bnQsXG4gICAgICB0eXBlXG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICBjb25zb2xlLmVycm9yKGBVbmFibGUgdG8gcGFyc2UgbG9vcCBzdGF0ZW1lbnQ6ICcke3N0YXRlbWVudH0nLmApO1xuICB9XG59XG4iLCJ0eXBlIGNvbnRpZ3VvdXNPYmogPSB7IFtrZXk6IHN0cmluZ106IGFueSB9XG5cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9sdWtlZWQvZHNldFxuZXhwb3J0IGNvbnN0IHNldFByb3AgPSAob2JqOiBjb250aWd1b3VzT2JqLCBrZXlzOiAoc3RyaW5nIHwgc3RyaW5nW10pLCB2YWw6IGFueSk6IHZvaWQgPT4ge1xuICAoa2V5cyBhcyBzdHJpbmcpLnNwbGl0ICYmIChrZXlzID0gKGtleXMgYXMgc3RyaW5nKS5zcGxpdChcIi5cIikpO1xuICBsZXQgaSA9IDAsIGwgPSBrZXlzLmxlbmd0aCwgdCA9IG9iaiwgeDtcbiAgZm9yICg7IGkgPCBsOyArK2kpIHtcbiAgICB4ID0gdFtrZXlzW2ldXTtcbiAgICB0ID0gdFtrZXlzW2ldXSA9IChpID09PSBsIC0gMSA/IHZhbCA6ICh4ICE9IG51bGwgPyB4IDogKCEhfmtleXNbaSArIDFdLmluZGV4T2YoXCIuXCIpIHx8ICEoK2tleXNbaSArIDFdID4gLTEpKSA/IHt9IDogW10pKTtcbiAgfVxufTtcblxuLy8gaHR0cHM6Ly9naXRodWIuY29tL2RldmVsb3BpdC9kbHZcbmV4cG9ydCBjb25zdCBnZXRQcm9wID0gKG9iajogY29udGlndW91c09iaiwga2V5OiAoc3RyaW5nIHwgc3RyaW5nW10pLCBkZWY/OiBhbnksIHA/OiBudW1iZXIpOiBhbnkgPT4ge1xuICBwID0gMDtcbiAga2V5ID0gKGtleSBhcyBzdHJpbmcpLnNwbGl0ID8gKGtleSBhcyBzdHJpbmcpLnNwbGl0KFwiLlwiKSA6IGtleTtcbiAgd2hpbGUgKG9iaiAmJiBwIDwga2V5Lmxlbmd0aCkgb2JqID0gb2JqW2tleVtwKytdXTtcbiAgcmV0dXJuIChvYmogPT09IHVuZGVmaW5lZCB8fCBwIDwga2V5Lmxlbmd0aCkgPyBkZWYgOiBvYmo7XG59O1xuIiwiaW1wb3J0IFBvbGFyYmVhciBmcm9tIFwiLi4vUG9sYXJiZWFyXCI7XG5pbXBvcnQgeyBnZXRQcm9wLCBzZXRQcm9wIH0gZnJvbSBcIi4vRGF0YUZuc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBvYnNlcnZlKGluc3RhbmNlOiBQb2xhcmJlYXIsIG9iajogeyBba2V5OiBzdHJpbmddOiBhbnkgfSwgcGFyZW50Pzogc3RyaW5nKTogdm9pZCB7XG4gIGZvciAoY29uc3QgcHJvcCBpbiBvYmopIHtcbiAgICBpZiAob2JqLmhhc093blByb3BlcnR5KHByb3ApKSB7XG4gICAgICAvLyBSZW1hcCBwcm9wZXJ0eSBwYXRoIGlmIGl0IGlzIGEgbmVzdGVkIHByb3BlcnR5XG4gICAgICBjb25zdCBwcm9wUGF0aCA9IHBhcmVudCA/IGAke3BhcmVudH0uJHtwcm9wfWAgOiBwcm9wO1xuXG4gICAgICAvLyBSZXRyaWV2ZSBwcm9wZXJ0eSB2YWx1ZSBmcm9tIGl0cyBvcmlnaW5hbCBvYmplY3RcbiAgICAgIGNvbnN0IHByb3BlcnR5VmFsID0gZ2V0UHJvcChvYmosIHByb3ApO1xuXG4gICAgICAvLyBHZXQgdGhlIGxpdGVyYWwgdHlwZSBvZiB0aGUgcmV0cmlldmVkIHByb3BlcnR5XG4gICAgICBjb25zdCB2YWx1ZVR5cGUgPSBwcm9wZXJ0eVZhbC5jb25zdHJ1Y3RvcjtcblxuICAgICAgaWYgKHZhbHVlVHlwZSA9PT0gT2JqZWN0KSB7XG4gICAgICAgIC8vIFNldCBwcm9wZXJ0eSB0byBiZSBlbXB0eSBvYmplY3Qgc2luY2UgaXRzIGNoaWxkcmVuIHdpbGwgbmVlZCB0byBiZSBzZXBhcmF0ZWx5IG9ic2VydmVkXG4gICAgICAgIHNldFByb3AoaW5zdGFuY2UuJGRhdGEsIHByb3BQYXRoLCB7fSk7XG4gICAgICAgIHNldFByb3AoaW5zdGFuY2UsIHByb3BQYXRoLCB7fSk7XG5cbiAgICAgICAgLy8gT2JzZXJ2ZSBjaGlsZCBwcm9wZXJ0aWVzIG9mIG9iamVjdFxuICAgICAgICBvYnNlcnZlKGluc3RhbmNlLCBwcm9wZXJ0eVZhbCwgcHJvcFBhdGgpO1xuICAgICAgfSBlbHNlIGlmICh2YWx1ZVR5cGUgPT09IEFycmF5KSB7XG4gICAgICAgIC8vIFN0b3JlIHJlZmVyZW5jZSBhcnJheSBpbiBpbnN0YW5jZSBkYXRhIHByb3BlcnR5XG4gICAgICAgIHNldFByb3AoaW5zdGFuY2UuJGRhdGEsIHByb3BQYXRoLCBwcm9wZXJ0eVZhbCk7XG5cbiAgICAgICAgY29uc3QgYXJyUHJveHkgPSBuZXcgUHJveHkoZ2V0UHJvcChpbnN0YW5jZS4kZGF0YSwgcHJvcFBhdGgpLCB7XG4gICAgICAgICAgZ2V0KHRhcmdldDogYW55LCBwcm9wZXJ0eTogYW55KSB7XG4gICAgICAgICAgICAvLyBOb3cgdGhhdCB0aGUgdmFsdWUgaGFzIGJlZW4gdXBkYXRlZCB3ZSB3YW50IHRvIGNhbGwgdGhlIHdhdGNoZXIgaWYgaXQgZXhpc3RzXG4gICAgICAgICAgICBpZiAoaW5zdGFuY2UuJHdhdGNoZXJzW3Byb3BQYXRoXSkge1xuICAgICAgICAgICAgICAvLyBQYXNzIHRocm91Z2ggdGhlIGluc3RhbmNlIHJlZmVyZW5jZSBhbmQgdGhlIHByb3BlcnR5J3Mgb2xkIHZhbHVlXG4gICAgICAgICAgICAgIGluc3RhbmNlLiR3YXRjaGVyc1twcm9wUGF0aF0uYXBwbHkoaW5zdGFuY2UsIFt0YXJnZXRdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0YXJnZXRbcHJvcGVydHldO1xuICAgICAgICAgIH0sXG5cbiAgICAgICAgICAvLyBQcm94eSB0cmFwIGZvciB1cGRhdGluZyBvciBhZGRpbmcgdmFsdWVzXG4gICAgICAgICAgc2V0KHRhcmdldDogYW55LCBwcm9wZXJ0eTogYW55LCB2YWx1ZTogYW55KTogYm9vbGVhbiB7XG4gICAgICAgICAgICB0YXJnZXRbcHJvcGVydHldID0gdmFsdWU7XG4gICAgICAgICAgICBpbnN0YW5jZS5yZW5kZXIoKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gU2V0IGFycmF5IHByb3h5IHRvIGFjdHVhbCByb290IHByb3BlcnR5IHNvIHRoYXQgcHJveHkgdHJhcHMgYXJlIHRyaWdnZXJlZCBvbiBwcm9wZXJ0eSByZWZlcmVuY2VcbiAgICAgICAgc2V0UHJvcChpbnN0YW5jZSwgcHJvcFBhdGgsIGFyclByb3h5KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFN0b3JlIHJlZmVyZW5jZSBwcm9wZXJ0eSBvbiBpbnN0YW5jZSBkYXRhIHByb3BlcnR5XG4gICAgICAgIHNldFByb3AoaW5zdGFuY2UuJGRhdGEsIHByb3BQYXRoLCBwcm9wZXJ0eVZhbCk7XG5cbiAgICAgICAgLy8gU2V0IHByb3BlcnR5IG9uIHJvb3Qgb2YgaW5zdGFuY2Ugb3Igb24gY2hpbGQgb2JqZWN0IG9mIGluc3RhbmNlIHJvb3RcbiAgICAgICAgY29uc3QgZGVmaW5pdGlvbkxvY2F0aW9uID0gcGFyZW50ID8gZ2V0UHJvcChpbnN0YW5jZSwgcGFyZW50KSA6IGluc3RhbmNlO1xuXG4gICAgICAgIC8vIERlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIGFuZCBzZXR0ZXJzIG9uIGluc3RhbmNlXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShkZWZpbml0aW9uTG9jYXRpb24sIHByb3AsIHtcbiAgICAgICAgICBnZXQoKTogYW55IHtcbiAgICAgICAgICAgIC8vIFJldHJpZXZlIHZhbHVlIGZyb20gYWx0ZXJuYXRpdmUgcmVmZXJlbmNlIHNvIHRoYXQgdGhlcmUgaXMgbm90IGFuIGluZmluaXRlIGxvb3BcbiAgICAgICAgICAgIHJldHVybiBnZXRQcm9wKGluc3RhbmNlLiRkYXRhLCBwcm9wUGF0aCk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBzZXQodjogYW55KTogdm9pZCB7XG4gICAgICAgICAgICAvLyBHZXQgdGhlIHByb3BlcnR5J3MgcHJldmlvdXMgdmFsdWUgYmVmb3JlIHJlYXNzaWduaW5nIGl0XG4gICAgICAgICAgICBjb25zdCBvbGRWYWwgPSBnZXRQcm9wKGluc3RhbmNlLiRkYXRhLCBwcm9wUGF0aCk7XG4gICAgICAgICAgICAvLyBTZXQgYWx0ZXJuYXRpdmUgcmVmZXJlbmNlIHNvIHRoYXQgdGhlcmUgaXMgbm90IGFuIGluZmluaXRlIGxvb3BcbiAgICAgICAgICAgIHNldFByb3AoaW5zdGFuY2UuJGRhdGEsIHByb3BQYXRoLCB2KTtcbiAgICAgICAgICAgIC8vIE5vdyB0aGF0IHRoZSB2YWx1ZSBoYXMgYmVlbiB1cGRhdGVkIHdlIHdhbnQgdG8gY2FsbCB0aGUgd2F0Y2hlciBpZiBpdCBleGlzdHNcbiAgICAgICAgICAgIGlmIChpbnN0YW5jZS4kd2F0Y2hlcnNbcHJvcFBhdGhdKSB7XG4gICAgICAgICAgICAgIC8vIFBhc3MgdGhyb3VnaCB0aGUgaW5zdGFuY2UgcmVmZXJlbmNlIGFuZCB0aGUgcHJvcGVydHkncyBvbGQgdmFsdWUgYW5kIG5ldyB2YWx1ZVxuICAgICAgICAgICAgICBpbnN0YW5jZS4kd2F0Y2hlcnNbcHJvcFBhdGhdLmFwcGx5KGluc3RhbmNlLCBbb2xkVmFsLCB2XSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpbnN0YW5jZS5yZW5kZXIoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxufTtcbiIsImltcG9ydCB7IFJlZ2V4ZXMgfSBmcm9tIFwiLi4vZXRjL1JlZ2V4ZXNcIjtcbmltcG9ydCBjcmVhdGVFbCBmcm9tIFwiLi4vdmRvbS9DcmVhdGVFbGVtZW50XCI7XG5pbXBvcnQgeyBzdHJPYmosIHZOb2RlIH0gZnJvbSBcIi4uL2dsb2JhbHNcIjtcbmltcG9ydCB7IGdldFByb3AgfSBmcm9tIFwiLi4vZGF0YS9EYXRhRm5zXCI7XG5pbXBvcnQgUG9sYXJiZWFyIGZyb20gXCIuLi9Qb2xhcmJlYXJcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdHJhdmVyc2UoaW5zdGFuY2U6IFBvbGFyYmVhciwgbm9kZTogSFRNTEVsZW1lbnQpIHtcbiAgbGV0IGF0dHJzOiBzdHJPYmogPSB7fTtcbiAgbGV0IGV2ZW50czogc3RyT2JqID0ge307XG4gIGxldCBjb25kaXRpb25hbENhc2U6IHN0cmluZyA9IFwiXCI7XG4gIGxldCBsb29wQ2FzZTogc3RyaW5nID0gXCJcIjtcbiAgbGV0IGJvdW5kRGF0YTogeyBba2V5OiBzdHJpbmddOiBhbnkgfSA9IHt9O1xuICBsZXQgcmVmTmFtZTogc3RyaW5nID0gXCJcIjtcbiAgbGV0IGNoaWxkcmVuOiB2Tm9kZVtdID0gW107XG5cbiAgQXJyYXkuZnJvbShub2RlLmNoaWxkTm9kZXMpXG4gICAgICAgLmZvckVhY2goKGU6IEhUTUxFbGVtZW50KSA9PiB7XG4gICAgICAgICBpZiAoZS5ub2RlVHlwZSA9PT0gMSkge1xuICAgICAgICAgICBjaGlsZHJlbi5wdXNoKCh0cmF2ZXJzZShpbnN0YW5jZSwgZSkgYXMgdk5vZGUpKTtcbiAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgIGNoaWxkcmVuLnB1c2goKGUgYXMgYW55KS5kYXRhKTtcbiAgICAgICAgIH1cbiAgICAgICB9KTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IG5vZGUuYXR0cmlidXRlcy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IHtuYW1lLCB2YWx1ZX0gPSBub2RlLmF0dHJpYnV0ZXNbaV07XG5cbiAgICBpZiAobmFtZS5zdGFydHNXaXRoKFwiQFwiKSkge1xuICAgICAgLy8gUHJvY2VzcyBldmVudCBhdHRyaWJ1dGVzXG4gICAgICBjb25zdCBldiA9IG5hbWUuc2xpY2UoMSk7XG4gICAgICBldmVudHNbZXZdID0gdmFsdWU7XG4gICAgfSBlbHNlIGlmIChuYW1lLnN0YXJ0c1dpdGgoXCJiaW5kdmFsXCIpKSB7XG4gICAgICAvLyBQcm9jZXNzIHZhbHVlIGJpbmRpbmcgYXR0cmlidXRlXG4gICAgICBjb25zdCBzcGVjcyA9IG5hbWUuc3BsaXQoXCIuXCIpO1xuICAgICAgYm91bmREYXRhID0ge1xuICAgICAgICBwcm9wOiB2YWx1ZSxcbiAgICAgICAgb3B0czogc3BlY3Muc2xpY2UoMSlcbiAgICAgIH07XG4gICAgfSBlbHNlIGlmIChuYW1lID09PSBcImxvb3Bmb3JcIikge1xuICAgICAgLy8gUHJvY2VzcyBsb29wIGF0dHJpYnV0ZVxuICAgICAgbG9vcENhc2UgPSBTdHJpbmcodmFsdWUpO1xuICAgIH0gZWxzZSBpZiAobmFtZSA9PT0gXCJyZWZcIikge1xuICAgICAgLy8gUHJvY2VzcyByZWZlcmVuY2UgYXR0cmlidXRlXG4gICAgICByZWZOYW1lID0gU3RyaW5nKHZhbHVlKTtcbiAgICB9IGVsc2UgaWYgKG5hbWUgPT09IFwic2hvd2lmXCIpIHtcbiAgICAgIC8vIFByb2Nlc3MgY29uZGl0aW9uYWwgaWYgYXR0cmlidXRlXG4gICAgICBjb25zdCBjb21wdXRlZENvbmRpdGlvbjogc3RyaW5nID0gdmFsdWUucmVwbGFjZShSZWdleGVzLmludGVycG9sYXRpb25Db250ZW50LCAoczogc3RyaW5nKSA9PiB7XG4gICAgICAgIHJldHVybiBnZXRQcm9wKGluc3RhbmNlLiRkYXRhLCBzKSAhPT0gdW5kZWZpbmVkID8gYHRoaXMuJHtzfWAgOiBzO1xuICAgICAgfSk7XG4gICAgICBjb25kaXRpb25hbENhc2UgPSBjb21wdXRlZENvbmRpdGlvbjtcbiAgICB9IGVsc2UgaWYgKG5hbWUgPT09IFwic2hvd2Vsc2VcIikge1xuICAgICAgLy8gUHJvY2VzcyBjb25kaXRpb25hbCBlbHNlIGF0dHJpYnV0ZVxuICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgY29uc3QgY29tcHV0ZWRDb25kaXRpb246IHN0cmluZyA9IG5vZGUucHJldmlvdXNFbGVtZW50U2libGluZy5hdHRyaWJ1dGVzW1wic2hvd2lmXCJdLnZhbHVlLnJlcGxhY2UoUmVnZXhlcy5pbnRlcnBvbGF0aW9uQ29udGVudCwgKHM6IHN0cmluZykgPT4ge1xuICAgICAgICByZXR1cm4gZ2V0UHJvcChpbnN0YW5jZS4kZGF0YSwgcykgIT09IHVuZGVmaW5lZCA/IGB0aGlzLiR7c31gIDogcztcbiAgICAgIH0pO1xuICAgICAgY29uZGl0aW9uYWxDYXNlID0gYCEoJHtjb21wdXRlZENvbmRpdGlvbn0pYDtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gRm91bmQgbm8gbWF0Y2hpbmcgYXR0cmlidXRlcyByZWxhdGVkIHRvIFBvbGFyYmVhclxuICAgICAgYXR0cnNbbmFtZV0gPSB2YWx1ZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gY3JlYXRlRWwobm9kZS50YWdOYW1lLCB7XG4gICAgYXR0cnMsXG4gICAgZXZlbnRzLFxuICAgIGNvbmRpdGlvbmFsQ2FzZSxcbiAgICBsb29wQ2FzZSxcbiAgICBib3VuZERhdGEsXG4gICAgcmVmTmFtZSxcbiAgICBjaGlsZHJlblxuICB9KTtcbn07XG4iLCIvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9FdmVudHNcbmV4cG9ydCBjb25zdCBwb3NzaWJsZUV2ZW50TGlzdDogc3RyaW5nW10gPSBbXG4gIFwiaW5wdXRcIixcbiAgXCJjaGFuZ2VcIixcbiAgXCJjYWNoZWRcIixcbiAgXCJlcnJvclwiLFxuICBcImFib3J0XCIsXG4gIFwibG9hZFwiLFxuICBcImJlZm9yZXVubG9hZFwiLFxuICBcInVubG9hZFwiLFxuICBcIm9ubGluZVwiLFxuICBcIm9mZmxpbmVcIixcbiAgXCJmb2N1c1wiLFxuICBcImJsdXJcIixcbiAgXCJhbmltYXRpb25zdGFydFwiLFxuICBcImFuaW1hdGlvbmVuZFwiLFxuICBcImFuaW1hdGlvbml0ZXJhdGlvblwiLFxuICBcInRyYW5zaXRpb25zdGFydFwiLFxuICBcInRyYW5zaXRpb25jYW5jZWxcIixcbiAgXCJ0cmFuc2l0aW9uZW5kXCIsXG4gIFwidHJhbnNpdGlvbnJ1blwiLFxuICBcInJlc2V0XCIsXG4gIFwic3VibWl0XCIsXG4gIFwicmVzaXplXCIsXG4gIFwic2Nyb2xsXCIsXG4gIFwiY3V0XCIsXG4gIFwiY29weVwiLFxuICBcInBhc3RlXCIsXG4gIFwia2V5ZG93blwiLFxuICBcImtleXByZXNzXCIsXG4gIFwia2V5dXBcIixcbiAgXCJtb3VzZWVudGVyXCIsXG4gIFwibW91c2VvdmVyXCIsXG4gIFwibW91c2Vtb3ZlXCIsXG4gIFwibW91c2Vkb3duXCIsXG4gIFwibW91c2V1cFwiLFxuICBcImF1eGNsaWNrXCIsXG4gIFwiY2xpY2tcIixcbiAgXCJkYmxjbGlja1wiLFxuICBcImNvbnRleHRtZW51XCIsXG4gIFwid2hlZWxcIixcbiAgXCJtb3VzZWxlYXZlXCIsXG4gIFwibW91c2VvdXRcIixcbiAgXCJzZWxlY3RcIixcbiAgXCJkcmFnc3RhcnRcIixcbiAgXCJkcmFnXCIsXG4gIFwiZHJhZ2VuZFwiLFxuICBcImRyYWdlbnRlclwiLFxuICBcImRyYWdvdmVyXCIsXG4gIFwiZHJhZ2xlYXZlXCIsXG4gIFwiZHJvcFwiLFxuICBcImR1cmF0aW9uY2hhbmdlXCIsXG4gIFwibG9hZGVkbWV0YWRhdGFcIixcbiAgXCJsb2FkZWRkYXRhXCIsXG4gIFwiY2FucGxheVwiLFxuICBcImNhbnBsYXl0aHJvdWdoXCIsXG4gIFwiZW5kZWRcIixcbiAgXCJlbXB0aWVkXCIsXG4gIFwic3RhbGxlZFwiLFxuICBcInN1c3BlbmRcIixcbiAgXCJwbGF5XCIsXG4gIFwicGxheWluZ1wiLFxuICBcInBhdXNlXCIsXG4gIFwid2FpdGluZ1wiLFxuICBcInNlZWtpbmdcIixcbiAgXCJzZWVrZWRcIixcbiAgXCJyYXRlY2hhbmdlXCIsXG4gIFwidGltZXVwZGF0ZVwiLFxuICBcInZvbHVtZWNoYW5nZVwiLFxuICBcImNvbXBsZXRlXCIsXG4gIFwiYXVkaW9wcm9jZXNzXCJcbl07IiwiLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0tleWJvYXJkRXZlbnQva2V5Q29kZVxuZXhwb3J0IGNvbnN0IGtleUNvZGVzOiB7IFtrZXk6IHN0cmluZ106IG51bWJlciB9ID0ge1xuICBcImJhY2tzcGFjZVwiOiA4LFxuICBcImRlbGV0ZVwiOiA0NixcbiAgXCJkb3duXCI6IDQwLFxuICBcImVudGVyXCI6IDEzLFxuICBcImxlZnRcIjogMzcsXG4gIFwicmlnaHRcIjogMzksXG4gIFwic3BhY2VcIjogMzIsXG4gIFwidGFiXCI6IDksXG4gIFwidXBcIjogMzgsXG4gIFwiZXNjXCI6IDI3XG59OyIsIi8qXG4gKiBTdHJpcHMgd2hpdGVzcGFjZSBhbmQgcmVtb3ZlcyBhbnkgY2hhcmFjdGVycyBiZXNpZGVzIGFscGhhbnVtZXJpYyBjaGFyYWN0ZXJzLCAnJCcsICdfJ1xuICogKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG5vcm1hbGl6ZVN0cmluZyhzOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gcy5yZXBsYWNlKC9bXkEtejAtOV8kXS9nLCBcIlwiKVxuICAgICAgICAgIC50cmltKCk7XG59XG4iLCJleHBvcnQgbmFtZXNwYWNlIFJlZ2V4ZXMge1xuICAvKlxuICAgKiBNYXRjaGVzIGludGVycG9sYXRpb24gY29udGVudCAobXVzdGFjaGUgc3ludGF4KVxuICAgKlxuICAgKiBJbnB1dDpcbiAgICogYFNvbWUgY29udGVudCB3aXRoIGludGVycG9sYXRpb24gY29udGVudC4uLiB7e2FnZSArIDEwfX0uIFNvbWUgb3RoZXIgY29udGVudCB7e2ZhdkNvbG9yfX1gXG4gICAqXG4gICAqIE1hdGNoOlxuICAgKiB7e2FnZSArIDEwfX1cbiAgICovXG4gIGV4cG9ydCBjb25zdCBpbnRlcnBvbGF0aW9uOiBSZWdFeHAgPSAvKHt7Lio/fX0pLztcblxuICAvKlxuICAgKiBNYXRjaGVzIGFsbCBtdXN0YWNoZSBzeW50YXggaW50ZXJwb2xhdGlvbiB3aXRoaW4gYSBzdHJpbmdcbiAgICogcmF0aGVyIHRoYW4gdGhlIGZpcnN0IG9jY3VycmVuY2UgZm91bmRcbiAgICpcbiAgICogSW5wdXQ6XG4gICAqIGBUZWFtIDEgc2NvcmU6IHt7c2NvcmUxfX0uIFRlYW0gMiBzY29yZToge3tzY29yZTJ9fS5gXG4gICAqXG4gICAqIE1hdGNoZXM6XG4gICAqIHt7c2NvcmUxfX1cbiAgICoge3tzY29yZTJ9fVxuICAgKi9cbiAgZXhwb3J0IGNvbnN0IGdsb2JhbEludGVycG9sYXRpb246IFJlZ0V4cCA9IC8oe3suKj99fSkvZztcblxuICAvKlxuICAgKiBNYXRjaGVzIGZpcnN0IGZvdW5kIHByb3BlcnR5IG9yIGZ1bmN0aW9uIGluc2lkZSBpbnRlcnBvbGF0aW9uIG1hdGNoZXNcbiAgICpcbiAgICogSW5wdXQ6XG4gICAqIGB7e3NheUhlbGxvKCkgKyBuYW1lfX1gXG4gICAqXG4gICAqIE1hdGNoOlxuICAgKiBzYXlIZWxsb1xuICAgKi9cbiAgZXhwb3J0IGNvbnN0IGlubmVySW50ZXJwb2xhdGlvbjogUmVnRXhwID0gL1tcXHdcXC5dKy87XG5cbiAgLypcbiAgICogTWF0Y2hlcyBvbmx5IGZ1bmN0aW9ucyBpbiBpbnNpZGUgaW50ZXJwb2xhdGlvbiBtYXRjaGVzXG4gICAqXG4gICAqIElucHV0OlxuICAgKiBge3tzYXlIZWxsbygpICsgbmFtZX19YFxuICAgKlxuICAgKiBNYXRjaDpcbiAgICogc2F5SGVsbG8oKVxuICAgKi9cbiAgZXhwb3J0IGNvbnN0IGlubmVyRnVuY3Rpb25JbnRlcnBvbGF0aW9uOiBSZWdFeHAgPSAvXFx3K1xcKFtBLXokX10rXFwpLztcblxuICAvKlxuICAgKiBNYXRjaGVzIGZ1bmN0aW9uIGNhbGxzIGluc2lkZSBpbnRlcnBvbGF0aW9uIG1hdGNoZXNcbiAgICpcbiAgICogSW5wdXQ6XG4gICAqIGBjb25zb2xlLmxvZyhuYW1lICsgJyBpcyBjb29sLiBUaGVpciBhZ2UgaXM6ICcgKyBhZ2UpYFxuICAgKlxuICAgKiBNYXRjaGVzOlxuICAgKiBjb25zb2xlLmxvZ1xuICAgKiBuYW1lXG4gICAqIGFnZVxuICAgKi9cbiAgZXhwb3J0IGNvbnN0IGludGVycG9sYXRpb25Db250ZW50OiBSZWdFeHAgPSAvW0Etel0rKChcXC5cXHcrKSspPyg/PShbXidcXFxcXSooXFxcXC58JyhbXidcXFxcXSpcXFxcLikqW14nXFxcXF0qJykpKlteJ10qJCkvZztcblxuICAvKlxuICAgKiBNYXRjaGVzIGZpbHRlcnMgaW4gaW50ZXJwb2xhdGlvbiBtYXRjaGVzXG4gICAqXG4gICAqIElucHV0OlxuICAgKiBge3tzYXlIZWxsbygpICsgbmFtZSB8IHVwcGVyIHwgcmV2ZXJzZX19YFxuICAgKlxuICAgKiBNYXRjaGVzOlxuICAgKiB8IHVwcGVyIHwgcmV2ZXJzZVxuICAgKi9cbiAgZXhwb3J0IGNvbnN0IGZpbHRlcnNNYXRjaDogUmVnRXhwID0gLyhcXHwpKFxccyspP1xcdysoXFwuXFx3Kyk/KC4qKT9cXGIoPz0oW14nXFxcXF0qKFxcXFwufCcoW14nXFxcXF0qXFxcXC4pKlteJ1xcXFxdKicpKSpbXiddKiQpLztcbn1cbiIsIi8qXG4gKiBSZXNvbHZlcyBhIHZhcmlhYmxlIHR5cGVcbiAqICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiByZXNvbHZlVHlwZShvOiBhbnkpOiBzdHJpbmcge1xuICBpZiAobyAhPT0gdW5kZWZpbmVkICYmIG8udG9TdHJpbmcoKSA9PT0gXCJbb2JqZWN0IE9iamVjdF1cIikge1xuICAgIHJldHVybiBcIm9iamVjdFwiO1xuICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkobykpIHtcbiAgICByZXR1cm4gXCJhcnJheVwiO1xuICB9IGVsc2UgaWYgKCFpc05hTihvICsgMCkpIHtcbiAgICByZXR1cm4gXCJudW1iZXJcIjtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gXCJzdHJpbmdcIjtcbiAgfVxufVxuIiwiaW1wb3J0IFBvbGFyYmVhciBmcm9tIFwiLi4vUG9sYXJiZWFyXCI7XG5pbXBvcnQgeyBSZWdleGVzIH0gZnJvbSBcIi4uL2V0Yy9SZWdleGVzXCI7XG5cbmV4cG9ydCBjb25zdCBwYXJzZSA9IChpbnN0YW5jZTogUG9sYXJiZWFyLCBjb2RlOiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xuICByZXR1cm4gY29kZS5yZXBsYWNlKFJlZ2V4ZXMuaW5uZXJJbnRlcnBvbGF0aW9uLCAoZnVuYyk6IHN0cmluZyA9PiB7XG4gICAgLy8gQ2hlY2sgaWYgdGhlIGZ1bmN0aW9uIGFscmVhZHkgaGFzIGNhbGwgcGFyYW1ldGVyc1xuICAgIGNvbnN0IGhhc0NhbGwgPSBjb2RlLm1hdGNoKFJlZ2V4ZXMuaW5uZXJGdW5jdGlvbkludGVycG9sYXRpb24pO1xuXG4gICAgaWYgKGluc3RhbmNlW2Z1bmNdKSB7XG4gICAgICAvLyBSZXR1cm4gdXNhYmxlIGZ1bmN0aW9uIGNhbGwgaWYgZnVuY3Rpb24gZXhpc3RzIGluIGluc3RhbmNlXG4gICAgICByZXR1cm4gaGFzQ2FsbCA/IGB0aGlzLiR7ZnVuY31gIDogYHRoaXMuJHtmdW5jfSgpYDtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gUmV0dXJuIG9yaWdpbmFsIGZ1bmN0aW9uIGNhbGwgaWYgZnVuY3Rpb24gaXMgbm90IHJlbGF0ZWQgdG8gaW5zdGFuY2VcbiAgICAgIHJldHVybiBmdW5jO1xuICAgIH1cbiAgfSk7XG59O1xuIiwiaW1wb3J0IHsgdk5vZGVPcHRzIH0gZnJvbSBcIi4uL2dsb2JhbHNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY3JlYXRlRWwodGFnTmFtZTogc3RyaW5nLCB7XG4gIGF0dHJzID0ge30sXG4gIGV2ZW50cyA9IHt9LFxuICBjb25kaXRpb25hbENhc2UgPSBcIlwiLFxuICBsb29wQ2FzZSA9IFwiXCIsXG4gIGJvdW5kRGF0YSA9IHt9LFxuICByZWZOYW1lID0gXCJcIixcbiAgY2hpbGRyZW4gPSBbXVxufTogdk5vZGVPcHRzKSB7XG4gIHJldHVybiB7XG4gICAgdGFnTmFtZSxcbiAgICBhdHRycyxcbiAgICBldmVudHMsXG4gICAgY29uZGl0aW9uYWxDYXNlLFxuICAgIGxvb3BDYXNlLFxuICAgIGJvdW5kRGF0YSxcbiAgICByZWZOYW1lLFxuICAgIGNoaWxkcmVuXG4gIH07XG59XG4iLCIvKlxuICogQ29kZSBhZGFwdGVkIGZyb206IGh0dHBzOi8vZ2l0aHViLmNvbS95Y21qYXNvbi10YWxrcy8yMDE4LTExLTIxLW1hbmMtd2ViLW1lZXR1cC00XG4gKiAqL1xuXG5pbXBvcnQgUG9sYXJiZWFyIGZyb20gXCIuLi9Qb2xhcmJlYXJcIjtcbmltcG9ydCB7IHZOb2RlIH0gZnJvbSBcIi4uL2dsb2JhbHNcIjtcbmltcG9ydCB7IHJlbmRlciwgcmVuZGVyRWxlbSB9IGZyb20gXCIuL1JlbmRlclwiO1xuaW1wb3J0IGNyZWF0ZUVsIGZyb20gXCIuL0NyZWF0ZUVsZW1lbnRcIjtcblxuY29uc3QgemlwID0gKHhzOiAodk5vZGUgfCBzdHJpbmcpW10sIHlzOiAoKHZOb2RlIHwgc3RyaW5nKVtdIHwgTm9kZUxpc3RPZjxDaGlsZE5vZGU+KSkgPT4ge1xuICBjb25zdCB6aXBwZWQgPSBbXTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBNYXRoLm1heCh4cy5sZW5ndGgsIHlzLmxlbmd0aCk7IGkrKykge1xuICAgIHppcHBlZC5wdXNoKFt4c1tpXSwgeXNbaV1dKTtcbiAgfVxuICByZXR1cm4gemlwcGVkO1xufTtcblxuY29uc3QgZGlmZkF0dHJzID0gKG9sZEF0dHJzOiB7fSwgbmV3QXR0cnM6IHt9KSA9PiB7XG4gIGNvbnN0IHBhdGNoZXM6IGFueVtdID0gW107XG5cbiAgY29uc3QgYXR0cnMgPSBPYmplY3QuYXNzaWduKG9sZEF0dHJzLCBuZXdBdHRycyk7XG5cbiAgLy8gc2V0IG5ldyBhdHRyaWJ1dGVzXG4gIGZvciAoY29uc3QgW2ssIHZdIG9mIE9iamVjdC5lbnRyaWVzKGF0dHJzKSkge1xuICAgIHBhdGNoZXMucHVzaCgoJG5vZGU6IEhUTUxFbGVtZW50KSA9PiB7XG4gICAgICAkbm9kZS5zZXRBdHRyaWJ1dGUoaywgKHYgYXMgYW55KSk7XG4gICAgICByZXR1cm4gJG5vZGU7XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gKCRub2RlOiBIVE1MRWxlbWVudCkgPT4ge1xuICAgIGZvciAoY29uc3QgcGF0Y2ggb2YgcGF0Y2hlcykge1xuICAgICAgcGF0Y2goJG5vZGUpO1xuICAgIH1cbiAgfTtcbn07XG5cbmNvbnN0IGRpZmZDaGlsZHJlbiA9IChpbnN0YW5jZTogUG9sYXJiZWFyLCBvbGRWQ2hpbGRyZW46ICh2Tm9kZSB8IHN0cmluZylbXSwgbmV3VkNoaWxkcmVuOiAodk5vZGUgfCBzdHJpbmcpW10pID0+IHtcbiAgY29uc3QgY2hpbGRQYXRjaGVzOiBhbnlbXSA9IFtdO1xuICBvbGRWQ2hpbGRyZW4uZm9yRWFjaCgob2xkVkNoaWxkOiAodk5vZGUgfCBzdHJpbmcpLCBpOiBudW1iZXIpID0+IHtcbiAgICBjaGlsZFBhdGNoZXMucHVzaChkaWZmKGluc3RhbmNlLCBvbGRWQ2hpbGQsIG5ld1ZDaGlsZHJlbltpXSkpO1xuICB9KTtcblxuICBjb25zdCBhZGRpdGlvbmFsUGF0Y2hlczogYW55W10gPSBbXTtcbiAgZm9yIChjb25zdCBhZGRpdGlvbmFsVkNoaWxkIG9mIG5ld1ZDaGlsZHJlbi5zbGljZShvbGRWQ2hpbGRyZW4ubGVuZ3RoKSkge1xuICAgIGFkZGl0aW9uYWxQYXRjaGVzLnB1c2goKCRub2RlOiBIVE1MRWxlbWVudCkgPT4ge1xuICAgICAgJG5vZGUuYXBwZW5kQ2hpbGQocmVuZGVyKGluc3RhbmNlLCBhZGRpdGlvbmFsVkNoaWxkKSk7XG4gICAgICByZXR1cm4gJG5vZGU7XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gKCRwYXJlbnQ6IEhUTUxFbGVtZW50KSA9PiB7XG4gICAgZm9yIChjb25zdCBbcGF0Y2gsIGNoaWxkXSBvZiB6aXAoY2hpbGRQYXRjaGVzLCAkcGFyZW50LmNoaWxkTm9kZXMpKSB7XG4gICAgICBpZiAocGF0Y2ggIT09IHVuZGVmaW5lZCAmJiBjaGlsZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIChwYXRjaCBhcyBhbnkpKGNoaWxkKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IHBhdGNoIG9mIGFkZGl0aW9uYWxQYXRjaGVzKSB7XG4gICAgICBwYXRjaCgkcGFyZW50KTtcbiAgICB9XG5cbiAgICByZXR1cm4gJHBhcmVudDtcbiAgfTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGRpZmYoaW5zdGFuY2U6IFBvbGFyYmVhciwgdk9sZE5vZGU6ICh2Tm9kZSB8IHN0cmluZyksIHZOZXdOb2RlOiAodk5vZGUgfCBzdHJpbmcpKSB7XG4gIGlmICh2TmV3Tm9kZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuICgkbm9kZTogSFRNTEVsZW1lbnQpOiB1bmRlZmluZWQgPT4ge1xuICAgICAgJG5vZGUucmVtb3ZlKCk7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH07XG4gIH1cblxuICBpZiAodHlwZW9mIHZPbGROb2RlID09PSBcInN0cmluZ1wiIHx8XG4gICAgdHlwZW9mIHZOZXdOb2RlID09PSBcInN0cmluZ1wiKSB7XG4gICAgaWYgKHZPbGROb2RlICE9PSB2TmV3Tm9kZSkge1xuICAgICAgcmV0dXJuICgkbm9kZTogSFRNTEVsZW1lbnQpID0+IHtcbiAgICAgICAgY29uc3QgJG5ld05vZGUgPSByZW5kZXIoaW5zdGFuY2UsIHZOZXdOb2RlKTtcbiAgICAgICAgJG5vZGUucmVwbGFjZVdpdGgoJG5ld05vZGUpO1xuICAgICAgICByZXR1cm4gJG5ld05vZGU7XG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gKCRub2RlOiBIVE1MRWxlbWVudCk6IHVuZGVmaW5lZCA9PiB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG5cbiAgaWYgKHZPbGROb2RlLnRhZ05hbWUgIT09IHZOZXdOb2RlLnRhZ05hbWUpIHtcbiAgICByZXR1cm4gKCRub2RlOiBIVE1MRWxlbWVudCkgPT4ge1xuICAgICAgY29uc3QgJG5ld05vZGUgPSByZW5kZXIoaW5zdGFuY2UsIHZOZXdOb2RlKTtcbiAgICAgICRub2RlLnJlcGxhY2VXaXRoKCRuZXdOb2RlKTtcbiAgICAgIHJldHVybiAkbmV3Tm9kZTtcbiAgICB9O1xuICB9XG5cbiAgaWYgKHZOZXdOb2RlLmNvbmRpdGlvbmFsQ2FzZSAhPT0gXCJcIikge1xuICAgIHJldHVybiAoJG5vZGU6IEhUTUxFbGVtZW50KSA9PiB7XG4gICAgICBjb25zdCAkbmV3Tm9kZSA9IHJlbmRlcihpbnN0YW5jZSwgdk5ld05vZGUpO1xuICAgICAgaWYgKCRub2RlLm5vZGVUeXBlICE9PSAkbmV3Tm9kZS5ub2RlVHlwZSkge1xuICAgICAgICAkbm9kZS5yZXBsYWNlV2l0aCgkbmV3Tm9kZSk7XG4gICAgICAgIHJldHVybiAkbmV3Tm9kZTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgaWYgKHZOZXdOb2RlLmxvb3BDYXNlICE9PSB2T2xkTm9kZS5sb29wQ2FzZSkge1xuICAgIGNvbnN0ICRuZXdOb2RlID0gcmVuZGVyRWxlbShpbnN0YW5jZSwgY3JlYXRlRWwodk5ld05vZGUudGFnTmFtZSwge1xuICAgICAgbG9vcENhc2U6IHVuZGVmaW5lZCxcbiAgICAgIGNoaWxkcmVuOiByZW5kZXIoaW5zdGFuY2UsIHZOZXdOb2RlKVxuICAgIH0pKTtcbiAgICByZXR1cm4gKCRub2RlOiBIVE1MRWxlbWVudCkgPT4ge1xuICAgICAgJG5vZGUucmVwbGFjZVdpdGgoJG5ld05vZGUpO1xuICAgICAgcmV0dXJuICRuZXdOb2RlO1xuICAgIH07XG4gIH1cblxuICBjb25zdCBwYXRjaEF0dHJzID0gZGlmZkF0dHJzKHZPbGROb2RlLmF0dHJzLCB2TmV3Tm9kZS5hdHRycyk7XG4gIGNvbnN0IHBhdGNoQ2hpbGRyZW4gPSBkaWZmQ2hpbGRyZW4oaW5zdGFuY2UsIHZPbGROb2RlLmNoaWxkcmVuLCB2TmV3Tm9kZS5jaGlsZHJlbik7XG5cbiAgcmV0dXJuICgkbm9kZTogSFRNTEVsZW1lbnQpID0+IHtcbiAgICBpZiAoJG5vZGUubm9kZVR5cGUgPT09IDEpIHtcbiAgICAgIHBhdGNoQXR0cnMoJG5vZGUpO1xuICAgICAgcGF0Y2hDaGlsZHJlbigkbm9kZSk7XG4gICAgfVxuICAgIHJldHVybiAkbm9kZTtcbiAgfTtcbn07XG4iLCJpbXBvcnQgeyB2Tm9kZSB9IGZyb20gXCIuLi9nbG9iYWxzXCI7XG5pbXBvcnQgUG9sYXJiZWFyIGZyb20gXCIuLi9Qb2xhcmJlYXJcIjtcbmltcG9ydCB7IFJlZ2V4ZXMgfSBmcm9tIFwiLi4vZXRjL1JlZ2V4ZXNcIjtcbmltcG9ydCBjcmVhdGVFbCBmcm9tIFwiLi9DcmVhdGVFbGVtZW50XCI7XG5pbXBvcnQgY29tcHV0ZUxvb3AgZnJvbSBcIi4uL2F0dHJpYnV0ZXMvTG9vcGZvclwiO1xuaW1wb3J0IHsgZ2V0UHJvcCB9IGZyb20gXCIuLi9kYXRhL0RhdGFGbnNcIjtcbmltcG9ydCByZXNvbHZlVHlwZSBmcm9tIFwiLi4vZXRjL1Jlc29sdmVUeXBlXCI7XG5pbXBvcnQgZmlsdGVyc01hdGNoID0gUmVnZXhlcy5maWx0ZXJzTWF0Y2g7XG5pbXBvcnQgbm9ybWFsaXplU3RyaW5nIGZyb20gXCIuLi9ldGMvTm9ybWFsaXplU3RyaW5nXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGh5ZHJhdGUoaW5zdGFuY2U6IFBvbGFyYmVhciwgbm9kZTogKHZOb2RlIHwgc3RyaW5nKSwgZXh0cmFEYXRhPzogeyBba2V5OiBzdHJpbmddOiBhbnkgfSkge1xuICBjb25zdCBub2RlQ29weSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkobm9kZSkpO1xuICBjb25zdCBkYXRhID0gaW5zdGFuY2UuJGRhdGE7XG5cbiAgbGV0IG5ld1Jvb3RDaGlsZHJlbjogKHZOb2RlIHwgc3RyaW5nKVtdID0gW107XG5cbiAgbm9kZUNvcHkuY2hpbGRyZW4ubWFwKChlOiAodk5vZGUgfCBzdHJpbmcpKSA9PiB7XG4gICAgaWYgKHR5cGVvZiBlICE9PSBcInN0cmluZ1wiICYmIGUubG9vcENhc2UpIHtcbiAgICAgIGNvbnN0IHt0YWdOYW1lLCBhdHRycyA9IHt9LCBldmVudHMgPSB7fSwgY29uZGl0aW9uYWxDYXNlLCBsb29wQ2FzZSwgYm91bmREYXRhLCByZWZOYW1lLCBjaGlsZHJlbiA9IFtdfSA9IGU7XG5cbiAgICAgIGNvbnN0IHtrZXlOYW1lLCB2YWxOYW1lLCBpZHhOYW1lLCBpdGVyYWJsZSwgY291bnQsIHR5cGV9ID0gY29tcHV0ZUxvb3AoaW5zdGFuY2UsIGxvb3BDYXNlKTtcblxuICAgICAgY29uc3QgbmV3Q2hpbGRyZW4gPSBBcnJheS5mcm9tKG5ldyBBcnJheShjb3VudCksICh2LCBqKSA9PiB7XG4gICAgICAgIHJldHVybiBjcmVhdGVFbCh0YWdOYW1lLCB7XG4gICAgICAgICAgYXR0cnMsXG4gICAgICAgICAgZXZlbnRzLFxuICAgICAgICAgIGNvbmRpdGlvbmFsQ2FzZSxcbiAgICAgICAgICBsb29wQ2FzZTogbnVsbCxcbiAgICAgICAgICBib3VuZERhdGEsXG4gICAgICAgICAgcmVmTmFtZTogbnVsbCxcbiAgICAgICAgICBjaGlsZHJlbjogW2h5ZHJhdGUoaW5zdGFuY2UsIHtcbiAgICAgICAgICAgIHRhZ05hbWUsIGF0dHJzLCBldmVudHMsIGNvbmRpdGlvbmFsQ2FzZSwgbG9vcENhc2U6IG51bGwsIGJvdW5kRGF0YSwgcmVmTmFtZSwgY2hpbGRyZW5cbiAgICAgICAgICB9LCB7XG4gICAgICAgICAgICBba2V5TmFtZSB8fCBcIiRLRVlOQU1FXCJdOiB0eXBlID09PSBcImFycmF5XCIgPyBpdGVyYWJsZVtqXSA6IHR5cGUgPT09IFwib2JqZWN0XCIgPyBpdGVyYWJsZVtqXVswXSA6IGosXG4gICAgICAgICAgICBbdmFsTmFtZSB8fCBcIiRWQUxOQU1FXCJdOiB0eXBlID09PSBcImFycmF5XCIgPyBudWxsIDogdHlwZSA9PT0gXCJvYmplY3RcIiA/IGl0ZXJhYmxlW2pdWzFdIDogaixcbiAgICAgICAgICAgIFtpZHhOYW1lIHx8IFwiJElEWE5BTUVcIl06IGpcbiAgICAgICAgICB9KV1cbiAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgICAgbmV3Um9vdENoaWxkcmVuLnB1c2goLi4ubmV3Q2hpbGRyZW4pO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAocmVzb2x2ZVR5cGUoZSkgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgbmV3Um9vdENoaWxkcmVuLnB1c2goaHlkcmF0ZShpbnN0YW5jZSwgZSBhcyB2Tm9kZSwgZXh0cmFEYXRhKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCB7cGFyc2VkLCBmaWx0ZXJzfSA9IGNvbXB1dGVDb250ZW50KGluc3RhbmNlLCBlIGFzIHN0cmluZyk7XG5cbiAgICAgICAgbGV0IGZpbmFsQ29udGVudCA9IFwiXCI7XG5cbiAgICAgICAgZmluYWxDb250ZW50ID0gRnVuY3Rpb24oYFxuICAgICAgICAgICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgICAgICAgICBjb25zdCAkRVhUUkFfREFUQSA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgIHJldHVybiBcXGAke3BhcnNlZH1cXGA7XG4gICAgICAgICAgICBgKVxuICAgICAgICAgIC5jYWxsKGRhdGEsIGV4dHJhRGF0YSB8fCB7fSk7XG5cbiAgICAgICAgZmlsdGVycy5mb3JFYWNoKChmOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICBmaW5hbENvbnRlbnQgPSBGdW5jdGlvbihgXG4gICAgICAgICAgICBcInVzZSBzdHJpY3RcIjtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLiR7Zn0oXFxgJHtmaW5hbENvbnRlbnR9XFxgKTtcbiAgICAgICAgICAgIGApXG4gICAgICAgICAgICAuY2FsbChpbnN0YW5jZS4kZmlsdGVycyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIG5ld1Jvb3RDaGlsZHJlbi5wdXNoKGZpbmFsQ29udGVudCk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICBub2RlQ29weS5jaGlsZHJlbiA9IG5ld1Jvb3RDaGlsZHJlbjtcblxuICByZXR1cm4gbm9kZUNvcHk7XG59XG5cbmNvbnN0IGNvbXB1dGVDb250ZW50ID0gKGluc3RhbmNlOiBQb2xhcmJlYXIsIGNvbnRlbnQ6IHN0cmluZyk6IGFueSA9PiB7XG4gIC8vIEF0dGVtcHQgdG8gZmluZCBpbnRlcnBvbGF0aW9uIGNhbGxzIHdpdGhpbiBhbiBlbGVtZW50cyB0ZXh0IGNvbnRlbnRcbiAgY29uc3QgaW50ZXJwb2xhdGlvbk1hdGNoZXM6IFJlZ0V4cE1hdGNoQXJyYXkgPSBjb250ZW50Lm1hdGNoKFJlZ2V4ZXMuZ2xvYmFsSW50ZXJwb2xhdGlvbik7XG5cbiAgbGV0IGZpbHRlcnM6IHN0cmluZ1tdID0gW107XG5cbiAgLy8gSWYgdGhlcmUgaXMgbm8gaW50ZXJwb2xhdGlvbiBjYWxscyB0aGVuIGp1c3QgYnJlYWsgb3V0XG4gIGlmICghaW50ZXJwb2xhdGlvbk1hdGNoZXMpIHtcbiAgICByZXR1cm4ge3BhcnNlZDogY29udGVudCwgZmlsdGVyc307XG4gIH1cblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGludGVycG9sYXRpb25NYXRjaGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgLy8gUmVwbGFjZSBldmVyeSBpbnRlcnBvbGF0aW9uIGNhbGwgd2l0aCBpdHMgY29tcHV0ZWQgZXZhbHVhdGlvblxuICAgIGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UoaW50ZXJwb2xhdGlvbk1hdGNoZXNbaV0sIChjdXI6IHN0cmluZykgPT4ge1xuICAgICAgLy8gU3RyaXAgb3V0IHRoZSBmaWx0ZXJzIGlmIHRoZXkgZXhpc3RcbiAgICAgIGNvbnN0IGZpbHRlclN0ciA9IGN1ci5tYXRjaChmaWx0ZXJzTWF0Y2gpO1xuICAgICAgY3VyID0gZmlsdGVyU3RyID8gY3VyLnJlcGxhY2UoZmlsdGVyc01hdGNoLCBcIlwiKSA6IGN1cjtcblxuICAgICAgaWYgKGZpbHRlclN0cikge1xuICAgICAgICBmaWx0ZXJzID0gZmlsdGVyU3RyWzBdLnRyaW0oKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnNwbGl0KFwifFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLm1hcCgocykgPT4gbm9ybWFsaXplU3RyaW5nKHMpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmZpbHRlcigoZSkgPT4gZSAhPT0gXCJcIik7XG4gICAgICB9XG5cbiAgICAgIC8vIFJlcGxhY2UgZWFjaCBwcm9wZXJ0eSBvciBmdW5jdGlvbiBjYWxsIHdpdGhpbiB0aGUgaW50ZXJwb2xhdGlvbiB3aXRoIGEgcmVmZXJlbmNlIHRvIHRoZSBpbnN0YW5jZVxuICAgICAgY29uc3QgaW5uZXJDb250ZW50ID0gY3VyLnJlcGxhY2UoUmVnZXhlcy5pbnRlcnBvbGF0aW9uQ29udGVudCwgKHM6IHN0cmluZykgPT4ge1xuICAgICAgICBpZiAoZ2V0UHJvcChpbnN0YW5jZS4kZGF0YSwgcykgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHJldHVybiBgdGhpcy4ke3N9YDtcbiAgICAgICAgfSBlbHNlIGlmIChnZXRQcm9wKHdpbmRvdywgcykgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHJldHVybiBzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBgJEVYVFJBX0RBVEEuJHtzfWA7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gaW5uZXJDb250ZW50LnJlcGxhY2UoXCJ7e1wiLCBcIiR7XCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoXCJ9fVwiLCBcIn1cIik7XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4ge3BhcnNlZDogY29udGVudCwgZmlsdGVyc307XG59O1xuIiwiaW1wb3J0IFBvbGFyYmVhciBmcm9tIFwiLi4vUG9sYXJiZWFyXCI7XG5pbXBvcnQgeyB2Tm9kZSB9IGZyb20gXCIuLi9nbG9iYWxzXCI7XG5pbXBvcnQgY29tcHV0ZUV2ZW50IGZyb20gXCIuLi9hdHRyaWJ1dGVzL0V2ZW50c1wiO1xuaW1wb3J0IHsgZ2V0UHJvcCB9IGZyb20gXCIuLi9kYXRhL0RhdGFGbnNcIjtcbmltcG9ydCBjb21wdXRlQmluZGluZyBmcm9tIFwiLi4vYXR0cmlidXRlcy9CaW5kdmFsXCI7XG5cbmV4cG9ydCBjb25zdCByZW5kZXJFbGVtID0gKGluc3RhbmNlOiBQb2xhcmJlYXIsIHtcbiAgdGFnTmFtZSxcbiAgYXR0cnMgPSB7fSxcbiAgZXZlbnRzID0ge30sXG4gIGNvbmRpdGlvbmFsQ2FzZSxcbiAgYm91bmREYXRhLFxuICByZWZOYW1lLFxuICBjaGlsZHJlbiA9IFtdXG59OiB2Tm9kZSk6IGFueSA9PiB7XG4gIC8vIEV2YWx1YXRlIGNvbmRpdGlvbmFsIHN0YXRlbWVudCBmb3IgdGhlIGVsZW1lbnRcbiAgY29uc3QgY29uZGl0aW9uYWxFdmFsOiBib29sZWFuID0gQm9vbGVhbihGdW5jdGlvbihgXCJ1c2Ugc3RyaWN0XCI7cmV0dXJuICR7Y29uZGl0aW9uYWxDYXNlfTtgKVxuICAgIC5jYWxsKGluc3RhbmNlKSk7XG5cbiAgLy8gQ3JlYXRlIGEgY29tbWVudCBlbGVtZW50IGlmIHRoZSBjb25kaXRpb25hbCBzdGF0ZW1lbnQgaXMgZmFsc2VcbiAgaWYgKGNvbmRpdGlvbmFsQ2FzZSAmJiBjb25kaXRpb25hbEV2YWwgPT09IGZhbHNlKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZUNvbW1lbnQoXCIgXCIpO1xuICB9XG5cbiAgLy8gQ3JlYXRlIGEgYmFzZSBlbGVtZW50IHdpdGggc3BlY2lmaWVkIHRhZyB0eXBlXG4gIGNvbnN0ICRlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnTmFtZSk7XG5cbiAgLy8gQWRkIGVsZW1lbnQgYXR0cmlidXRlc1xuICBmb3IgKGNvbnN0IFtrLCB2XSBvZiBPYmplY3QuZW50cmllcyhhdHRycykpIHtcbiAgICAkZWwuc2V0QXR0cmlidXRlKGssIHYpO1xuICB9XG5cbiAgLy8gQWRkIGVsZW1lbnQgZXZlbnRzXG4gIGZvciAoY29uc3QgW2ssIHZdIG9mIE9iamVjdC5lbnRyaWVzKGV2ZW50cykpIHtcbiAgICBjb25zdCB7ZXZlbnROYW1lLCBmbiwgb3RoZXJFdmVudE1vZGlmaWVyc30gPSBjb21wdXRlRXZlbnQoaW5zdGFuY2UsIGssIHYpO1xuICAgICRlbC5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgZm4sIG90aGVyRXZlbnRNb2RpZmllcnMpO1xuICB9XG5cbiAgLy8gUmVuZGVyIGFuZCBhcHBlbmQgZWxlbWVudCBjaGlsZHJlblxuICBmb3IgKGNvbnN0IGNoaWxkIG9mIGNoaWxkcmVuKSB7XG4gICAgY29uc3QgJGNoaWxkID0gcmVuZGVyKGluc3RhbmNlLCBjaGlsZCk7XG4gICAgJGVsLmFwcGVuZENoaWxkKCRjaGlsZCk7XG4gIH1cblxuICBpZiAoYm91bmREYXRhICYmICRlbCBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpIHtcbiAgICBjb25zdCB7cHJvcCwgb3B0c30gPSBib3VuZERhdGE7XG5cbiAgICAkZWwudmFsdWUgPSBnZXRQcm9wKGluc3RhbmNlLCBwcm9wKTtcblxuICAgIGNvbnN0IHtldmVudE5hbWUsIGZufSA9IGNvbXB1dGVCaW5kaW5nKGluc3RhbmNlLCBwcm9wLCBvcHRzKTtcbiAgICAkZWwuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGZuKTtcbiAgfVxuXG4gIGlmIChyZWZOYW1lKSB7XG4gICAgaW5zdGFuY2UuJHJlZnNbcmVmTmFtZV0gPSAkZWw7XG4gIH1cblxuICAvLyBSZXR1cm4gdGhlIGNyZWF0ZWQgZWxlbWVudFxuICByZXR1cm4gJGVsO1xufTtcblxuZXhwb3J0IGNvbnN0IHJlbmRlciA9IChpbnN0YW5jZTogUG9sYXJiZWFyLCB2Tm9kZTogdk5vZGUgfCBzdHJpbmcpOiBhbnkgPT4ge1xuICBpZiAodHlwZW9mIHZOb2RlID09PSBcInN0cmluZ1wiKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHZOb2RlKTtcbiAgfVxuICByZXR1cm4gcmVuZGVyRWxlbShpbnN0YW5jZSwgdk5vZGUpO1xufTtcbiJdfQ==
