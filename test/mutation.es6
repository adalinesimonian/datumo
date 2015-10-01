/* global describe, it */
'use strict'

let expect = require('chai').expect

let testModels = require('./test-models')

describe('Instance mutation', () => {
  describe('Instances', () => {
    it('should throw an error if setting properties not in the schema', () => {
      let Person = testModels.createPersonModel()
      let person = new Person()

      expect(() => person.x = 5).to.throw()
    })

    it('should allow property values to be changed', () => {
      let Person = testModels.createPersonModel()
      let person = new Person()

      expect(() => person.givenName = 'Sophie').to.not.throw()
      expect(person.givenName).to.equal('Sophie')
      expect(() => person.middleName = 'Francesca').to.not.throw()
      expect(person.middleName).to.equal('Francesca')
      expect(() => person.familyName = 'Williams').to.not.throw()
      expect(person.familyName).to.equal('Williams')
      expect(() => person.email = 'sophie@example.com').to.not.throw()
      expect(person.email).to.equal('sophie@example.com')
    })
  })
})
