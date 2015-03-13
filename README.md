[![Build Status](https://travis-ci.org/ssnau/duckie.svg)](https://travis-ci.org/ssnau/duckie)

duckie
------
A Javascript type annotation and assertion library with no dependecies. 
You can make it work anywhere as long as you have es5 shimed your environment.

Example
--------
```
var T = require('duckie');
T.array.test([1,2,3]) // true
T.array.test('123') // false

T.objectOf({
  name: String
}).test({name: 'jack'})  // true

T.arrayOf({
  name: String
}).test([{name: 'jack'}]) //true
```

Why I create duckie?
--------

Javascript is a dynamic type language and it is hard to know the data structure of a parmameter. For example:

```
function post(data) {
  // the code may access different field of data
  // in different part and you don't know what exactly
  // the function want util you throughly read the code
}
```

Of course, you can use JSDoc to annotate it. As below:

```
/**
 *
 * @param {
 */
function post(data) {

}
```

There are 4 weakness in JSDoc:

- It is hard to rememeber and learn the grammar of JSDoc annotation.
- You cannot annotate complex data structure in a single line.
- JSDoc wont do runtime check for you.
- It is a bundle for you to write JSDoc without an IDE.

With duckie, it will ease all of your pain. Defining types is just like defining an object.

```
function post(data) {
  T.ArrayOf({
    name: String,
    age: Number
  }).assert(data); // if data doesn't fit the type, it will throw error
}
```

So that's why duckie comes out.

Quick Start
--------

#### Intro

All the type-checker below will contain 2 functions:

- `test` will return a boolean to indicate if the val belongs to the type
- `assert` will throw an error if the val doesn't belong to the type

> For example: `T.array.test('abcd')` will return false, and `T.array.assert('abcd')` will throw an error.


#### Basic Type

There are 8 basic types for you to directly use. They are `bool`, `string`, `number`, `undefined`, `null`, `array`, `object`, `anything`.

- `bool`, any value is `true` or `false`. `T.bool.test(true)` will get `true` and `T.bool.test(123)` will get `false`.
- `string`, any value is a string. `T.string.test('abc')` will get `true` and `T.string.test(124)` will get `false`.
- `number`, any value is a valid number or `NaN`.
- `undefined`, value exactly equals to undefined.
- `null`, value exactly equals to null.
- `array`, any value with `Array.isArray(value)` to be true.
- `object`, any value with `Object` in its proto chain.
- `anything`, any value. `T.anything.test(/*anything*/)` will always return `true`.

#### Conditional Type

- `oneOf(Array)`, any value that is one of the enums.
```
T.OneOf(['a', 'b', 'c']).test('a') // true
T.OneOf([1, 2, ,3]).test('a')      // false
```
- `oneOfType([Type1, Type2..TypeN])`, any value that belongs to one of the listed types.
```
T.oneOfType([String, Array]).test('abc') // true
T.oneOfType([String, Array]).test([]) // true
T.oneOfType([String, Array]).test(123) //false
```
- `maybe(Type)`, any value that belongs to the type or exactly equals to `undefined` or `NaN`.
```
T.maybe(String).test('abc') //true
T.maybe(String).test(null)  // true
T.maybe(String).test(undefined) //true
T.maybe(String).test(1)   // false
```

#### Composite Type

- `arrayOf(Type)`, any value that is an array and all the items in the array is type `Type`
```
T.arrayOf(String).test(['abc', 'bcd']) //true
T.arrayOf(String).test(['abc', 1])     // false, because there is a number 1 which isn't of type String
T.arrayOf(maybe(String)).test(['abc', null])  //true, it means array can contain string(s) or null/undefined(s)
```
- `objectOf(/*definition*/)`, an object that contains the structure described with `definition`.
```
T.objectOf({name: String}).test({name: 'jack'})   // true
T.objectOf({name: String}).test({name: 'jack', age: 18}) // true, because it only check duck type
T.objectOf({name: String, gender: String).test({name: 'jack'}) //false, because it not contain gender
// how to describe if a field is optional? use maybe
T.objectOf({name: String, age: T.maybe(Number)}).test({name: 'jack'}) // true, because age is optional
```

#### Complex Type
How to desribe a data structure that:

- is an array.
- each item is a `Person`
- the definition of `Person` is: it has a name as String, age as Number and hobbies as Array of String.

Obviously, we can combine `arrayOf` and `ObjectOf` together to achieve the goal.

```
// first, build an array with person type
T.arrayOf(Person)

// second, investigate Person type
T.objectOf({
  name: String,
  age:  Number,
  hobbies: arrayOf(String)
})

// finally, combine them and we get
T.arrayOf(T.objectOf{
  name: String,
  age:  Number,
  hobbies: arrayOf(String)
})
```
Do you find it a little verbose? It looks like we are using something DSL rather than use JS. Why can't we define data structure just as defining data itself? The answer is: Yes, we can.

For `arrayOf` and `objectOf`, you don't need to wrap any `type checker` for inner definitions. It means:

```
T.arrayOf(T.objectOf({
  name: String
}))

is just the same as:

T.arrayOf({
  name: String
})
```

so the complex definition of `T.arrayOf(Person)` can be written as:

```
T.arrayOf({  // omitting the objectOf makes your code cleaner
  name: String,
  age:  Number,
  hobbies: [String]  // you can defined the ArrayOf(String) as [String]
})
```

#### Shortcut

For the reason we may want to defined the data structure just like defining the data itself. We can use `T(Type)` to create a type checker. For Example:

```
T([]).test([1,2,3]) // the same as T.array.test([1,2,3])
T([Number]).test([1,2,3]) // the same as T.arrayOf(Number).test([1,2,3])
T({name: String}).test({name: 'jack'})  // the same as T.objectOf({name: String}).test({name: 'jack'})
```
> CAUTION: `T([Number, String])` still means `T.arrayOf(Number)` because we tend to think all the items in the array should be the same type and expression `T([Number, String])` doesn't make any sense.

#### License

MIT
