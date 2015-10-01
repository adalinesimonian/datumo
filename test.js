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
