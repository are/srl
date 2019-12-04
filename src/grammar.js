// Generated automatically by nearley, version 2.19.0
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

    const moo = require('moo')

    const lexer = moo.compile({
        p_left:     '(',
        p_right:    ')',
        pipe:       '|',
        box:        '@',
        eq:         '=',
        star:       '*',
        id:         /[a-zA-Z0-9$!?\.\-]+/,
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

    const PROGRAM = (declarations, body) => ({
        type: 'PROGRAM',
        declarations,
        body
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
    {"name": "Program$ebnf$2", "symbols": ["EmptyLine"]},
    {"name": "Program$ebnf$2", "symbols": ["Program$ebnf$2", "EmptyLine"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "Program$ebnf$3", "symbols": []},
    {"name": "Program$ebnf$3", "symbols": ["Program$ebnf$3", "NewLine"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "Program", "symbols": ["Program$ebnf$1", "DeclarationList", "Program$ebnf$2", "Expression", "Program$ebnf$3"], "postprocess": ([_1, declarations, _2, body]) => PROGRAM(declarations, body)},
    {"name": "DeclarationList$ebnf$1", "symbols": []},
    {"name": "DeclarationList$ebnf$1$subexpression$1$ebnf$1", "symbols": ["NewLine"]},
    {"name": "DeclarationList$ebnf$1$subexpression$1$ebnf$1", "symbols": ["DeclarationList$ebnf$1$subexpression$1$ebnf$1", "NewLine"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "DeclarationList$ebnf$1$subexpression$1", "symbols": ["DeclarationList$ebnf$1$subexpression$1$ebnf$1", "Declaration"]},
    {"name": "DeclarationList$ebnf$1", "symbols": ["DeclarationList$ebnf$1", "DeclarationList$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "DeclarationList", "symbols": ["Declaration", "DeclarationList$ebnf$1"], "postprocess": converge([nth(1, identity), nth(2, map(second))], concat)},
    {"name": "Declaration$ebnf$1", "symbols": ["ArgumentList"], "postprocess": id},
    {"name": "Declaration$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "Declaration$ebnf$2", "symbols": ["_"], "postprocess": id},
    {"name": "Declaration$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "Declaration$ebnf$3", "symbols": ["_"], "postprocess": id},
    {"name": "Declaration$ebnf$3", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "Declaration$ebnf$4", "symbols": []},
    {"name": "Declaration$ebnf$4", "symbols": ["Declaration$ebnf$4", "SideEffect"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "Declaration", "symbols": ["Identifier", "Declaration$ebnf$1", "Declaration$ebnf$2", "Equals", "Declaration$ebnf$3", "Expression", "Declaration$ebnf$4"], "postprocess": ([name, args, _1, _2, _3, body, se]) => DECLARATION(name, args, body, se)},
    {"name": "SideEffect$ebnf$1", "symbols": []},
    {"name": "SideEffect$ebnf$1", "symbols": ["SideEffect$ebnf$1", "_"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "SideEffect$ebnf$2", "symbols": ["_"]},
    {"name": "SideEffect$ebnf$2", "symbols": ["SideEffect$ebnf$2", "_"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "SideEffect", "symbols": ["NewLine", "SideEffect$ebnf$1", "Pipe", "SideEffect$ebnf$2", "Expression"], "postprocess": nth(5, identity)},
    {"name": "Expression$ebnf$1", "symbols": []},
    {"name": "Expression$ebnf$1$subexpression$1", "symbols": ["_", "Value"]},
    {"name": "Expression$ebnf$1", "symbols": ["Expression$ebnf$1", "Expression$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "Expression", "symbols": ["Identifier", "Expression$ebnf$1"], "postprocess": converge([nth(1, identity), nth(2, map(second))], concat)},
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
    {"name": "NewLine", "symbols": [(lexer.has("nl") ? {type: "nl"} : nl)], "postprocess": nil},
    {"name": "Equals", "symbols": [(lexer.has("eq") ? {type: "eq"} : eq)], "postprocess": nil},
    {"name": "_", "symbols": [(lexer.has("ws") ? {type: "ws"} : ws)], "postprocess": nil},
    {"name": "Pipe", "symbols": [(lexer.has("pipe") ? {type: "pipe"} : pipe)], "postprocess": nil},
    {"name": "Star", "symbols": [(lexer.has("star") ? {type: "star"} : star)], "postprocess": () => STAR}
]
  , ParserStart: "Program"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
