/* global describe, it */
'use strict'

let expect = require('chai').expect

let Datumo = require('../lib/index')
let testModels = require('./test-models')

describe('Model instantiation', () => {
  describe('New instances', () => {
    it('should throw an error if no schema is defined', () => {
      expect(() => new Datumo.Model()).to.throw()
    })

    it('should have property definitions for all schema properties', () => {
      let Person = testModels.createPersonModel()
      let person = new Person()

      expect(Object.getOwnPropertyNames(person)).to.have.length(4)
      expect(person).to.contain.all.keys([
        'givenName', 'middleName', 'familyName', 'email'
      ])
    })

    describe('without any data', () => {
      it('should have properties set to undefined', () => {
        let Person = testModels.createPersonModel()
        let person = new Person()

        expect(person.givenName).to.be.undefined
        expect(person.middleName).to.be.undefined
        expect(person.familyName).to.be.undefined
        expect(person.email).to.be.undefined
      })
    })

    describe('with data given as "null"', () => {
      it('should have properties set to undefined', () => {
        let Person = testModels.createPersonModel()
        let person = new Person(null)

        expect(person.givenName).to.be.undefined
        expect(person.middleName).to.be.undefined
        expect(person.familyName).to.be.undefined
        expect(person.email).to.be.undefined
      })
    })

    describe('with given data', () => {
      it('should contain the given data', () => {
        let Person = testModels.createPersonModel()
        let person = new Person({
          givenName: 'Lavinia',
          middleName: 'Goncalves',
          familyName: 'Barbosa',
          email: 'lavinia@example.com'
        })

        expect(person.givenName).to.equal('Lavinia')
        expect(person.middleName).to.equal('Goncalves')
        expect(person.familyName).to.equal('Barbosa')
        expect(person.email).to.equal('lavinia@example.com')
      })

      it('should not contain properties not present on the schema', () => {
        let Person = testModels.createPersonModel()
        let person = new Person({
          isBurglar: true
        })

        expect(person).to.not.have.key('isBurglar')
      })
    })

    describe('with data containing null values', () => {
      it('should contain the given data and null values', () => {
        let Person = testModels.createPersonModel()
        let person = new Person({
          givenName: 'Lavinia',
          middleName: null,
          familyName: 'Barbosa',
          email: 'lavinia@example.com'
        })

        expect(person.givenName).to.equal('Lavinia')
        expect(person.middleName).to.equal(null)
        expect(person.familyName).to.equal('Barbosa')
        expect(person.email).to.equal('lavinia@example.com')
      })
    })

    describe('with data containing null values, using nullAsUndefined', () => {
      it('should contain the given data with undefined instead of null', () => {
        let Person = testModels.createPersonModel()
        let person = new Person({
          givenName: 'Lavinia',
          middleName: null,
          familyName: 'Barbosa',
          email: 'lavinia@example.com'
        }, { nullAsUndefined: true })

        expect(person.givenName).to.equal('Lavinia')
        expect(person.middleName).to.equal(undefined)
        expect(person.familyName).to.equal('Barbosa')
        expect(person.email).to.equal('lavinia@example.com')
      })
    })

    describe('with defaults', () => {
      it('should use defaults if no data is given', () => {
        let Fox = testModels.createFoxModel()
        let fox = new Fox()

        expect(fox.tagLocation).to.eql({ lat: 0.0, long: 0.0 })
        expect(fox.fluffy).to.equal(true)
        expect(fox.colour).to.equal('red')
        expect(fox.legs).to.equal(4)
      })

      it('should not use defaults if defaults are disabled', () => {
        let Fox = testModels.createFoxModel()
        let fox = new Fox(null, { defaults: false })

        expect(fox.tagLocation).to.be.undefined
        expect(fox.fluffy).to.be.undefined
        expect(fox.colour).to.be.undefined
        expect(fox.legs).to.be.undefined
      })

      it('should not use defaults for properties that are set on data', () => {
        let Fox = testModels.createFoxModel()
        let fox = new Fox({
          tagLocation: { lat: 45.123765, long: -123.113785 },
          fluffy: false,
          colour: 'amber',
          legs: 0
        })

        expect(fox.tagLocation).to.eql({ lat: 45.123765, long: -123.113785 })
        expect(fox.fluffy).to.equal(false)
        expect(fox.colour).to.equal('amber')
        expect(fox.legs).to.equal(0)
      })

      it('should not use defaults for null properties', () => {
        let Fox = testModels.createFoxModel()
        let fox = new Fox({
          tagLocation: { lat: 45.123765, long: -123.113785 },
          fluffy: false,
          colour: null,
          legs: 0
        })

        expect(fox.tagLocation).to.eql({ lat: 45.123765, long: -123.113785 })
        expect(fox.fluffy).to.equal(false)
        expect(fox.colour).to.equal(null)
        expect(fox.legs).to.equal(0)
      })

      it('should use defaults for null properties with nullAsUndefined', () => {
        let Fox = testModels.createFoxModel()
        let fox = new Fox({
          tagLocation: { lat: 45.123765, long: -123.113785 },
          fluffy: false,
          colour: null,
          legs: 0
        }, { nullAsUndefined: true })

        expect(fox.tagLocation).to.eql({ lat: 45.123765, long: -123.113785 })
        expect(fox.fluffy).to.equal(false)
        expect(fox.colour).to.equal('red')
        expect(fox.legs).to.equal(0)
      })
    })

    describe('with nested defaults', () => {
      it('should use defaults when property is only partially set', () => {
        let Fox = testModels.createFoxModel()
        let fox = new Fox({
          tagLocation: { long: -123.113785 }
        })

        expect(fox.tagLocation).to.eql({ lat: 0.0, long: -123.113785 })
      })
    })
  })
})
