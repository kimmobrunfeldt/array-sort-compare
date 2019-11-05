// Test basic usage of cli

const assert = require('assert')
const { compare, sortDeep } = require('..')

describe('array-sort-compare', () => {
  describe('.compare()', () => {
    describe('boolean', () => {
      it('very simple ascending', () => {
        const data = [true, false]
        data.sort(compare())
        assert.deepEqual(data, [false, true])
      })

      it('very simple descending', () => {
        const data = [true, false]
        data.sort(compare('desc'))
        assert.deepEqual(data, [true, false])
      })

      it('nested array', () => {
        const data = [
          true,
          [false, false, true],
          [false, true, true],
          [false, false, false],
          false,
        ]
        data.sort(compare())
        assert.deepEqual(data, [
          false,
          true,
          [false, false, false],
          [false, false, true],
          [false, true, true],
        ])
      })
    })

    describe('string', () => {
      it('very simple ascending', () => {
        const data = ["b", "c", "a"]
        data.sort(compare())
        assert.deepEqual(data, ["a", "b", "c"])
      })

      it('very simple descending', () => {
        const data = ["b", "c", "a"]
        data.sort(compare('desc'))
        assert.deepEqual(data, ["c", "b", "a"])
      })

      it('very simple multiple characters', () => {
        const data = ["abba", "zetor", "test"]
        data.sort(compare())
        assert.deepEqual(data, ["abba", "test", "zetor"])
      })

      it('numbers in text', () => {
        const data = ["10", "2", "1"]
        data.sort(compare())
        assert.deepEqual(data, ["1", "10", "2"])
      })

      it('simple ascending', () => {
        const data = [
          ["a", "b"],
          ["a", "d"],
          ["a", "c"],
        ]
        data.sort(compare())
        assert.deepEqual(data, [
          ["a", "b"],
          ["a", "c"],
          ["a", "d"],
        ])
      })

      it('simple descending', () => {
        const data = [
          ["a", "b"],
          ["a", "d"],
          ["a", "c"],
        ]
        data.sort(compare('desc'))
        assert.deepEqual(data, [
          ["a", "d"],
          ["a", "c"],
          ["a", "b"],
        ])
      })

      it('one level of nested arrays ascending', () => {
        const data = [
          ["a", "b", ["d", "c"]],
          ["a", "b", ["c", "d"]],
          ["a", "c", ["a", "c"]],
          ["a", "c", ["a", "b"]],
        ]
        data.sort(compare())
        assert.deepEqual(data, [
          ["a", "b", ["c", "d"]],
          ["a", "b", ["d", "c"]],
          ["a", "c", ["a", "b"]],
          ["a", "c", ["a", "c"]],
        ])
      })

      it('one level of nested arrays descending', () => {
        const data = [
          ["a", "b", ["d", "c"]],
          ["a", "b", ["c", "d"]],
          ["a", "c", ["a", "c"]],
          ["a", "c", ["a", "b"]],
        ]
        data.sort(compare('desc'))
        assert.deepEqual(data, [
          ["a", "c", ["a", "c"]],
          ["a", "c", ["a", "b"]],
          ["a", "b", ["d", "c"]],
          ["a", "b", ["c", "d"]],
        ])
      })

      it('deeply nested arrays ascending', () => {
        const data = [
          ["a", ["a", "b", ["d", "b"]], "b", ["d", "c"]],
          ["a", ["a", "b", ["d", "c"]], "b", ["c", "d"]],
          ["a", ["a", "b", ["d", "d"]], "c", ["a", "c"]],
          ["a", ["a", "b", ["d", "a"]], "c", ["a", "b"]],
          ["a", ["a", "b", ["d", "a"]], "a", ["b", "b"]],
          ["a", ["a", "b", ["d", "a"]], "a", ["a", "b"]],
        ]
        data.sort(compare())
        assert.deepEqual(data, [
          ["a", ["a", "b", ["d", "a"]], "a", ["a", "b"]],
          ["a", ["a", "b", ["d", "a"]], "a", ["b", "b"]],
          ["a", ["a", "b", ["d", "a"]], "c", ["a", "b"]],
          ["a", ["a", "b", ["d", "b"]], "b", ["d", "c"]],
          ["a", ["a", "b", ["d", "c"]], "b", ["c", "d"]],
          ["a", ["a", "b", ["d", "d"]], "c", ["a", "c"]],
        ])
      })
    })

    describe('number', () => {
      it('very simple ascending', () => {
        const data = [3, 1, 2]
        data.sort(compare())
        assert.deepEqual(data, [1, 2, 3])
      })

      it('very simple descending', () => {
        const data = [3, 1, 2]
        data.sort(compare('desc'))
        assert.deepEqual(data, [3, 2, 1])
      })

      it('very simple descending negative numbers', () => {
        const data = [-3, -1, -2.1]
        data.sort(compare('desc'))
        assert.deepEqual(data, [-1, -2.1, -3])
      })

      it('Infinity and other specials should work numerically', () => {
        const data = [+0, -0, Infinity, -Infinity, 1, 10, -1, -10]
        const data2 = [+0, -0, Infinity, -Infinity, 1, 10, -1, -10]

        // This order is what the default .sort function returned in node v8.12.0 is:
        // [ -1, -10, -Infinity, 0, -0, 1, 10, Infinity]
        data.sort()
        data2.sort(compare())

        // If you don't use a custom compare function, sort always converts the items to strings
        // and orders them lexicographically
        assert.notDeepEqual(data, data2)

        assert.deepEqual(data2, [-Infinity, -10, -1, -0, 0, 1, 10, Infinity])
      })

      it('NaN', () => {
        // Comparisons including NaN are always false
        //
        // NaN < NaN
        // > false
        // NaN > NaN
        // > false
        // NaN == NaN
        // > false
        // NaN === NaN
        // > false
        // NaN > 0
        // > false
        //
        // This will cause weird behavior when sorting arrays with NaN
        const data = [NaN, 10, -10]
        data.sort(compare())
        // [NaN, 10, -10]
        assert.equal(Number.isNaN(data[0]), true)
        assert.equal(data[1], -10)
        assert.equal(data[2], 10)

        const data2 = [10, NaN, -10]
        data2.sort(compare())
        // [10, NaN, -10]
        assert.equal(data2[0], 10)
        assert.equal(Number.isNaN(data2[1]), true)
        assert.equal(data2[2], -10)
      })

      it('simple ascending', () => {
        const data = [
          [1, 2],
          [1, 3],
          [1, 1],
        ]
        data.sort(compare())
        assert.deepEqual(data, [
          [1, 1],
          [1, 2],
          [1, 3],
        ])
      })

      it('simple descending', () => {
        const data = [
          [1, 2],
          [1, 3],
          [1, 1],
        ]
        data.sort(compare('desc'))
        assert.deepEqual(data, [
          [1, 3],
          [1, 2],
          [1, 1],
        ])
      })

      it('one level of nested arrays ascending', () => {
        const data = [
          [1, 2, [4, 3]],
          [1, 2, [3, 4]],
          [1, 3, [1, 3]],
          [1, 3, [1, 2]],
        ]
        data.sort(compare())
        assert.deepEqual(data, [
          [1, 2, [3, 4]],
          [1, 2, [4, 3]],
          [1, 3, [1, 2]],
          [1, 3, [1, 3]],
        ])
      })

      it('one level of nested arrays descending', () => {
        const data = [
          [1, 2, [4, 3]],
          [1, 2, [3, 4]],
          [1, 3, [1, 3]],
          [1, 3, [1, 2]],
        ]
        data.sort(compare('desc'))
        assert.deepEqual(data, [
          [1, 3, [1, 3]],
          [1, 3, [1, 2]],
          [1, 2, [4, 3]],
          [1, 2, [3, 4]],
        ])
      })

      it('deeply nested arrays ascending', () => {
        const data = [
          [-2, [-2, 0, [100, 0]], 0, [100, 2]],
          [-2, [-2, 0, [100, 2]], 0, [2, 100]],
          [-2, [-2, 0, [100, 100]], 2, [-2, 2]],
          [-2, [-2, 0, [100, -2]], 2, [-2, 0]],
          [-2, [-2, 0, [100, -2]], -2, [0, 0]],
          [-2, [-2, 0, [100, -2]], -2, [-2, 0]],
        ]
        data.sort(compare())
        assert.deepEqual(data, [
          [-2, [-2, 0, [100, -2]], -2, [-2, 0]],
          [-2, [-2, 0, [100, -2]], -2, [0, 0]],
          [-2, [-2, 0, [100, -2]], 2, [-2, 0]],
          [-2, [-2, 0, [100, 0]], 0, [100, 2]],
          [-2, [-2, 0, [100, 2]], 0, [2, 100]],
          [-2, [-2, 0, [100, 100]], 2, [-2, 2]],
        ])
      })
    })

    // new Date(year, monthIndex [, day [, hours [, minutes [, seconds [, milliseconds]]]]])
    // The argument monthIndex is 0-based. This means that January = 0 and December = 11.
    describe('date', () => {
      it('very simple ascending', () => {
        const data = [
          new Date(2013, 0, 1),
          new Date(2010, 0, 1),
          new Date(2019, 0, 1)
        ]
        data.sort(compare())
        assert.deepEqual(data, [
          new Date(2010, 0, 1),
          new Date(2013, 0, 1),
          new Date(2019, 0, 1)
        ])
      })

      it('very simple descending', () => {
        const data = [
          new Date(2013, 0, 1),
          new Date(2010, 0, 1),
          new Date(2019, 0, 1)
        ]
        data.sort(compare('desc'))
        assert.deepEqual(data, [
          new Date(2019, 0, 1),
          new Date(2013, 0, 1),
          new Date(2010, 0, 1)
        ])
      })

      it('seconds', () => {
        const data = [
          new Date(2010, 0, 1, 0, 0, 50),
          new Date(2010, 0, 1, 0, 0, 34),
          new Date(2010, 0, 1, 0, 0, 14),
        ]
        data.sort(compare())
        assert.deepEqual(data, [
          new Date(2010, 0, 1, 0, 0, 14),
          new Date(2010, 0, 1, 0, 0, 34),
          new Date(2010, 0, 1, 0, 0, 50),
        ])
      })

      it('milliseconds', () => {
        const data = [
          new Date(2010, 0, 1, 0, 0, 0, 50),
          new Date(2010, 0, 1, 0, 0, 0, 34),
          new Date(2010, 0, 1, 0, 0, 0, 14),
        ]
        data.sort(compare())
        assert.deepEqual(data, [
          new Date(2010, 0, 1, 0, 0, 0, 14),
          new Date(2010, 0, 1, 0, 0, 0, 34),
          new Date(2010, 0, 1, 0, 0, 0, 50),
        ])
      })
    })

    describe('object', () => {
      it('simple number sort', () => {
        const data = [{ a: 2 }, { a: 1 }]
        data.sort(compare())
        assert.deepEqual(data, [{ a: 1 }, { a: 2 }])
      })

      it('simple string sort', () => {
        const data = [{ a: 'a' }, { a: 'b' }]
        data.sort(compare())
        assert.deepEqual(data, [{ a: 'a' }, { a: 'b' }])
      })

      it('simple null sort', () => {
        const data = [{ a: null, b: null }, { a: null }]
        data.sort(compare())
        assert.deepEqual(data, [{ a: null, b: null }, { a: null }])
      })

      it('different types', () => {
        const data = [{ a: 1 }, { a: 'a' }]
        data.sort(compare())
        assert.deepEqual(data, [{ a: 1 }, { a: 'a' }])
      })

      it('simple date sort', () => {
        // In this case we test that large number returned by date comparison function
        // doesn't affect the score with the same number
        const data = [{ a: new Date(2013, 0, 1), b: null }, { a: new Date(2014, 0, 1) }]
        data.sort(compare())
        assert.deepEqual(data, [{ a: new Date(2013, 0, 1), b: null }, { a: new Date(2014, 0, 1) }])
      })

      it('more complex', () => {
        const data2 = [{ a: 1, b: { c: 'test' } }, { a: 2 }, { a: 1, b: 2 }]
        data2.sort(compare())
        assert.deepEqual(data2, [{ a: 1, b: 2 }, { a: 1, b: { c: 'test' } }, { a: 2 }])
      })

      it('more complex', () => {
        const data2 = [{ a: 1, b: { c: { d: 2 } } }, { a: 1, b: { c: { d: 1 } } }]
        data2.sort(compare())
        assert.deepEqual(data2, [{ a: 1, b: { c: { d: 1 } } }, { a: 1, b: { c: { d: 2 } } }])
      })

      it('object properties are not sorted', () => {
        const data = [{ a: 1 }, { a: [2, 1] }]
        data.sort(compare())
        assert.deepEqual(data, [{ a: 1 }, { a: [2, 1] }])
      })
    })

    describe('undefined', () => {
      it('always considered equal', () => {
        const data = [undefined, undefined, undefined]
        data.sort(compare())
        assert.deepEqual(data, [undefined, undefined, undefined])

        const data2 = [undefined, [undefined], undefined]
        data2.sort(compare())
        // The typeOrder moves arrays before undefined
        assert.deepEqual(data2, [[undefined], undefined, undefined])
      })
    })

    describe('null', () => {
      it('always considered equal', () => {
        const data = [null, null, null]
        data.sort(compare())
        assert.deepEqual(data, [null, null, null])

        const data2 = [null, [null], null]
        data2.sort(compare())
        // The typeOrder moves arrays before null
        assert.deepEqual(data2, [[null], null, null])
      })
    })

    describe('mixed', () => {
      it('simple', () => {
        const data = [
          null,
          undefined,
          [
            new Date(2013, 0, 1),
            new Date(2010, 0, 1),
            new Date(2019, 0, 1),
            [
              new Date(2013, 0, 1),
              new Date(2010, 0, 1),
              new Date(2019, 0, 1),
            ],
          ],
          true,
          false,
          [true, false],
          [10, -12, 100, "a", "b", null],
          [10, -12, 100, "a", "a", null],
          [10, -12, 101, "a", "a", null],
          { b: 1 },
          { b: 2 },
          { b: [true, false] },

          new Date(2019, 0, 1),
          Infinity,
          -12,
          "test",
          [[["c"]]],
          [[["b"]]],
        ]

        data.sort(compare())

        assert.deepEqual(data, [
          // number
          -12,
          Infinity,

          // string
          "test",

          // boolean
          false,
          true,

          // date
          new Date(2019, 0, 1),

          [10, -12, 100, "a", "a", null],
          [10, -12, 100, "a", "b", null],
          [10, -12, 101, "a", "a", null],

          [true, false],

          [
            new Date(2013, 0, 1),
            new Date(2010, 0, 1),
            new Date(2019, 0, 1),
            [
              new Date(2013, 0, 1),
              new Date(2010, 0, 1),
              new Date(2019, 0, 1),
            ],
          ],

          [[["b"]]],
          [[["c"]]],

          // object
          { b: 1 },
          { b: 2 },
          { b: [true, false] },

          null,
          undefined,
        ])
      })
    })
  })

  describe('.sortDeep()', () => {
    it('very simple ascending', () => {
      const data = [3, 1, 2]
      sortDeep(data, compare())
      assert.deepEqual(data, [1, 2, 3])
    })

    it('very simple descending', () => {
      const data = [3, 1, 2]
      sortDeep(data, compare('desc'))
      assert.deepEqual(data, [3, 2, 1])
    })

    it('one level of nested arrays ascending', () => {
      const data = [
        [1, 3, [1, 2]],
        [1, 2, [1, 3]],
        [1, 2, [2, 1]],
        [1, 3, [1, 3]],
      ]
      sortDeep(data, compare())
      assert.deepEqual(data, [
        [1, 2, [1, 2]],
        [1, 2, [1, 3]],
        [1, 3, [1, 2]],
        [1, 3, [1, 3]],
      ])
    })

    it('more complex data structure', () => {
      const data = [
        null,
        undefined,
        [
          new Date(2013, 0, 1),
          new Date(2010, 0, 1),
          new Date(2019, 0, 1),
          [
            new Date(2013, 0, 1),
            new Date(2010, 0, 1),
            new Date(2019, 0, 1),
          ],
        ],
        true,
        false,
        [true, false],
        [10, -12, 100, "a", "b", null],
        [10, -12, 100, "a", "a", null],
        [10, -12, 101, "a", "a", null],
        { b: [true, false] },
        { b: 2 },
        { b: 1 },

        new Date(2019, 0, 1),
        Infinity,
        -12,
        "test",
        [[["c"]]],
        [[["b"]]],
      ]

      sortDeep(data, compare())

      assert.deepEqual(data, [
        // number
        -12,
        Infinity,

        // string
        "test",

        // boolean
        false,
        true,

        // date
        new Date(2019, 0, 1),

        [-12, 10, 100, "a", "a", null],
        [-12, 10, 100, "a", "b", null],
        [-12, 10, 101, "a", "a", null],

        [false, true],

        [
          new Date(2010, 0, 1),
          new Date(2013, 0, 1),
          new Date(2019, 0, 1),
          [
            new Date(2010, 0, 1),
            new Date(2013, 0, 1),
            new Date(2019, 0, 1),
          ],
        ],

        [[["b"]]],
        [[["c"]]],

        // object
        { b: 1 },
        { b: 2 },
        { b: [true, false] },

        null,
        undefined,
      ])
    })
  })
})
