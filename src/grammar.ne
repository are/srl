@{%
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
%}

@lexer lexer

Program -> NewLine:* DeclarationList EmptyLine:+ Expression NewLine:*
    {% ([_1, declarations, _2, body]) => PROGRAM(declarations, body) %}

DeclarationList -> Declaration (NewLine:+ Declaration):*
    {% converge([nth(1, identity), nth(2, map(second))], concat) %}

Declaration ->
    Identifier ArgumentList:? _:? Equals _:? Expression SideEffect:*
    {% ([name, args, _1, _2, _3, body, se]) => DECLARATION(name, args, body, se) %}

SideEffect -> NewLine _:* Pipe _:+ Expression {% nth(5, identity) %}

Expression -> Identifier (_ Value):*
    {% converge([nth(1, identity), nth(2, map(second))], concat) %}

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
NewLine -> %nl {% nil %}
Equals -> %eq {% nil %}
_ -> %ws {% nil %}
Pipe -> %pipe {% nil %}
Star -> %star {% () => STAR %}
