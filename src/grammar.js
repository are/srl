// Generated automatically by nearley, version 2.19.0
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

    const moo = require('moo')

    const lexer = moo.states({
        main: {
            p_left:     '(',
            p_right:    ')',
            cb_left:    { match: '{', push: 'comment' },
            pipe:       '|',
            box:        '#',
            arrow:      '=>>',
            as:         ':=',
            colon:      ':',
            eq:         '=',
            star:       '*',
            id:         { match: /[a-zA-Z0-9$!?\.\-]+/, type: moo.keywords({
                assert: ['assert'],
                imp: ["import"],
            }) },
            ws:         /[ \t]+/,
            sym:        /\<[0-9]+\>/,
            nl:         { match: /\r?\n/, lineBreaks: true }
        },
        comment: {
            comment: { match: /[^}]+/, lineBreaks: true },
            cb_right: { match:'}', pop: true }
        }
    })

    const identity = a => a
    const nth = (n, f) => (a) => f(a[n - 1])
    const map = (f) => (a) => a.map(f)
    const second = (a) => a[1]

    const converge = (fs, c) => (a) => c(...fs.map(f => f(a)))
    const concat = (...els) => els.reduce((r, e) => [...r, ...(Array.isArray(e) ? e : [e]) ], [])

    const nil = () => null
    const lift = x => [x]

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

    const ASSERTION = (name, body, comment, se) => ({
        type: 'ASSERTION',
        name,
        body,
        comment: comment && comment.value,
        sideEffects: se
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

    const UNIT = {
        type: 'UNIT'
    }
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
    {"name": "Assertion$ebnf$1$subexpression$1$ebnf$1", "symbols": ["AnyWhitespace"]},
    {"name": "Assertion$ebnf$1$subexpression$1$ebnf$1", "symbols": ["Assertion$ebnf$1$subexpression$1$ebnf$1", "AnyWhitespace"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "Assertion$ebnf$1$subexpression$1", "symbols": ["AssertionComment", "Assertion$ebnf$1$subexpression$1$ebnf$1"]},
    {"name": "Assertion$ebnf$1", "symbols": ["Assertion$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "Assertion$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "Assertion$ebnf$2", "symbols": ["_"], "postprocess": id},
    {"name": "Assertion$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "Assertion$ebnf$3", "symbols": ["_"], "postprocess": id},
    {"name": "Assertion$ebnf$3", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "Assertion$ebnf$4", "symbols": []},
    {"name": "Assertion$ebnf$4", "symbols": ["Assertion$ebnf$4", "SideEffect"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "Assertion", "symbols": ["Assert", "_", "Assertion$ebnf$1", "Expression", "Assertion$ebnf$2", "Equals", "Assertion$ebnf$3", "AssertionBody", "Assertion$ebnf$4"], "postprocess": ([_a, _1, comment, name, _2, _3, _4, body, se ]) => ASSERTION(name, body, comment && comment[0], se)},
    {"name": "AssertionComment", "symbols": [(lexer.has("cb_left") ? {type: "cb_left"} : cb_left), (lexer.has("comment") ? {type: "comment"} : comment), (lexer.has("cb_right") ? {type: "cb_right"} : cb_right)], "postprocess": ([_, comment]) => comment},
    {"name": "AssertionBody", "symbols": ["Expression"], "postprocess": nth(1, identity)},
    {"name": "AssertionBody", "symbols": ["Symbol"], "postprocess": nth(1, lift)},
    {"name": "AssertionBody", "symbols": ["Box"], "postprocess": nth(1, lift)},
    {"name": "AssertionBody", "symbols": ["Unit"], "postprocess": nth(1, lift)},
    {"name": "Import", "symbols": ["ImportKeyword", "_", "Identifier", "_", "Arrow", "_", "ImportList"], "postprocess": ([_1, _i, name, _2, _a, _3, ids]) => IMPORT(name, ids)},
    {"name": "ImportList", "symbols": ["Star"], "postprocess": () => STAR},
    {"name": "ImportList$ebnf$1", "symbols": []},
    {"name": "ImportList$ebnf$1$subexpression$1", "symbols": ["ImportSeparator", "Identifier"]},
    {"name": "ImportList$ebnf$1", "symbols": ["ImportList$ebnf$1", "ImportList$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "ImportList", "symbols": ["Identifier", "ImportList$ebnf$1"], "postprocess": converge([nth(1, identity), nth(2, map(second))], concat)},
    {"name": "ImportSeparator", "symbols": ["_"], "postprocess": nil},
    {"name": "ImportSeparator", "symbols": ["ImportLineBreak"], "postprocess": nil},
    {"name": "ImportLineBreak", "symbols": ["NewLine", "_", "Arrow", "_"], "postprocess": nil},
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
                let [op, val] = result[result.length - 1]
                return result.slice(0, -1).reduceRight((acc, [id, value]) => [id, value, acc], val)
            } else {
                return reject
            }
        }
              },
    {"name": "Value", "symbols": ["Symbol"], "postprocess": nth(1, identity)},
    {"name": "Value", "symbols": ["Identifier"], "postprocess": nth(1, identity)},
    {"name": "Value", "symbols": ["Box"], "postprocess": nth(1, identity)},
    {"name": "Value", "symbols": [(lexer.has("p_left") ? {type: "p_left"} : p_left), "Expression", (lexer.has("p_right") ? {type: "p_right"} : p_right)], "postprocess": nth(2, identity)},
    {"name": "Value", "symbols": ["Unit"], "postprocess": nth(1, identity)},
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
    {"name": "Unit", "symbols": [(lexer.has("p_left") ? {type: "p_left"} : p_left), (lexer.has("p_right") ? {type: "p_right"} : p_right)], "postprocess": () => UNIT},
    {"name": "AnyWhitespace", "symbols": ["NewLine"], "postprocess": nil},
    {"name": "AnyWhitespace", "symbols": ["_"], "postprocess": nil},
    {"name": "EmptyLine", "symbols": ["NewLine", "NewLine"], "postprocess": nil},
    {"name": "ImportKeyword", "symbols": [(lexer.has("imp") ? {type: "imp"} : imp)], "postprocess": nil},
    {"name": "Assert", "symbols": [(lexer.has("assert") ? {type: "assert"} : assert)], "postprocess": nil},
    {"name": "NewLine", "symbols": [(lexer.has("nl") ? {type: "nl"} : nl)], "postprocess": nil},
    {"name": "Equals", "symbols": [(lexer.has("eq") ? {type: "eq"} : eq)], "postprocess": nil},
    {"name": "Assign", "symbols": [(lexer.has("as") ? {type: "as"} : as)], "postprocess": nil},
    {"name": "_", "symbols": [(lexer.has("ws") ? {type: "ws"} : ws)], "postprocess": nil},
    {"name": "Pipe", "symbols": [(lexer.has("pipe") ? {type: "pipe"} : pipe)], "postprocess": nil},
    {"name": "Star", "symbols": [(lexer.has("star") ? {type: "star"} : star)], "postprocess": () => STAR},
    {"name": "Dot", "symbols": [(lexer.has("dot") ? {type: "dot"} : dot)], "postprocess": nil},
    {"name": "Arrow", "symbols": [(lexer.has("arrow") ? {type: "arrow"} : arrow)], "postprocess": nil},
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
