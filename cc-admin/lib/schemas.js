'use strict'

var fs = require('fs');
var path = require('path');

/**
 * @func decompose
 *
 * @param {object} schema - a full json schema as loaded from disk
 *
 * @returns {object} skeleton - a skeleton of the schema with schema.properties lifted as top-level fields and required status attached
 *
 * This function checks existance of schema.properties and iterates over its
 * keys if found, building a skeleton of the schema using its defined properties
 */
function decompose (schema) {
    let skeleton = {};

    // primitive schemas document non-object classes - e.g. array, string, number
    skeleton.isPrimitive = (schema.type !== "object");

    if (skeleton.isPrimitive === false) {
        for (let propKey in schema.properties) {
            skeleton[propKey] = {};
            if (typeof schema.properties[propKey].type === 'undefined')
                { skeleton[propKey].type = schema.properties[propKey].$ref.split('.')[0]; }
            else
                { skeleton[propKey].type = schema.properties[propKey].type; }

            if (typeof schema.required !== 'undefined') {
                skeleton[propKey].required = schema.required.includes(propKey);
            }
        }
    }
    else {
        skeleton.type = schema.type;
    }

    return skeleton;
}

/**
 * @func init
 *
 * @param {string} root - directory or url to look for schemas
 *
 * @returns {object} this - returns an instance loaded with schemas from the traversed directories, along with generated skeletons
 */
exports.init = (root) => {
    let _schemas = {};
    let _schemaDirs = [
        root + "/" + "schemas/vocabulary/quantityClasses/",
        root + "/" + "schemas/vocabulary/",
        root + "/" + "schemas/atomic/",
        root + "/" + "schemas/"
    ];
    let _schemaRegExp = /\.schema\.json$/;

    /**
     * Programmatically trawl through the schema directories and load in each schema
     * found by the schemaRegExp. When found, attach schema to internal _ajv instance.
     */
    _schemaDirs.forEach ((path) => {
        let fileList = fs.readdirSync (path);
        fileList.forEach ((file) => {
            if (file.match(_schemaRegExp)) {
                let uri = path + file;
                // console.log('Importing schema: ' + uri);

                var schema = require(uri);
                _schemas[schema.title] = schema;
            }
        });
    });

    /**
     * @namespace skeleton
     * @prop {object} skeleton - a compressed view of the object tree without json schema dangly bits
     * @prop {boolean} skeleton.isPrimitive - record of skeletal nature - is it an object or not
     * @prop {object} skeleton.property - a property of the schema in question, DYNAMICALLY GENERATED KEY - 'property' name is placeholder
     * @prop {string} skeleton.property.type - the primitive type of property - generated dynamically on load
     * @prop {boolean} skeleton.property.required - true|false reflector of the schema.required property - generated dynamically on load
     * generates a schema.skeleton object for each schema parsed, listing all properties of the schema
     * in a "propertyName": { isPrimitive: true|false } format for dynamic applications
     */
    for(let key in _schemas) {
        _schemas[key].skeleton = decompose(_schemas[key]);
    }

    this.list = _schemas;
    this.types = Object.keys(_schemas)
    return this;
}
