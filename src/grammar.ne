@{%
    const moo = require('moo')

    const lexer = moo.compile({
        p_left:     '(',
        p_right:    ')',
        pipe:       '|',
        box:        '@',
        as:         ':=',
        eq:         '=',
        star:       '*',
        id:         { match: /[a-zA-Z0-9$!?\.\-]+/, type: moo.keywords({ assert: ['assert'] }) },
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

    const PROGRAM = (statements, body) => ({
        type: 'PROGRAM',
        statements,
    })

    const BOX = (identifier) => ({
        type: 'BOX',
        value: identifier.value
    })

    const STAR = {}
%}

@lexer lexer

Program -> NewLine:* EntryList NewLine:*
    {% ([_1, declarations, _2]) => PROGRAM(declarations) %}

EntryList -> Entry (NewLine:+ Entry):*
    {% converge([nth(1, identity), nth(2, map(second))], concat) %}

Entry ->
      Declaration {% nth(1, identity) %}
    | Assertion {% nth(1, identity) %}

Declaration ->
    Identifier ArgumentList:? _:? Assign _:? Expression SideEffect:*
    {% ([name, args, _1, _2, _3, body, se]) => DECLARATION(name, args, body, se) %}

SideEffect -> NewLine _:* Pipe _:+ Expression {% nth(5, identity) %}

Assertion -> Assert _ Identifier _:? Equals _:? Expression
    {% ([_a, _1, name, _2, _3, _4, body ]) => ASSERTION(name, body) %}

Expression ->
      Identifier (_ Value):*
        {% converge([nth(1, identity), nth(2, map(second))], concat) %}
    | Value _ Identifier _ Value (_ Identifier _ Value):+ {%
        ([v1, _1, id, _2, v2, tails], l, reject) => {
            const result = [[id, v1], [id, v2], ...tails.map(([_1, id, _2, value]) => [id, value])]

            const isSameId = result.every(([tid]) => tid.type === id.type && tid.value === id.value)

            if (isSameId) {
                return result.reduceRight((acc, [id, value]) => [id, value, acc])
            } else {
                return reject
            }
        }
      %}

Value ->
      Symbol {% nth(1, identity) %}
    | Identifier {% nth(1, identity) %}
    | Box {% nth(1, identity) %}
    | %p_left Expression %p_right {% nth(2, identity) %}

ArgumentList -> (_ Identifier):+ {% nth(1, map(second)) %}

Box -> %box Identifier {% nth(2, BOX) %}
Identifier -> Star:? %id {% ([star, id]) => IDENTIFIER(id, star) %}
Symbol -> %sym {% nth(1, SYMBOL) %}

EmptyLine -> NewLine NewLine {% nil %}
Assert -> %assert {% nil %}
NewLine -> %nl {% nil %}
Equals -> %eq {% nil %}
Assign -> %as {% nil %}
_ -> %ws {% nil %}
Pipe -> %pipe {% nil %}
Star -> %star {% () => STAR %}
Dot -> %dot {% nil %}