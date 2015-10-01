'use strict'

export class Model {
  constructor (data = {}) {
    let schema = this.constructor.schema
    if (typeof schema !== 'object' || !schema) {
      throw new Error('No schema set on class')
    }
    if (typeof data !== 'object' || !data) {
      throw new Error('data must be an object')
    }

    for (let property of Object.getOwnPropertyNames(schema)) {
      if (typeof schema[property] !== 'object' || !schema[property]) {
        throw new Error(`${property} is not a valid property definition`)
      }
      let key = Symbol(property)
      this[key] = data.hasOwnProperty(property) ? data[property] : undefined
      Object.defineProperty(this, property, {
        get: schema[property].get
          ? () => this.schema[property].get(this[key])
          : () => this[key],
        set: schema[property].set
          ? val => this[key] = this.schema[property].set(val, this[key])
          : val => this[key] = val,
        enumerable: true,
        configurable: false
      })
    }

    Object.preventExtensions(this)
    Object.seal(this)
  }

  static subset (...properties) {
    if (typeof this.schema !== 'object' || !this.schema) {
      throw new Error('No schema set on class')
    }
    if (properties.length < 1) {
      throw new Error('At least one property must be specified')
    }

    let subsetSchema = {}

    for (let property of properties) {
      if (!this.schema.hasOwnProperty(property)) {
        throw new Error(`Property ${property} is not defined on the schema`)
      }
      subsetSchema[property] = this.schema[property]
    }

    return class Subset extends this {
      static get schema () { return subsetSchema }
    }
  }

  static exclude (...properties) {
    if (typeof this.schema !== 'object' || !this.schema) {
      throw new Error('No schema set on class')
    }
    if (properties.length < 1) {
      throw new Error('At least one property must be specified')
    }

    let subset = Object.getOwnPropertyNames(this.schema)

    for (let property of properties) {
      if (!this.schema.hasOwnProperty(property)) {
        throw new Error(`Property ${property} is not defined on the schema`)
      }
      subset.splice(subset.indexOf(property), 1)
    }

    let subsetSchema = {}

    for (let property of subset) {
      subsetSchema[property] = this.schema[property]
    }

    return class Subset extends this {
      static get schema () { return subsetSchema }
    }
  }
}
