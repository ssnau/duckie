[![Build Status](https://travis-ci.org/ssnau/duckie.svg)](https://travis-ci.org/ssnau/duckie)

duckie
------
A Javascript type annotation and assertion library with no dependecies. 
You can make it work anywhere as long as you have es5 shimed your environment.

Install
--------

For node/browserify/webpack user, use npm install.
```
npm install duckie
```
For client user, please download the dist file in the `build` directory.

Example
--------
```js
var duckie = require('duckie');
duckie.array.test([1,2,3]) // true
duckie.array.test('123') // false

duckie.objectOf({
  name: String
}).test({name: 'jack'})  // true

duckie.arrayOf({
  name: String
}).test([{name: 'jack'}]) //true
```

Example
--------

With duckie, it will ease all of your pain. Defining types is just like defining an object.

```js
function post(data) {
  duckie.ArrayOf({
    name: String,
    age: Number
  }).assert(data); // if data doesn't fit the type, it will throw error
}
```

Quick Start
--------

#### Intro

All the type-checker below will contain 2 functions:

- `test` will return a boolean to indicate if the val belongs to the type
- `assert` will throw an error if the val doesn't belong to the type

> For example: `duckie.array.test('abcd')` will return false, and `duckie.array.assert('abcd')` will throw an error.


#### Basic Type

There are 8 basic types for you to directly use, they are:

- `bool`
- `string`
- `number`
- `undefined`
- `null`
- `array`
- `object`
- `anything`, means any value.

example:
```js
duckie.bool.test(true)  => true
duckie.number.test(123) => true
duckie.array.test([1,2,3]) => true
duckie.array.test('hello') => false
```

#### Conditional Type

- `oneOf(Array)`, any value that is one of the enums.
```js
duckie.OneOf(['a', 'b', 'c']).test('a') // true
duckie.OneOf([1, 2, ,3]).test('a')      // false
```
- `oneOfType([Type1, Type2..TypeN])`, any value that belongs to one of the listed types.
```js
duckie.oneOfType([String, Array]).test('abc') // true
duckie.oneOfType([String, Array]).test([]) // true
duckie.oneOfType([String, Array]).test(123) //false
```
- `maybe(Type)`, any value that belongs to the type or exactly equals to `undefined` or `NaN`.
```js
duckie.maybe(String).test('abc') //true
duckie.maybe(String).test(null)  // true
duckie.maybe(String).test(undefined) //true
duckie.maybe(String).test(1)   // false
```

#### Composite Type

- `arrayOf(Type)`, any value that is an array and all the items in the array is type `Type`
```js
duckie.arrayOf(String).test(['abc', 'bcd']) //true
duckie.arrayOf(String).test(['abc', 1])     // false, because there is a number 1 which isn't of type String
duckie.arrayOf(duckie.maybe(String)).test(['abc', null])  //true, it means array can contain string(s) or null/undefined(s)
```
- `objectOf(/*definition*/)`, an object that contains the structure described with `definition`.
```js
duckie.objectOf({name: String}).test({name: 'jack'})   // true
duckie.objectOf({name: String}).test({name: 'jack', age: 18}) // true, because it only check duck type
duckie.objectOf({name: String, gender: String).test({name: 'jack'}) //false, because it not contain gender
// how to describe if a field is optional? use maybe
duckie.objectOf({name: String, age: T.maybe(Number)}).test({name: 'jack'}) // true, because age is optional
```

#### Complex Type
How to desribe a data structure that:

- is an array.
- each item is a `Person`
- the definition of `Person` is: it has a name as String, age as Number and hobbies as Array of String.

Obviously, we can combine `arrayOf` and `ObjectOf` together to achieve the goal.

```js
// first, build an array with person type
duckie.arrayOf(Person)

// second, investigate Person type
duckie.objectOf({
  name: String,
  age:  Number,
  hobbies: duckie.arrayOf(String)
})

// finally, combine them and we get
duckie.arrayOf(duckie.objectOf{
  name: String,
  age:  Number,
  hobbies: duckie.arrayOf(String)
})
```
Do you find it a little verbose? It looks like we are using something DSL rather than use JS. Why can't we define data structure just as defining data itself? The answer is: Yes, we can.

For `arrayOf` and `objectOf`, you don't need to wrap any `type checker` for inner definitions. It means:

```js
duckie.arrayOf(duckie.objectOf({
  name: String
}))

is just the same as:

duckie.arrayOf({
  name: String
})
```

so the complex definition of `T.arrayOf(Person)` can be written as:

```js
duckie.arrayOf({  // omitting the objectOf makes your code cleaner
  name: String,
  age:  Number,
  hobbies: [String]  // you can defined the ArrayOf(String) as [String]
})
```

#### Shortcut

For the reason we may want to defined the data structure just like defining the data itself. We can use `duckie(Type)` to create a type checker. For Example:

```js
duckie([]).test([1,2,3]) // the same as duckie.array.test([1,2,3])
duckie([Number]).test([1,2,3]) // the same as duckie.arrayOf(Number).test([1,2,3])
duckie({name: String}).test({name: 'jack'})  // the same as duckie.objectOf({name: String}).test({name: 'jack'})
```
> CAUTION: `duckie([Number, String])` still means `duckie.arrayOf(Number)` because we tend to think all the items in the array should be the same type and expression `duckie([Number, String])` doesn't make any sense.

#### License

MIT
