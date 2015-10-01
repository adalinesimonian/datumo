/* global describe, it */
'use strict'

let expect = require('chai').expect

let testModels = require('./test-models')

describe('Validation', () => {
  describe('Model-level', () => {
    it('should validate given data', () => {
      let Person = testModels.createPersonModel()
      let validationResults = Person.validate({
        givenName: 'Jeff',
        email: 'Don\'t send me emails!'
      })

      expect(validationResults).to.be.an('object')
      expect(validationResults.valid).to.equal(false)
      expect(validationResults.errors).to.have.length(2)
    })
  })

  describe('Instance-level', () => {
    it('should validate current data', () => {
      let Person = testModels.createPersonModel()
      let person = new Person({
        givenName: 'Jeff',
        email: 'Don\'t send me emails!'
      })
      let validationResults = person.validate()

      expect(validationResults).to.be.an('object')
      expect(validationResults.valid).to.equal(false)
      expect(validationResults.errors).to.have.length(2)
    })

    it('should keep validation state up-to-date with data', () => {
      let Person = testModels.createPersonModel()
      let person = new Person({
        givenName: 'Jeff',
        email: 'Don\'t send me emails!'
      })
      let validationResultsBeforeChange = person.validate()
      person.familyName = 'Kashkarian'
      let validationResultsAfterChange1 = person.validate()
      person.email = 'jeff.kashkarian@example.com'
      let validationResultsAfterChange2 = person.validate()

      expect(validationResultsBeforeChange).to.be.an('object')
      expect(validationResultsBeforeChange.valid).to.equal(false)
      expect(validationResultsBeforeChange.errors).to.have.length(2)

      expect(validationResultsAfterChange1).to.be.an('object')
      expect(validationResultsAfterChange1.valid).to.equal(false)
      expect(validationResultsAfterChange1.errors).to.have.length(1)

      expect(validationResultsAfterChange2).to.be.an('object')
      expect(validationResultsAfterChange2.valid).to.equal(true)
      expect(validationResultsAfterChange2.errors).to.have.length(0)
    })
  })
})
