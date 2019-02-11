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
const typeOrder = [
  'number',
  'string',
  'boolean',
  'date',
  'array',
  'object',
  'null',
  'undefined',
]

const typeCheckers = {
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

const typeComparers = {
  number: numberCompare,
  string: stringCompare,
  boolean: numberCompare,
  date: dateCompare,
  array: arrayCompare,
  // object, null and undefined are all using default comparison
  // For example two nulls are compared equal
  // This behavior might not be ideal for objects, but couldn't
  // figure out any other criteria either.
  // Should objects be for example sorted by they key length?
}

function getTypeIndex(obj) {
  const index = _.findIndex(typeOrder, (typeName) => {
    const isTypeMatch = typeCheckers[typeName](obj)
    return isTypeMatch
  })
  // If type was not found, it should get the worst "score"
  return index === -1 ? typeOrder.length : index
}

// https://stackoverflow.com/questions/47334234/how-to-implement-array-prototype-sort-default-compare-function
// http://www.ecma-international.org/ecma-262/6.0/#sec-sortcompare
function createComparator(opts) {
  function genericCompare(a, b) {
    const aTypeIndex = getTypeIndex(a)
    const bTypeIndex = getTypeIndex(b)
    if (aTypeIndex !== bTypeIndex) {
      return aTypeIndex - bTypeIndex
    }

    const typeName = typeOrder[aTypeIndex]
    if (!typeComparers.hasOwnProperty(typeName)) {
      return 0
    }

    const compare = typeComparers[typeName]
    if (_.includes(opts.ignoreDirectionOfTypes, typeName)) {
      return compare(a, b, genericCompare)
    }

    const aDir = opts.direction === 'asc' ? a : b
    const bDir = opts.direction === 'asc' ? b : a
    return compare(aDir, bDir, genericCompare)
  }

  return genericCompare
}

function main(mixedOpts) {
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
    typeOrder,
    typeCheckers: Object.assign({}, typeCheckers, _opts.typeCheckers),
    typeComparers: Object.assign({}, typeComparers, _opts.typeComparers),
    ignoreDirectionOfTypes: ['array']
  }, _opts)

  return createComparator(opts)
}

function sortDeep(arr, compareFunc) {
  arr.forEach((item) => {
    if (_.isArray(item)) {
      item.sort(compareFunc)
    }
  })
  arr.sort(compareFunc)
}

module.exports = {
  compare: main,
  sortDeep,
}
