# array-sort-compare

> Generic compare function for `Array.prototype.sort()`

[![Build Status](https://travis-ci.org/kimmobrunfeldt/array-sort-compare.svg?branch=master)](https://travis-ci.org/kimmobrunfeldt/array-sort-compare) *Build status for master*

[![NPM Badge](https://nodei.co/npm/array-sort-compare.png?downloads=true)](https://www.npmjs.com/package/array-sort-compare)

**Warning: no performance tests have been ran against the module. It has been created purely for display purposes.**

JavaScript arrays are sorted using string comparison by default, because that's what the spec say.
This is an issue when sorting an array which as numbers and strings mixed:

This module is a [compareFunction](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#Parameters)
which sorts the items by considering types. The

**Before**
```js
> const arr = [["a", 10], ["a", 2]]
> arr.sort()
[ [ 'a', 10 ], [ 'a', 2 ] ]  // 10 is before 2
```

**After**
```js
> const compare = require('array-sort-compare')
> const arr = [["a", 10], ["a", 2]]
> arr.sort(compare())
[ [ 'a', 2 ], [ 'a', 10 ] ]
```

The [tests](test/test-all.js) contain good examples of how it works.

## Usage examples

### Simple

```js
const compare = require('array-sort-compare')
const arr = [["a", 10], ["a", 2]]
arr.sort(compare())
```

## API

### compare([opts])

Returns a comparator `Function` which can be passed to `Array.sort()`.

#### opts

Can be either a `string` describing the sorting direction or a configuration object. Default: `"asc"`.

Valid `string` values:

* `asc` Sort in ascending order
* `desc` Sort in descending order

The default `object` configuration:

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


## License

MIT
