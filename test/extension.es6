/* global describe, it */
'use strict'

let expect = require('chai').expect

let testModels = require('./test-models')

describe('Model extension', () => {
  describe('Subsets', () => {
    it('should only contain the given properties if inclusive', () => {
      let Person = testModels.createPersonModel()
      class Friend extends Person.subset('givenName', 'email') {}

      expect(Object.getOwnPropertyNames(Friend.schema)).to.have.length(2)
      expect(Friend.schema).to.contain.all.keys(['givenName', 'email'])
    })

    it('should not contain the given properties if exclusive', () => {
      let Person = testModels.createPersonModel()
      class OfflinePerson extends Person.exclude('email') {}

      expect(Object.getOwnPropertyNames(OfflinePerson.schema)).to.have.length(3)
      expect(OfflinePerson.schema).to.contain.all.keys([
        'givenName', 'middleName', 'familyName'
      ])
    })
  })
})
