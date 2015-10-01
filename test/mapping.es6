/* global describe, it */
'use strict'

let expect = require('chai').expect

let testModels = require('./test-models')

describe('Property mapping', () => {
  describe('with explicitly provided mappings', () => {
    it('should return instance with mapped properties', () => {
      let Person = testModels.createPersonModel()
      let person = new Person({
        given_name: 'Kimiyo',
        family_name: 'Ideguchi'
      }, { mapping: {
        givenName: 'given_name',
        familyName: 'family_name'
      }})

      expect(person.givenName).to.equal('Kimiyo')
      expect(person.familyName).to.equal('Ideguchi')
    })
  })

  describe('with named mappings', () => {
    it('should return instance with mapped properties', () => {
      let Person = testModels.createPersonModel()
      class MappedPerson extends Person {
        static get mappings () {
          return {
            'ldap': {
              familyName: 'sn || surname'
            }
          }
        }
      }
      let person = new MappedPerson({
        givenName: 'Thomas',
        surname: 'Conway'
      }, { mapping: 'ldap' })

      expect(person.givenName).to.equal('Thomas')
      expect(person.familyName).to.equal('Conway')
    })
  })

  describe('with mappings containing nested property maps', () => {
    it('should return instance with mapped properties', () => {
      let AddressablePerson = testModels.createAddressablePersonModel()
      let person = new AddressablePerson({
        givenName: 'Lavinia',
        middleName: 'Goncalves',
        sn: 'Barbosa',
        streetAddress: 'Avenida Juca Macedo, 1643',
        l: 'Montes Claros',
        st: 'MG',
        postalCode: '39401-441',
        co: 'Brazil'
      }, { mapping: 'ldap' })

      expect(person.givenName).to.equal('Lavinia')
      expect(person.middleName).to.equal('Goncalves')
      expect(person.familyName).to.equal('Barbosa')
      expect(person.address).to.be.an('object')
      expect(person.address.street).to.equal('Avenida Juca Macedo, 1643')
      expect(person.address.locality).to.equal('Montes Claros')
      expect(person.address.region).to.equal('MG')
      expect(person.address.postalCode).to.equal('39401-441')
      expect(person.address.country).to.equal('Brazil')
    })
  })
})
