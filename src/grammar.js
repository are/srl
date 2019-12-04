// Generated automatically by nearley, version 2.19.0
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

    const moo = require('moo')

    const lexer = moo.compile({
        p_left:     '(',
        p_right:    ')',
        pipe:       '|',
        box:        '#',
        at:         '@',
        as:         ':=',
        colon:      ':',
        eq:         '=',
        star:       '*',
        id:         { match: /[a-zA-Z0-9$!?\.\-]+/, type: moo.keywords({
            assert: ['assert'],
        }) },
        ws:         /[ \t]+/,
        sym:        /\<[0-9]+\>/,
        nl:         { match: /\r?\n/, lineBreaks: true }
    })

    const identity = a => a
    const nth = (n, f) => (a) => f(a[n - 1])
    const map = (f) => (a) => a.map(f)
    const second = (a) => a[1]

    const converge = (fs, c) => (a) => c(...fs.map(f => f(a)))
    const concat = (...els) => els.reduce((r, e) => [...r, ...(Array.isArray(e) ? e : [e]) ], [])

    const nil = () => null

    const IDENTIFIER = (token, starToken) => ({
        type: 'IDENTIFIER',
        value: token.value,
        hasStar: starToken !== null
    })

    const SYMBOL = (token) => ({
        type: 'SYMBOL',
        value: parseFloat(token.value.substr(1))
    })

    const EXPRESSION = (body) => ({
        type: 'EXPRESSION',
        value: body
    })

    const DECLARATION = (name, args, body, se) => ({
        type: 'DECLARATION',
        name,
        args,
        body,
        sideEffects: se
    })

    const ASSERTION = (name, body) => ({
        type: 'ASSERTION',
        name,
        body
    })

    const IMPORT = (name, ids) => ({
        type: 'IMPORT',
        name,
        ids
    })

    const PROGRAM = (statements, body) => ({
        type: 'PROGRAM',
        statements,
    })

    const BOX = (identifier) => ({
        type: 'BOX',
        value: identifier.value
    })

    const STAR = {}
