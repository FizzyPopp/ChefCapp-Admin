'use strict'

/**
 * @module remark-copy-token
 *
 * This remark plugin detects t
 *
 */
function plugin () {
    const beginRegex = /[\@\#\$\%]\[/;
    const symbolMap = {
        '@[': "name",
        '#[': "quantity",
        '$[': "unit",
        '%[': "time"
    };
    const symbolList = Object.keys(symbolMap);
    const endSymbol = ']';

    function locator (value, fromIndex) {
        let indices = [];
        let t = -1;
        /**
         * I am aware there is a way to do this in a loop, however the locator
         * call spits out infinite loop errors when one is used here because
         * it uses a validator and the validator is an idiot.
         */
        t = value.indexOf(symbolList[0], fromIndex)
        if (t != -1) { indices.push(t); }

        t = value.indexOf(symbolList[1], fromIndex)
        if (t != -1) { indices.push(t); }

        t = value.indexOf(symbolList[2], fromIndex)
        if (t != -1) { indices.push(t); }

        t = value.indexOf(symbolList[3], fromIndex)
        if (t != -1) { indices.push(t); }

        indices.sort((a, b) => a - b);

        return indices[0] || -1;
    };

    function tokenizer (eat, value, silent) {
        var matched = value.match(beginRegex);

        // onsole.log(matched);

        if (matched !== null) {
            var beginSymbol = matched[0];
        } else {
            console.log("butt");
            return;
        }

        // console.log(beginSymbol)
        const nameBegin = value.search(beginRegex);
        const nameEnd = value.indexOf(endSymbol);
        // console.log( "nameBegin: " + nameBegin + " || nameEnd " + nameEnd );
        if (nameBegin !== 0 || nameEnd === -1) return;

        if (silent) {
            return true;
        }

        var tokenType = symbolMap[beginSymbol];

        const tokenValue = value.substring(nameBegin+2, nameEnd);
        const token = beginSymbol + tokenValue + endSymbol;

        console.log("found token with value: " + beginSymbol + " :: "+ tokenValue + " :: " + endSymbol + " with type of: " + tokenType);

        return eat(token) ({
            type: tokenType,
            value: tokenValue
            // children: [{ type: "text", value: tokenValue }]
        });
    }

    tokenizer.locator = locator;

    const Parser = this.Parser;

    // Inject some sweet inline prototypes
    const inlineTokenizers = Parser.prototype.inlineTokenizers;
    const inlineMethods = Parser.prototype.inlineMethods;

    // Add an inline tokenizer (defined in the following example).
    inlineTokenizers.copyToken = tokenizer;
    inlineMethods.splice(inlineMethods.indexOf('autoLink'), 0, 'copyToken');
}

module.exports = plugin;
