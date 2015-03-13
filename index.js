var proto = {
  // basic type checkers
  "bool": function (obj) {
      return typeof obj === 'boolean';
  },
  "string": function (obj) {
      return typeof obj === 'string';
  },
  "number": function (obj) {
      return typeof obj === 'number';
  },
  "undefined": function (obj) {
      return obj === void 0;
  },
  "null": function (obj) {
      return obj === null;
  },
  "array": function (obj) {
      return Array.isArray(obj);
  },
  /**
   *  null is Object, but undefined isn't.
   */
  "object": function (obj) {
     return typeof obj === 'object';
  },
  "anything": function() {
      return true;
  },
  
  /**
   * ArrayOf(Number),
   * ArrayOf({
   *    name: Typeof.String,
   *    value: Typeof.Number
   * });
   * ArrayOf("number");
   *
   */
  arrayOf: function (t) {
    var fn = getTypeFn(t);
    return wrap(function (obj) {
      if (!Array.isArray(obj)) return false;

      return obj.every(function(item){
        return fn(item);
      });
    });
  },
  /**
   * duck type object:
   * ObjectOf({
   *   name: String,
   *   age: Number
   * })
   * ObjectOf({
   *   name: "string",
   *   age: "number"
   * })
   */
  objectOf: function (desc) {
    return wrap(function(obj) {
      return Object.keys(desc).every(function(key) {
            return getTypeFn(desc[key])(obj[key]);
      });
    });
  },
  instanceOf: function (constructor) {
    return wrap(function (obj) {
      return obj instanceof constructor;
    });
  },
  oneOf: function (enums) {
    return wrap(function (obj) {
      return enums.indexOf(obj) !== -1;
    })
  },
  oneOfType: function (types) {
    return wrap(function(obj) {
      return types.some(function(t) {
        return getTypeFn(t)(obj);
      });
    });
  },
  mayBe: function (t) {
    return wrap(function (obj) {
      return obj === null || obj === void 0 || getTypeFn(t)(obj);
    });
  }
};

// aliasing
[
  ['boolean', 'bool'],
  ['maybe', 'mayBe'],
  ['*', 'anything'],
].forEach(function(pair){
  proto[pair[0]] = proto[pair[1]];
});

/**
 * wrap a function to symbolize it as a type fn.
 */
function wrap(fn) {
  fn._isTypeFn = true;
  fn.test = function (obj) { return proto.is(obj, fn); };
  fn.assert = function (obj, msg) { return proto.assert(obj, fn, msg); };
  return fn;
}

/**
 * 1. input is one of the type functions up there
 * 2. input is one of String|Number|Boolean|Function|undefined|null
 * 3. input is one of string that excatly cantains type info
 * 4. input is shortcut of arrayOf|objectOf
 */
function getTypeFn(input) {
  // #1
  if (input && input._isTypeFn) return input;
  // #2
  switch (input) {
    case null:
      return proto['null'];
    case void 0:
      return proto.undefined;
    case Object:
      return proto.object;
    case Array:
      return proto.array;
    case String:
      return proto.string;
    case Number:
      return proto.number;
    case Boolean:
      return proto.bool;
    case Function:
      return proto['function'];
  }
  // #3
  if (typeof input === 'string' && proto[input.toLowerCase()]) {
    return proto[input.toLowerCase()];
  }

  // #otherwise, shortcut for Array/Object
  if (Array.isArray(input)) {
    return proto.arrayOf(input.length ? input[0] : proto.anything);
  }
  if (typeof input === 'object') {
    return  proto.objectOf(input);
  }

  // #finally
  throw new Error(input + " is not a valid type annotation.");
}

Object
  .keys(proto)
  .map(function(key) {
    return proto[key];
  })
  .filter(function(fn){
    return typeof fn === 'function';
  })
  .forEach(wrap);

function extend(dest, source) {
  Object.keys(source).forEach(function(key){
    dest[key] = source[key];
  });
  return dest;
}
// add assert and is for proto
extend(proto, {
  assert: function (obj, type, msg) {
    if (typeof console !== 'undefined' && console.assert) {
      console.assert(proto.is(obj, type), msg || 'obj is not of type ' + type);
    }
  },
  is: function (obj, type) {
    return getTypeFn(type)(obj);
  }
});

function T(checker) {
  return getTypeFn(checker);
}
extend(T, proto);

module.exports = T;