var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "Program$ebnf$1", "symbols": []},
    {"name": "Program$ebnf$1", "symbols": ["Program$ebnf$1", "NewLine"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "Program$ebnf$2", "symbols": []},
    {"name": "Program$ebnf$2", "symbols": ["Program$ebnf$2", "NewLine"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "Program", "symbols": ["Program$ebnf$1", "EntryList", "Program$ebnf$2"], "postprocess": ([_1, declarations, _2]) => PROGRAM(declarations)},
    {"name": "EntryList$ebnf$1", "symbols": []},
    {"name": "EntryList$ebnf$1$subexpression$1$ebnf$1", "symbols": ["NewLine"]},
    {"name": "EntryList$ebnf$1$subexpression$1$ebnf$1", "symbols": ["EntryList$ebnf$1$subexpression$1$ebnf$1", "NewLine"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "EntryList$ebnf$1$subexpression$1", "symbols": ["EntryList$ebnf$1$subexpression$1$ebnf$1", "Entry"]},
    {"name": "EntryList$ebnf$1", "symbols": ["EntryList$ebnf$1", "EntryList$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "EntryList", "symbols": ["Entry", "EntryList$ebnf$1"], "postprocess": converge([nth(1, identity), nth(2, map(second))], concat)},
    {"name": "Entry", "symbols": ["Declaration"], "postprocess": nth(1, identity)},
    {"name": "Entry", "symbols": ["Assertion"], "postprocess": nth(1, identity)},
    {"name": "Entry", "symbols": ["Import"], "postprocess": nth(1, identity)},
    {"name": "Declaration$ebnf$1", "symbols": ["ArgumentList"], "postprocess": id},
    {"name": "Declaration$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "Declaration$ebnf$2", "symbols": ["_"], "postprocess": id},
    {"name": "Declaration$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "Declaration$ebnf$3", "symbols": ["_"], "postprocess": id},
    {"name": "Declaration$ebnf$3", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "Declaration$ebnf$4", "symbols": []},
    {"name": "Declaration$ebnf$4", "symbols": ["Declaration$ebnf$4", "SideEffect"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "Declaration", "symbols": ["Identifier", "Declaration$ebnf$1", "Declaration$ebnf$2", "Assign", "Declaration$ebnf$3", "Expression", "Declaration$ebnf$4"], "postprocess": ([name, args, _1, _2, _3, body, se]) => DECLARATION(name, args, body, se)},
    {"name": "SideEffect$ebnf$1", "symbols": []},
    {"name": "SideEffect$ebnf$1", "symbols": ["SideEffect$ebnf$1", "_"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "SideEffect$ebnf$2", "symbols": ["_"]},
    {"name": "SideEffect$ebnf$2", "symbols": ["SideEffect$ebnf$2", "_"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "SideEffect", "symbols": ["NewLine", "SideEffect$ebnf$1", "Pipe", "SideEffect$ebnf$2", "Expression"], "postprocess": nth(5, identity)},
    {"name": "Assertion$ebnf$1", "symbols": ["_"], "postprocess": id},
    {"name": "Assertion$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "Assertion$ebnf$2", "symbols": ["_"], "postprocess": id},
    {"name": "Assertion$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "Assertion", "symbols": ["Assert", "_", "Identifier", "Assertion$ebnf$1", "Equals", "Assertion$ebnf$2", "Expression"], "postprocess": ([_a, _1, name, _2, _3, _4, body ]) => ASSERTION(name, body)},
    {"name": "Import$ebnf$1$subexpression$1", "symbols": ["_", "Identifier"]},
    {"name": "Import$ebnf$1", "symbols": ["Import$ebnf$1$subexpression$1"]},
    {"name": "Import$ebnf$1$subexpression$2", "symbols": ["_", "Identifier"]},
    {"name": "Import$ebnf$1", "symbols": ["Import$ebnf$1", "Import$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "Import", "symbols": ["At", "Identifier", "Colon", "Import$ebnf$1"], "postprocess": ([_a, name, _c, ids]) => IMPORT(name, map(second)(ids))},
    {"name": "Expression$ebnf$1", "symbols": []},
    {"name": "Expression$ebnf$1$subexpression$1", "symbols": ["_", "Value"]},
    {"name": "Expression$ebnf$1", "symbols": ["Expression$ebnf$1", "Expression$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "Expression", "symbols": ["Identifier", "Expression$ebnf$1"], "postprocess": converge([nth(1, identity), nth(2, map(second))], concat)},
    {"name": "Expression$ebnf$2$subexpression$1", "symbols": ["_", "Identifier", "_", "Value"]},
    {"name": "Expression$ebnf$2", "symbols": ["Expression$ebnf$2$subexpression$1"]},
    {"name": "Expression$ebnf$2$subexpression$2", "symbols": ["_", "Identifier", "_", "Value"]},
    {"name": "Expression$ebnf$2", "symbols": ["Expression$ebnf$2", "Expression$ebnf$2$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "Expression", "symbols": ["Value", "_", "Identifier", "_", "Value", "Expression$ebnf$2"], "postprocess": 
        ([v1, _1, id, _2, v2, tails], l, reject) => {
            const result = [[id, v1], [id, v2], ...tails.map(([_1, id, _2, value]) => [id, value])]
        
            const isSameId = result.every(([tid]) => tid.type === id.type && tid.value === id.value)
        
            if (isSameId) {
                return result.reduceRight((acc, [id, value]) => [id, value, acc])
            } else {
                return reject
            }
        }
              },
    {"name": "Value", "symbols": ["Symbol"], "postprocess": nth(1, identity)},
    {"name": "Value", "symbols": ["Identifier"], "postprocess": nth(1, identity)},
    {"name": "Value", "symbols": ["Box"], "postprocess": nth(1, identity)},
    {"name": "Value", "symbols": [(lexer.has("p_left") ? {type: "p_left"} : p_left), "Expression", (lexer.has("p_right") ? {type: "p_right"} : p_right)], "postprocess": nth(2, identity)},
    {"name": "ArgumentList$ebnf$1$subexpression$1", "symbols": ["_", "Identifier"]},
    {"name": "ArgumentList$ebnf$1", "symbols": ["ArgumentList$ebnf$1$subexpression$1"]},
    {"name": "ArgumentList$ebnf$1$subexpression$2", "symbols": ["_", "Identifier"]},
    {"name": "ArgumentList$ebnf$1", "symbols": ["ArgumentList$ebnf$1", "ArgumentList$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "ArgumentList", "symbols": ["ArgumentList$ebnf$1"], "postprocess": nth(1, map(second))},
    {"name": "Box", "symbols": [(lexer.has("box") ? {type: "box"} : box), "Identifier"], "postprocess": nth(2, BOX)},
    {"name": "Identifier$ebnf$1", "symbols": ["Star"], "postprocess": id},
    {"name": "Identifier$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "Identifier", "symbols": ["Identifier$ebnf$1", (lexer.has("id") ? {type: "id"} : id)], "postprocess": ([star, id]) => IDENTIFIER(id, star)},
    {"name": "Symbol", "symbols": [(lexer.has("sym") ? {type: "sym"} : sym)], "postprocess": nth(1, SYMBOL)},
    {"name": "EmptyLine", "symbols": ["NewLine", "NewLine"], "postprocess": nil},
    {"name": "Assert", "symbols": [(lexer.has("assert") ? {type: "assert"} : assert)], "postprocess": nil},
    {"name": "NewLine", "symbols": [(lexer.has("nl") ? {type: "nl"} : nl)], "postprocess": nil},
    {"name": "Equals", "symbols": [(lexer.has("eq") ? {type: "eq"} : eq)], "postprocess": nil},
    {"name": "Assign", "symbols": [(lexer.has("as") ? {type: "as"} : as)], "postprocess": nil},
    {"name": "_", "symbols": [(lexer.has("ws") ? {type: "ws"} : ws)], "postprocess": nil},
    {"name": "Pipe", "symbols": [(lexer.has("pipe") ? {type: "pipe"} : pipe)], "postprocess": nil},
    {"name": "Star", "symbols": [(lexer.has("star") ? {type: "star"} : star)], "postprocess": () => STAR},
    {"name": "Dot", "symbols": [(lexer.has("dot") ? {type: "dot"} : dot)], "postprocess": nil},
    {"name": "At", "symbols": [(lexer.has("at") ? {type: "at"} : at)], "postprocess": nil},
    {"name": "Colon", "symbols": [(lexer.has("colon") ? {type: "colon"} : colon)], "postprocess": nil}
]
  , ParserStart: "Program"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
