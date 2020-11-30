'use strict'
const msg = require('./msg').name('strfyInstruct');
const strfy = require('./strfy').space(3);
module.exports = (instructions) => {
    let serialized = '';
    let counter = {
        copy: 0,
        name: 0,
        quantity :0,
        unit: 0,
        time: 0
    };

    // msg('strfy candidate: ' + strfy(instructions));
    instructions.abstract.forEach((type) => {
        let i = counter[type];
        let copy = instructions[type][i];
        if (type !== 'copy') {
            switch (type) {
                case 'name':
                    copy = '@[' + copy
                    break;
                case 'quantity':
                    copy = '#[' + copy
                    break;
                case 'unit':
                    copy = '$[' + copy
                    break;
                case 'time':
                    copy = '%[' + copy
                    break;
            }

            copy = copy + ']';
        }
        serialized = serialized.concat(copy);
        counter[type] += 1;
    })
    return serialized;
}

const sample = `
asdfasdf [toast](wikipedia.org)
@[ingredient name]
#[a quantity]
$[unitio]
%[12 minute]`;
