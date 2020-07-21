var fs = require('fs');
var path = require('path');
var Ajv = require('ajv');

/**
 * List of data schemas which defines the data structures to be loaded into the
 * database. Generated on module load based on included schemas within the pack.
 * @exports
 */
var schemas = {};
var schemaDirs = [
    __dirname + "/" + "schemas/vocabulary/quantityClasses/",
    __dirname + "/" + "schemas/vocabulary/",
    __dirname + "/" + "schemas/atomic/",
    __dirname + "/" + "schemas/"
    ];
var schemaRegExp = /\.schema\.json$/;
var ajv = new Ajv({
    verbose: false
});

/**
 * Programmatically trawl through the schema directories and load in each schema
 * found by the schemaRegExp. When found, attach schema to internal ajv instance.
 */
schemaDirs.forEach ((root) => {
    let fileList = fs.readdirSync (root);
    fileList.forEach ((file) => {
        if (file.match(schemaRegExp)) {
            let uri = root + file;
            console.log('Importing schema: ' + uri);

            var schema = require(uri);
            schemas[schema.title] = schema;

            ajv.addSchema(schema, schema.title);
        }
    });
});

/**
 * Validator functions compiled by ajv from the loaded schemas
 * @exports
 */
var validators = {};
for (let title in schemas) {
    console.log("Compiling ajv schema validator function for: " + title);
    validators[title] = exports.ajv.compile(schemas[title]);
}

/**
 * @func validate
 * Wraps the ajv validation function with async, then checking and throwing untyped object errors.
 * This is the sound of me screaming for monads.
 * @param {Object} data - Some object to be validated against schema
 */
var validate = async (data) => {
    if (data.dataType != null){
        ret = {
            errors: null
        };

        ret.validity = await ajv.validate(data.dataType, data);

        if (ret.validity === false){
            ret.errors = ajv.errors;
        }
        return ret;
    }
    else {
         throw new Error.TypeError;
    }
};

buildSchemaTree = (node) => {
    required.forEach ((attribute) => {
        if (node.properties[attribute].$ref !== undefined) {
            //$ref must be a file handle -> $name.schema.json
            childName = node.properties[attribute].$ref.split('.')[0];

            if (validators[childName] === undefined) {
                errStr = "Bad $ref found in " + node.title + ".schema.json - reference to a " + childName + ".schema.json without a validator function."
                throw new Error.ReferenceError(errStr)
            }


        }
    });
}
