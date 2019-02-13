# array-sort-compare

> Generic type-aware compare function for `Array.prototype.sort()` and sortDeep.

[![Build Status](https://travis-ci.org/kimmobrunfeldt/array-sort-compare.svg?branch=master)](https://travis-ci.org/kimmobrunfeldt/array-sort-compare)

[![NPM Badge](https://nodei.co/npm/array-sort-compare.png?downloads=true)](https://www.npmjs.com/package/array-sort-compare)

JavaScript arrays are sorted using string comparison by default, because that's what the spec says.
This is an issue when sorting an array which has mixed types.

**Before**

```js
> const arr = [["a", 10, 1], ["a", 2, 1]]
> arr.sort()

[ [ 'a', 10, 1 ], [ 'a', 2, 1 ] ]  // 10 is before 2, and 2nd-level arrays are not sorted
```

**After**

```js
> const { sortDeep, compare } = require('array-sort-compare')
> const arr = [["a", 10, 2], ["a", 2, 1]]
> sortDeep(arr, compare())

[ [ 1, 2, 'a' ], [ 2, 10, 'a' ] ]
```

You can also use just the [compareFunction](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#Parameters)
provided by this module. This doesn't sort nested arrays though:

```js
> const { compare } = require('array-sort-compare')
> const arr = [["a", 10], ["a", 2]]
> arr.sort(compare())

[ [ 'a', 2 ], [ 'a', 10 ] ]
```

The [tests](test/test-all.js) contain good examples of how it works. **Warning:** no performance
tests have been ran against the module.


## Other usage examples

### Descending order

```js
const { sortDeep, compare } = require('array-sort-compare')
const arr = [["a", 10, 2], ["a", 2, 1]]
sortDeep(arr, compare('desc'))
```

### Changing the order between types

```js
const { sortDeep, compare } = require('array-sort-compare')
const arr = [["a", 10, 2], ["a", 2, 1]]
sortDeep(arr, compare({
  // Sort booleans first as an example
  typeOrder: ['boolean', 'number', 'string', 'array', 'object', 'null', 'undefined']
}))
```

### Extending types

```js
const isPlainObject = require('lodash.isplainobject')
const { sortDeep, compare } = require('array-sort-compare')

const arr = [{ day: 'TUESDAY', value: 1}, { day: 'MONDAY', value: 0}]
sortDeep(arr, compare({
  // Our new category of objects (type) is called 'weekday'
  // It's an object looking like this:
  // { day: 'MONDAY', value: 0 }
  typeOrder: ['weekday', 'number', 'string', 'boolean', 'array', 'object', 'null', 'undefined'],
  typeCheckers: {
    // the 'weekday' key needs to match the string in typeOrder
    weekday: obj => isPlainObject(obj) && obj.hasOwnProperty('day') && obj.hasOwnProperty('value')
  },
  typeComparers: {
    // the 'weekday' key needs to match the string in typeOrder
    weekday: (a, b) => a.value - b.value
  }
}))
```


## API

### sortDeep(array, [compareFunction])

Sorts given array in-place. Similar to `Array.prototype.sort()`, but also recursively sorting nested
arrays inside the array.

Recommended way to use `.sortDeep()` is together with the `.compare()` function:

```js
const { sortDeep, compare } = require('array-sort-compare')
const arr = [["a", 10, 2], ["a", 2, 1]]
sortDeep(arr, compare())
```

Would result to `[[1, 2, 'a'], [2, 10, 'a' ]]`.

#### compareFunction

Specifies a function that defines the sort order. If omitted, the array is sorted by default
`Array.prototype.sort()` behavior. The default sorting is done according to
each character's Unicode code point value, according to the string conversion of each element.
See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort.


### compare([opts])

Returns a comparator `Function` which can be passed to `Array.sort()`.

#### opts

Can be either a `string` describing the sorting direction or a configuration object. Default: `"asc"`.

Valid `string` values:

* `asc` Sort in ascending order
* `desc` Sort in descending order

The default `object` configuration. Useful for advanced use cases such as specifying a custom order
between types or even adding new types.

```js
{
  // Sorting direction. Valid values are 'asc' and 'desc'.
  // Note: this doesn't affect the order of different types defined in `opts.typeOrder`
  direction: 'asc',

  // These type names is a categorization of this module. The names can be anything, as long
  // as counterparts are found from `opts.typeCheckers` and `opts.typeComparers`.
  typeOrder: ['number', 'string', 'boolean', 'array', 'object', 'null', 'undefined'],

  // Functions which detect given types. The function receives an object of unknown type as the
  // first parameter and returns true if it matches the type. For example
  // { number: obj => typeof obj === 'number' }
  //
  // Note: the given object is *merged* to the default opts.typeCheckers
  typeCheckers: {
    number: _.isNumber,
    string: _.isString,
    boolean: _.isBoolean,
    array: _.isArray,
    object: _.isPlainObject,
    null: _.isNull,
    undefined: _.isUndefined,
  },

  // Compare functions for each type. For default cases the signature is the same as
  // Array.prototype.sort(), see
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#Description
  // In addition to that, the compare function receives a third positional argument `genericCompare`,
  // which can be used for sorting nested structures such as arrays (recursion).
  // See test/test-all.js for an advanced. example
  //
  // Simple example:
  // { number: (a, b) => a - b }
  //
  // Note: the given object is *merged* to the default opts.typeComparers
  typeComparers: {
    number: numberCompare,
    string: stringCompare,
    boolean: numberCompare,
    array: arrayCompare,
    // object, null and undefined are all using default comparison which considers
    // everything equal. For example two nulls are considered equal
  },

  // Always use 'asc' for these type. Required for recursively sorted "container" types
  ignoreDirectionOfTypes: ['array']
}
```

## Install

```bash
npm install array-sort-compare
```


## Resources

* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
* What the spec says about the default compare function: http://www.ecma-international.org/ecma-262/6.0/#sec-sortcompare
* https://stackoverflow.com/questions/47334234/how-to-implement-array-prototype-sort-default-compare-function


## License

MIT
