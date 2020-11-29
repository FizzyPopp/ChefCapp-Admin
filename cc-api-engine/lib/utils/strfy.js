'use strict'
exports.space = (s = 2) => { return (o) => JSON.stringify(o, null, s); }
