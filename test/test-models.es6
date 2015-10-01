'use strict'

let Datumo = require('../lib/index')

function createPersonModel () {
  return class Person extends Datumo.Model {
    static get schema () {
      return {
        givenName: {
          type: 'string',
          required: true
        },
        middleName: {
          type: 'string'
        },
        familyName: {
          type: 'string',
          required: true
        },
        email: {
          type: 'string',
          format: 'email'
        }
      }
    }
  }
}

function createFoxModel () {
  return class Fox extends Datumo.Model {
    static get schema () {
      return {
        tagLocation: {
          type: 'object',
          properties: {
            lat: {
              type: 'float',
              default: 0.0
            },
            long: {
              type: 'float',
              default: 0.0
            }
          }
        },
        fluffy: {
          type: 'boolean',
          default: true
        },
        colour: {
          type: 'string',
          default: 'red',
          enum: [
            'red', 'grey', 'cross', 'brown', 'silver', 'platinum', 'amber',
            'samson'
          ]
        },
        legs: {
          type: 'integer',
          minimum: 0,
          maximum: 4,
          default: 4
        }
      }
    }
  }
}

function createAddressablePersonModel () {
  return class AddressablePerson extends createPersonModel() {
    static get schema () {
      let schema = super.schema
      Object.assign(schema, {
        address: {
          type: 'object',
          properties: {
            street: { type: 'string' },
            locality: { type: 'string' },
            region: { type: 'string' },
            postalCode: { type: 'string' },
            country: { type: 'string' }
          }
        }
      })
      return schema
    }
    static get mappings () {
      return {
        'ldap': {
          familyName: 'sn || surname',
          address: {
            street: 'streetAddress || street',
            locality: 'l',
            region: 'st',
            postalCode: 'postalCode',
            country: 'co'
          }
        }
      }
    }
  }
}

module.exports = {
  createPersonModel,
  createFoxModel,
  createAddressablePersonModel
}
