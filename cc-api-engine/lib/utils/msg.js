'use strict'
// let n = '';
exports.name = (n) => {
    return (m) => console.log('[' + new Date().toISOString() + '] ' + n + ' => ' + m);
}
