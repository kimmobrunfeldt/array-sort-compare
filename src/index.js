// Detecting types in different JS environments requires checks which I prefer to keep in external
// modules
const _ = {
  isNumber: require('lodash.isnumber'),
  isString: require('lodash.isstring'),
  isBoolean: require('lodash.isboolean'),
  isArray: require('lodash.isarray'),
  isPlainObject: require('lodash.isplainobject'),
  isNull: require('lodash.isnull'),
  isUndefined: require('lodash.isundefined'),
  isDate: require('lodash.isdate'),
  findIndex: require('lodash.findindex'),
  includes: require('lodash.includes'),
}

// Decides the order of different types
const TYPE_ORDER = [
  'number',
  'string',
  'boolean',
  'date',
  'array',
  'object',
  'null',
  'undefined',
]

const TYPE_CHECKERS = {
  number: _.isNumber,
  string: _.isString,
  boolean: _.isBoolean,
  date: _.isDate,
  array: _.isArray,
  object: _.isPlainObject,
  null: _.isNull,
  undefined: _.isUndefined,
}

function numberCompare(a, b) {
  if (a < b) {
    return -1
  } else if (a > b) {
    return 1
  }

  return 0
}

function stringCompare(a, b) {
  return a.localeCompare(b)
}

function dateCompare(a, b) {
  return a.getTime() - b.getTime()
}

function arrayCompare(a, b, genericCompare) {
  // If we're going out of array bounds the value (e.g. a[i]) will be undefined, which should
  // lead to correct result
  for (let i = 0; i < a.length || i < b.length; ++i) {
    const compareResult = genericCompare(a[i], b[i])
    if (compareResult !== 0) {
      return compareResult
    }
  }

  return 0
}

function getObjectScore(obj1, obj2, genericCompare) {
  let score = 0;
  for (let key in obj1) {
    if (obj1.hasOwnProperty(key)) {
      const compareResult = genericCompare(obj1[key], obj2[key])
      if (compareResult < 0) {
        score -= 1
      } else if (compareResult > 0) {
        score += 1
      }
    }
  }
  return score
}

function objectCompare(a, b, genericCompare) {
  let aScore = getObjectScore(a, b, genericCompare);
  let bScore = getObjectScore(b, a, genericCompare);

  if (aScore > bScore) {
    return 1
  } else if (aScore < bScore) {
    return -1
  }

  return 0
}

const TYPE_COMPARERS = {
  number: numberCompare,
  string: stringCompare,
  boolean: numberCompare,
  date: dateCompare,
  array: arrayCompare,
  object: objectCompare,
  // null and undefined are all using default comparison
  // For example two nulls are compared equal
}

function getTypeIndex(obj, opts) {
  const index = _.findIndex(opts.typeOrder, (typeName) => {
    const isTypeMatch = opts.typeCheckers[typeName](obj)
    return isTypeMatch
  })
  // If type was not found, it should get the worst "score"
  return index === -1 ? opts.typeOrder.length : index
}

// https://stackoverflow.com/questions/47334234/how-to-implement-array-prototype-sort-default-compare-function
// http://www.ecma-international.org/ecma-262/6.0/#sec-sortcompare
function createComparator(mixedOpts) {
  let _opts
  if (!mixedOpts) {
    _opts = {}
  } else if (_.isString(mixedOpts)) {
    _opts = { direction: mixedOpts }
  } else {
    _opts = mixedOpts
  }

  const opts = Object.assign({
    direction: 'asc',
    typeOrder: TYPE_ORDER,
    ignoreDirectionOfTypes: ['array']
  }, _opts)

  opts.typeCheckers = Object.assign({}, TYPE_CHECKERS, opts.typeCheckers)
  opts.typeComparers = Object.assign({}, TYPE_COMPARERS, opts.typeComparers)

  function genericCompare(a, b) {
    const aTypeIndex = getTypeIndex(a, opts)
    const bTypeIndex = getTypeIndex(b, opts)
    if (aTypeIndex !== bTypeIndex) {
      return aTypeIndex - bTypeIndex
    }

    const typeName = opts.typeOrder[aTypeIndex]
    if (!opts.typeComparers.hasOwnProperty(typeName)) {
      return 0
    }

    const compare = opts.typeComparers[typeName]
    const result = compare(a, b, genericCompare)

    const ignoreDirection = _.includes(opts.ignoreDirectionOfTypes, typeName)
    if (!ignoreDirection && opts.direction === 'desc') {
      return -result
    }

    return result
  }

  return genericCompare
}

// Depth-first, so that the inner arrays are sorted first and then moving "layer by layer"
// up.
function sortDeep(arr, compareFunc) {
  for (let i = 0; i < arr.length; ++i) {
    if (_.isArray(arr[i])) {
      sortDeep(arr[i], compareFunc)
    }
  }

  return arr.sort(compareFunc)
}

module.exports = {
  compare: createComparator,
  sortDeep,
  TYPE_ORDER,
  TYPE_CHECKERS,
  TYPE_COMPARERS,
}
