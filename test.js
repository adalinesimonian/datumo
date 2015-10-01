'use strict'

let Datumo = require('./lib/index')

class Person extends Datumo.Model {
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

console.log(Person.schema)
console.dir(new Person())
console.log(Object.getOwnPropertySymbols(new Person()))

let amanda = new Person()

amanda.givenName = 'Amanda'
amanda.familyName = 'Bryson'
amanda.email = 'amanda@example.com'

try {
  amanda.isBurglar = true
} catch (e) {
  console.log(e)
}

console.log(JSON.stringify(amanda, null, 2))

let joyce = new Person({
  givenName: 'Joyce',
  familyName: 'Ansari',
  doesntLike: 'cheesecake'
})

console.log(JSON.stringify(joyce, null, 2))

class OfflinePerson extends Person.exclude('email') {}

console.log(OfflinePerson.schema)
console.dir(new OfflinePerson())
console.log(Object.getOwnPropertySymbols(new OfflinePerson()))

let offlineAmanda = new OfflinePerson(amanda)

console.log(JSON.stringify(offlineAmanda, null, 2))

class Friend extends Person.subset('givenName', 'email') {}

console.log(Friend.schema)
console.dir(new Friend())
console.log(Object.getOwnPropertySymbols(new Friend()))

let friendAmanda = new Friend(amanda)

console.log(JSON.stringify(friendAmanda, null, 2))

let jeff = new Person({
  givenName: 'Jeff',
  email: 'Don\'t send me emails!'
})

console.log(JSON.stringify(jeff, null, 2))

console.log(jeff.validate())

jeff.familyName = 'Kashkarian'

console.log(jeff.validate())

jeff.email = 'jeff.kashkarian@example.com'

console.log(jeff.validate())

let offlineJeff = new OfflinePerson({
  givenName: 'Jeff',
  email: 'Don\'t send me emails!'
})

console.log(JSON.stringify(offlineJeff, null, 2))

console.log(offlineJeff.validate())

class Worker extends Person {
  static get schema () {
    let schema = super.schema
    Object.assign(schema, {
      position: {
        type: 'string',
        required: true
      },
      company: {
        type: 'string',
        required: true
      }
    })
    return schema
  }
}

let alex = new Worker({
  givenName: 'Alex',
  familyName: 'Ueltzhöfer',
  position: 'Lead Architectural Engineer',
  company: 'ACME Company'
})

console.log(Worker.schema)
console.dir(new Worker())
console.log(Object.getOwnPropertySymbols(new Worker()))

console.log(JSON.stringify(alex, null, 2))

console.log(JSON.stringify(new Person({
  given_name: 'Kimiyo',
  family_name: 'Ideguchi'
}, { mapping: {
  givenName: 'given_name',
  familyName: 'family_name'
}}), null, 2))

class MappedPerson extends Person {
  static get mappings () {
    return {
      'ldap': {
        familyName: 'sn || surname'
      }
    }
  }
}

console.log(JSON.stringify(new MappedPerson({
  givenName: 'Thomas',
  surname: 'Conway'
}, { mapping: 'ldap' }), null, 2))

class AddressablePerson extends Person {
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

console.log(JSON.stringify(new AddressablePerson({
  givenName: 'Lavinia',
  middleName: 'Goncalves',
  sn: 'Barbosa',
  streetAddress: 'Avenida Juca Macedo, 1643',
  l: 'Montes Claros',
  region: 'MG',
  postalCode: '39401-441',
  co: 'Brazil'
}, { mapping: 'ldap' }), null, 2))
