# datumo

Lightweight data-modelling for Node.js

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

amanda.validate().valid === true
```

## Why

ES6 provides a lot of new conveniences, arguably the most notable addition being
class support. Datumo makes data modelling using ES6 classes incredibly easy and
syntactically compact.

## Details

You can do a number of nifty things with Datumo:

- [**Validate data**](#validation) - harness the power of [lx-valid][lx-valid]
  for quick-and-easy validation
- [**Subclass models**](#subclassing) - easily create of models for subsets of
  your data
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

Say you have a model that allows for sensitive information. Or, perhaps, you
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

let offlineAmanda = new OfflinePerson(amanda)

offlineAmanda.givenName === 'Amanda'
offlineAmanda.middleName === undefined
offlineAmanda.familyName === undefined
offlineAmanda.email === 'amanda@example.com'
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

#### Expressions

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
