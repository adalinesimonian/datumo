'use strict'

import lxValid from 'lx-valid'
import jshiki from 'jshiki'

function mapData (mapping, data) {
  let mappedData = {}
  for (let targetProperty of Object.getOwnPropertyNames(mapping)) {
    if (typeof mapping[targetProperty] === 'object') {
      mappedData[targetProperty] = mapData(mapping[targetProperty], data)
    } else if (typeof mapping[targetProperty] === 'string') {
      let map = jshiki.parse(mapping[targetProperty], { scope: data })
      mappedData[targetProperty] = map.eval()
    } else {
      throw new Error('mapping value must be an object or a string')
    }
  }
  return mappedData
}

function constructData (schema, data = {}, { defaults = true } = {}) {
  let target = {}
  for (let property of Object.getOwnPropertyNames(schema)) {
    let subData = typeof data[property] !== 'undefined' ? data[property] : {}
    let subSchema = schema[property].properties
    let subProperties = subSchema ? Object.getOwnPropertyNames(subSchema) : []
    if (subProperties.some(property =>
      typeof subData[property] !== 'undefined' ||
      (defaults && typeof subSchema[property].default !== 'undefined')
    )) {
      target[property] = constructData(subSchema, subData, { defaults })
    } else {
      target[property] = data.hasOwnProperty(property) ? data[property]
        : (defaults ? schema[property].default : undefined)
    }
  }
  return target
}

export class Model {
  constructor (data = {}, { mapping, defaults = true } = {}) {
    let schema = this.constructor.schema
    if (typeof schema !== 'object' || !schema) {
      throw new Error('No schema set on class')
    }
    if (data === null) {
      data = {}
    } else if (typeof data !== 'object' || !data) {
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
      for (let targetProperty of Object.getOwnPropertyNames(mapping)) {
        if (!schema.hasOwnProperty(targetProperty)) {
          throw new Error(
            `Property ${targetProperty} is not defined on the schema`
          )
        }
      }
      let mappedData = mapData(mapping, data)
      for (let targetProperty of Object.getOwnPropertyNames(schema)) {
        if (!mappedData.hasOwnProperty(targetProperty)) {
          mappedData[targetProperty] = data[targetProperty]
        }
      }
      data = mappedData
    }

    data = constructData(schema, data, { defaults })

    for (let property of Object.getOwnPropertyNames(schema)) {
      if (typeof schema[property] !== 'object' || !schema[property]) {
        throw new Error(`${property} is not a valid property definition`)
      }
      let key = Symbol(property)
      this[key] = data[property]
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
