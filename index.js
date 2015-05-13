var curKey = '';
// custom stringify
function stringify(object) {
      switch (true) {
      case (object === null || object === undefined || object !== object):
        return object + '';
      case Array.isArray(object):
        return "[" + object.map(function(item) {return stringify(item);}).join(', ') + "]";
      case (typeof object === "object"):
      return "{" + Object.keys(object).map(function(key) {
          return  '"' + key + '": '  + stringify(object[key]);
        }).join(',') + "}";
      case (typeof object === 'string'):
        return '"' + object + '"';
      // type 
      case (object === String):
        return 'String';
      case (object === Boolean):
        return 'Boolean';
      case (object === Function):
        return 'Function';
      case (object === Number):
        return 'Number';
      default:
        return object + "";
      }
}

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
    "function": function (obj) {
        return typeof obj === 'function';
    },
    /**
     *  null is Object, but undefined isn't.
     */
    "object": function (obj) {
        return typeof obj === 'object';
    },
    "anything": function () {
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
            if (!Array.isArray(obj)) { return false; }

            return obj.every(function (item, index) {
                curKey = index;
                return fn(item);
            });
        }, function () {
            return 'arrayOf(' + stringify(t) + ')';
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
        return wrap(function (obj) {
            if (!obj) { return false; }
            return Object.keys(desc).every(function (key) {
                curKey = key;
                return getTypeFn(desc[key])(obj[key]);
            });
        }, function() {
            return 'objectOf(' + stringify(desc) + ')';
        });
    },
    instanceOf: function (constructor) {
        return wrap(function (obj) {
            return obj instanceof constructor;
        }, function () {
            return 'instanceOf(' + constructor + ')';
        });
    },
    oneOf: function (enums) {
        return wrap(function (obj) {
            return enums.indexOf(obj) !== -1;
        }, function () {
            return 'oneOf(' + enums.map(function(item) {stringify(item);}) + ')';
        });
    },
    oneOfType: function (types) {
        return wrap(function (obj) {
            return types.some(function (t) {
                return getTypeFn(t)(obj);
            });
        }, function () {
            return 'oneOfType(' + types.map(function(type) { stringify(type);}) + ')';
        });
    },
    mayBe: function (t) {
        return wrap(function (obj) {
            return obj === null || obj === void 0 || getTypeFn(t)(obj);
        }, function () {
            return 'mayBe(' + stringify(t) + ')';
        });
    }
};

['bool', 'function', 'string', 'number', 'undefined', 'array', 'anything', 'object', 'null'].forEach(function(name) {
    proto[name] = wrap(proto[name], function(){return name;});
});
// aliasing
[
    ['boolean', 'bool'],
    ['maybe', 'mayBe'],
    ['*', 'anything']
].forEach(function (pair) {
        proto[pair[0]] = proto[pair[1]];
});

/**
 * wrap a function to symbolize it as a type fn.
 */
function wrap(fn, toString) {
    fn._isTypeFn = true;
    fn.test = function (obj) {
        return proto.is(obj, fn);
    };
    fn.assert = function (obj, msg) {
        return proto.assert(obj, fn, msg);
    };
    fn.toString = toString;
    return fn;
}

/**
 * 1. input is one of the type functions up there
 * 2. input is one of String|Number|Boolean|Function|undefined|null
 * 3. input is one of string that cantains type info
 * 4. input is shortcut of arrayOf|objectOf
 */
function getTypeFn(input) {
    /*jshint maxcomplexity:18 */
    // #1
    if (input && input._isTypeFn) { return input; }
    // #2
    switch (input) {
        case null:
            return proto['null'];
        case void 0:
            return proto['undefined'];
        case Object:
            return proto['object'];
        case Array:
            return proto['array'];
        case String:
            return proto['string'];
        case Number:
            return proto['number'];
        case Boolean:
            return proto['bool'];
        case Function:
            return proto['function'];
    }
    // #3
    if (typeof input === 'string' && input.length) {
        if (proto[input.toLowerCase()]) {
            return proto[input.toLowerCase()];
        }
        if (input.indexOf('|') === -1 && input.indexOf('?') === -1) {
            throw new Error(input + " type is not a valid type");
        }
        var isOptional = input.indexOf('?') > -1;
        var types = input.replace('?', '').split('|');
        var type = types.length > 1 ? proto.oneOfType(types.map(getTypeFn)) : getTypeFn(types[0]);
        return isOptional ? proto.maybe(type) : type;
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

function extend(dest, source) {
    Object.keys(source).forEach(function (key) {
        dest[key] = source[key];
    });
    return dest;
}

// add assert and is for proto
extend(proto, {
    assert: function (obj, type, msg) {
        curKey = '';
        if (!proto.is(obj, type)) {
            var m = (JSON.stringify(obj) + ' is not of type ' + stringify(type));
            if (curKey) {
                m += '( key: @key )'.replace('@key', curKey);
            }
            throw new Error(msg || m);
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
