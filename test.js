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
