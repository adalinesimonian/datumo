'use strict'

import lxValid from 'lx-valid'
import jshiki from 'jshiki'

export class Model {
  constructor (data = {}, { mapping } = {}) {
    let schema = this.constructor.schema
    if (typeof schema !== 'object' || !schema) {
      throw new Error('No schema set on class')
    }
    if (typeof data !== 'object' || !data) {
      throw new Error('data must be an object')
    }

    if (mapping) {
      if (typeof mapping === 'string') {
        if (!this.constructor.mappings || !this.constructor.mappings[mapping]) {
          throw new Error(`The mapping ${mapping} is not defined on the class`)
        }
        mapping = this.constructor.mappings[mapping]
      }
      if (typeof mapping !== 'object' && typeof mapping !== 'string') {
        throw new Error('mapping must be specified as an object or a string')
      }
      let mappedData = {}
      for (let targetProperty of Object.getOwnPropertyNames(mapping)) {
        if (!schema.hasOwnProperty(targetProperty)) {
          throw new Error(
            `Property ${targetProperty} is not defined on the schema`
          )
        }
      }
      for (let targetProperty of Object.getOwnPropertyNames(schema)) {
        if (mapping.hasOwnProperty(targetProperty)) {
          let map = jshiki.parse(mapping[targetProperty], { scope: data })
          mappedData[targetProperty] = map.eval()
        } else {
          mappedData[targetProperty] = data[targetProperty]
        }
      }
      data = mappedData
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

  static validate (data) {
    if (typeof this.schema !== 'object' || !this.schema) {
      throw new Error('No schema set on class')
    }
    return lxValid.validate(data, { properties: this.schema })
  }

  validate () {
    return this.constructor.validate(this)
  }
}
