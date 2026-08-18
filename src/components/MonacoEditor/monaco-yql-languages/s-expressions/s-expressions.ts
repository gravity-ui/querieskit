import {type languages} from '../fillers/monaco-editor-core';
import {
    builtinFunctions,
    keywords,
    operators,
    scopeKeywords,
    typeKeywords,
} from './s-expressions.keywords';

export const LANGUAGE_ID = 's-expression';

const TokenClassConsts = {
    BINARY: 'binary',
    BINARY_ESCAPE: 'binary.escape',
    COMMENT: 'comment',
    COMMENT_QUOTE: 'comment.quote',
    DELIMITER: 'delimiter',
    IDENTIFIER: 'identifier',
    KEYWORD: 'keyword',
    KEYWORD_SCOPE: 'keyword.scope',
    NUMBER: 'number',
    NUMBER_FLOAT: 'number.float',
    NUMBER_HEX: 'number.hex',
    OPERATOR_KEYWORD: 'operator.keyword',
    OPERATOR_SYMBOL: 'operator.symbol',
    PREDEFINED: 'predefined',
    STRING: 'string',
    STRING_ESCAPE: 'string.escape',
    TYPE: 'type',
    VARIABLE: 'variable',
    WHITE: 'white',
};

export const conf: languages.LanguageConfiguration = {
    comments: {
        lineComment: '#',
    },
    brackets: [
        ['{', '}'],
        ['[', ']'],
        ['(', ')'],
    ],
    autoClosingPairs: [
        {open: '{', close: '}'},
        {open: '[', close: ']'},
        {open: '(', close: ')'},
        {open: '"', close: '"'},
        {open: "'", close: "'"},
        {open: '`', close: '`'},
    ],
    surroundingPairs: [
        {open: '{', close: '}'},
        {open: '[', close: ']'},
        {open: '(', close: ')'},
        {open: '"', close: '"'},
        {open: "'", close: "'"},
        {open: '`', close: '`'},
    ],
};

export const language: languages.IMonarchLanguage & Record<string, unknown> = {
    defaultToken: 'text',
    ignoreCase: true,
    tokenPostfix: '.yql',

    brackets: [
        {open: '[', close: ']', token: 'delimiter.square'},
        {open: '(', close: ')', token: 'delimiter.parenthesis'},
        {open: '{', close: '}', token: 'delimiter.curly'},
    ],

    builtinFunctions,
    builtinVariables: [],
    keywords,
    typeKeywords,
    scopeKeywords,
    operators,
    pseudoColumns: [],

    escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

    tokenizer: {
        root: [
            {include: '@comments'},
            {include: '@whitespace'},
            {include: '@pseudoColumns'},
            {include: '@numbers'},
            {include: '@binaries'},
            {include: '@strings'},
            {include: '@scopes'},
            {include: '@complexDataTypes'},
            [/[;,.]/, TokenClassConsts.DELIMITER],
            [/[(){}[\]]/, '@brackets'],
            [/yt\.`(\/\/.*?)`/g, {token: 'path'}],
            [
                /[\w@#$]+/,
                {
                    cases: {
                        '@scopeKeywords': TokenClassConsts.KEYWORD_SCOPE,
                        '@operators': TokenClassConsts.OPERATOR_KEYWORD,
                        '@typeKeywords': TokenClassConsts.TYPE,
                        '@builtinVariables': TokenClassConsts.VARIABLE,
                        '@builtinFunctions': TokenClassConsts.PREDEFINED,
                        '@keywords': TokenClassConsts.KEYWORD,
                        '@default': TokenClassConsts.IDENTIFIER,
                    },
                },
            ],
            [/[<>=!%&+\-*/|~^]/, TokenClassConsts.OPERATOR_SYMBOL],
        ],
        whitespace: [[/[\s\t\r\n]+/, TokenClassConsts.WHITE]],
        comments: [
            [/--+.*/, TokenClassConsts.COMMENT],
            [/\/\*/, {token: TokenClassConsts.COMMENT_QUOTE, next: '@comment'}],
        ],
        comment: [
            [/[^*/]+/, TokenClassConsts.COMMENT],
            [/\*\//, {token: TokenClassConsts.COMMENT_QUOTE, next: '@pop'}],
            [/./, TokenClassConsts.COMMENT],
        ],
        pseudoColumns: [
            [
                /[$][A-Za-z_][\w@#$]*/,
                {
                    cases: {
                        '@pseudoColumns': TokenClassConsts.PREDEFINED,
                        '@default': TokenClassConsts.IDENTIFIER,
                    },
                },
            ],
        ],
        numbers: [
            [/0[xX][0-9a-fA-F]*/, TokenClassConsts.NUMBER_HEX],
            [/[$][+-]*\d*(\.\d*)?/, TokenClassConsts.NUMBER],
            [/((\d+(\.\d*)?)|(\.\d+))([eE][-+]?\d+)?/, TokenClassConsts.NUMBER_FLOAT],
        ],
        binaries: [
            [/X'/i, {token: TokenClassConsts.BINARY, next: '@binarySingle'}],
            [/X"/i, {token: TokenClassConsts.BINARY, next: '@binaryDouble'}],
        ],
        binarySingle: [
            [/\d+/, TokenClassConsts.BINARY_ESCAPE],
            [/''/, TokenClassConsts.BINARY],
            [/'/, {token: TokenClassConsts.BINARY, next: '@pop'}],
        ],
        binaryDouble: [
            [/\d+/, TokenClassConsts.BINARY_ESCAPE],
            [/""/, TokenClassConsts.BINARY],
            [/"/, {token: TokenClassConsts.BINARY, next: '@pop'}],
        ],
        strings: [
            [/'/, {token: TokenClassConsts.STRING, next: '@stringSingle'}],
            [/R'/i, {token: TokenClassConsts.STRING, next: '@stringSingle'}],
            [/"/, {token: TokenClassConsts.STRING, next: '@stringDouble'}],
            [/R"/i, {token: TokenClassConsts.STRING, next: '@stringDouble'}],
        ],
        stringSingle: [
            [/[^']+/, TokenClassConsts.STRING_ESCAPE],
            [/''/, TokenClassConsts.STRING],
            [/'/, {token: TokenClassConsts.STRING, next: '@pop'}],
        ],
        stringDouble: [
            [/[^"]+/, TokenClassConsts.STRING_ESCAPE],
            [/""/, TokenClassConsts.STRING],
            [/"/, {token: TokenClassConsts.STRING, next: '@pop'}],
        ],
        scopes: [],
        complexDataTypes: [],
    },
};
