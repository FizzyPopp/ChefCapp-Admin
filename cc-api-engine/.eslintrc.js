module.exports = {
    "env": {
        "node": true,
        "browser": false,
        "es2021": false
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 11,
        "sourceType": "module"
    },
    "rules": {
        "no-unused-vars": "warn"
    },
    "globals": {
        "Promise": true
    }
};
