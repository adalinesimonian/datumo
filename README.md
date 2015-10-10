# datumo

[![Build Status](https://travis-ci.org/vsimonian/datumo.svg?branch=master)](https://travis-ci.org/vsimonian/datumo)

Lightweight data modelling for Node.js

## Basic Usage

**Datumo requires Node.js 4.0 or later.**

```
$ npm install --save datumo
```

```javascript
let Datumo = require('datumo')

class Person extends Datumo.Model {
  static get schema () {
    return {
      givenName: { type: 'string', required: true },
      middleName: { type: 'string' },
      familyName: { type: 'string', required: true },
      email: { type: 'string', format: 'email' }
    }
  }
}

let amanda = new Person({
  givenName: 'Amanda',
  familyName: 'Bryson',
  email: 'amanda@example.com'
})

amanda.givenName === 'Amanda'
amanda.familyName === 'Bryson'
amanda.email === 'amanda@example.com'

Person.validate(amanda).valid === true
```

## Why

ES6 provides a lot of new conveniences, arguably the most notable addition being
class support. Datumo makes data modelling using ES6 classes incredibly easy and
syntactically compact.

## Details

You can do a number of nifty things with Datumo:

- [**Validate data**](#validation) - harness the power of [lx-valid][lx-valid]
  for quick-and-easy validation
- [**Subclass models**](#subclassing) - easily create models for subsets of your
  data
- [**Extend models**](#extension) - take advantage of ES6 classes to easily
  extend models
- [**Map data properties**](#mapping) - easily handle data from a 3rd-party that
  has the data you need, but with different property names
- **Avoid extraneous data** - Datumo model instances only allow setting
  properties defined on the schema

### Validation

Datumo uses [lx-valid][lx-valid] for validation. This makes it incredibly easy
for you to define your model's schema and solve the problem of validating your
data in one shot.

Because Datumo delegates validation to [lx-valid][lx-valid], Datumo supports
[all of the options lx-valid supports][lx-valid-options] on schemas.

```javascript
let Datumo = require('datumo')

class Person extends Datumo.Model {
  static get schema () {
    return {
      givenName: { type: 'string', required: true },
      middleName: { type: 'string' },
      familyName: { type: 'string', required: true },
      email: { type: 'string', format: 'email' }
    }
  }
}

let jeff = new Person({
  givenName: 'Jeff',
  email: 'Don\'t send me any e-mails!'
})
let validationResults = Person.validate(jeff)

validationResults.valid === false
validationResults.errors.length === 2
// familyName is required
// email is not a valid e-mail address
```

#### Validating defined properties only

If you're working with a database, occassionally you may want only to validate
properties that are defined as a part of an update or a patch request. With the
`definedOnly` option, the `validate` function treats all properties on the
schema as though they are not required, effectively ignoring any undefined
properties.

```javascript
let vanessa = new Person({
  givenName: 'Vanessa',
  email: 'thisisnotavalidemail'
})
let results = Person.validate(vanessa)
let resultsDefinedOnly = Person.validate(vanessa, { definedOnly: true })

results.valid === false
results.errors.length === 2
// familyName is required
// email is not a valid e-mail address

resultsDefinedOnly.valid === false
resultsDefinedOnly.errors.length === 1
// email is not a valid e-mail address
```

### Extension

Because Datumo models are ES6 classes, you can easily extend them:

```javascript
let Datumo = require('datumo')

class Person extends Datumo.Model {
  static get schema () {
    return {
      givenName: { type: 'string', required: true },
      middleName: { type: 'string' },
      familyName: { type: 'string', required: true },
      email: { type: 'string', format: 'email' }
    }
  }
}

class Worker extends Person {
  static get schema () {
    let schema = super.schema
    Object.assign(schema, {
      position: { type: 'string', required: true },
      company: { type: 'string', required: true }
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
```

### Subclassing

Say you have a model that may contain sensitive information. Or, perhaps, you
have a model that has all the data you need, but has a bit too much. With
Datumo, it's easy to create a new model that has only the data you need.

Let's assume you have a `Person` model defined as such:

```javascript
let Datumo = require('datumo')

class Person extends Datumo.Model {
  static get schema () {
    return {
      givenName: { type: 'string', required: true },
      middleName: { type: 'string' },
      familyName: { type: 'string', required: true },
      email: { type: 'string', format: 'email' }
    }
  }
}
```

Now, let's create an instance of `Person`.

```javascript
let amanda = new Person()

amanda.givenName = 'Amanda'
amanda.middleName = 'Barrett'
amanda.familyName = 'Bryson'
amanda.email = 'amanda@example.com'
```

Let's assume you don't want certain code to ever see a person's e-mail address.
Simple! We can **exclude** the `email` property on a new, subclassed model.

```javascript
class OfflinePerson extends Person.exclude('email') {}

let offlineAmanda = new OfflinePerson(amanda)

offlineAmanda.givenName === 'Amanda'
offlineAmanda.middleName === 'Barrett'
offlineAmanda.familyName === 'Bryson'
offlineAmanda.email === undefined
```

You can also subclass a **subset** of the data inclusively instead of
exclusively. For example:

```javascript
class Friend extends Person.subset('givenName', 'email') {}

let friendAmanda = new Friend(amanda)

friendAmanda.givenName === 'Amanda'
friendAmanda.middleName === undefined
friendAmanda.familyName === undefined
friendAmanda.email === 'amanda@example.com'
```

### Mapping

Web services are ubiquitous, and with something widespread, comes the issue of
consistency. Many services have certain sets of data that they may share in
common. For example, the _concept_ of a user is universal. However, the _format_
in which services serve user data isn't.

Imagine that the property names used for data, both by your app and the
services, looks like this:

Your app | Service A | Service B | Service C
--- | --- | --- | ---
`givenName` | `given_name` | `firstName` | `name`
`middleName` | `middle_name` | `middleName` | `middle_initial`
`familyName` | `family_name` | `lastName` | `surname`
`email` | `email` | `emailAddress` | `mail`

Datumo helps you navigate the SNAFU of the modern world of data with **property
mapping**. Simply define the mappings on the model:

```javascript
let Datumo = require('datumo')

class User extends Datumo.Model {
  static get schema () {
    return {
      givenName: { type: 'string', required: true },
      middleName: { type: 'string' },
      familyName: { type: 'string', required: true },
      email: { type: 'string', format: 'email' }
    }
  },
  static get mappings () {
    return {
      serviceA: {
        givenName: 'given_name',
        middleName: 'middle_name',
        familyName: 'family_name'
      },
      serviceB: {
        givenName: 'firstName',
        familyName: 'lastName',
        email: 'emailAddress'
      },
      serviceC: {
        givenName: 'name',
        middleName: 'middle_initial',
        familyName: 'surname',
        email: 'mail'
      }
    }
  }
}
```

Now, when you receive data from any of these services, accepting that data is as
easy as:

```javascript
apiClient.getUserInfo()
  .then(userInfo => new User(userInfo, { mapping: 'serviceA' }))
  .then(user => db.users.save(user))
  // ...
```

You can also map data out of a Datumo model to use it in a service. Only
properties defined in the mapping will be in the output object. For example,
using the sample `User` class above:

```javascript
let amanda = new User({
  givenName: 'Amanda',
  middleName: 'Barrett',
  familyName: 'Bryson',
  email: 'amanda@example.com'
})

let apiFriendlyAmanda = User.map(amanda, 'serviceC')

apiFriendlyAmanda.name === 'Amanda'
apiFriendlyAmanda.middle_initial === 'Barrett'
apiFriendlyAmanda.surname === 'Bryson'
apiFriendlyAmanda.mail === 'amanda@example.com'

apiClient.updateUserInfo(amanda.email, apiFriendlyAmanda)
// ...
```

#### Expressions

>**NOTE:** Expressions work great with mapping data into a Datumo model.
>However, they're not designed to work with mapping data out of a Datumo model.
>If you're using the `map` function, make sure that you are using a mapping that
>uses simple property names instead of expressions.

Property mappings support [a limited subset of Javascript][jshiki] that you can
use when facing data that requires more complex logic to be mapped properly.

For example:

```javascript
let Datumo = require('datumo')

class User extends Datumo.Model {
  static get schema () {
    return {
      givenName: { type: 'string', required: true },
      // ...
    }
  },
  static get mappings () {
    return {
      serviceA: {
        givenName: 'cn || given_name',
        // ...
      },
      // ...
    }
  }
}
```

## License

MIT

[jshiki]: https://github.com/vsimonian/jshiki
[lx-valid]: https://github.com/litixsoft/lx-valid
[lx-valid-options]: https://github.com/litixsoft/lx-valid#schema-validation
