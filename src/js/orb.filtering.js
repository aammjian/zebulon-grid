/**
 * @fileOverview Pivot Grid axe viewmodel
 * @author Najmeddine Nouri <najmno@gmail.com>
 */
'use strict';
/* global module, require */
/*jshint eqnull: true*/
var utils = require('./orb.utils');
exports.ALL = '#All#';
exports.NONE = '#None#';
exports.BLANK = '#Blank#"';
var ExpressionFilter = (function () {
    function ExpressionFilter(operator, term, staticValue, excludeStatic) {
        this.regexpMode = false;
        this.operator = exports.Operators.get(operator);
        this.term = term || null;
        if (this.term && this.operator && this.operator.regexpSupported) {
            if (utils.isRegExp(this.term)) {
                this.regexpMode = true;
                if (!this.term.ignoreCase) {
                    this.term = new RegExp(this.term.source, 'i');
                }
            }
        }
        this.staticValue = staticValue;
        this.excludeStatic = excludeStatic;
    }
    ExpressionFilter.prototype.test = function (value) {
        if (utils.isArray(this.staticValue)) {
            var found = this.staticValue.indexOf(value) >= 0;
            return (this.excludeStatic && !found) || (!this.excludeStatic && found);
        }
        else if (this.term) {
            return this.operator.func(value, this.term);
        }
        else if (this.staticValue === true || this.staticValue === exports.ALL) {
            return true;
        }
        else if (this.staticValue === false || this.staticValue === exports.NONE) {
            return false;
        }
        else {
            return true;
        }
    };
    ;
    ExpressionFilter.prototype.isAlwaysTrue = function () {
        return !(this.term || utils.isArray(this.staticValue) || this.staticValue === exports.NONE || this.staticValue === false);
    };
    ;
    return ExpressionFilter;
}());
exports.ExpressionFilter = ExpressionFilter;
;
exports.Operators = {
    get: function (opname) {
        switch (opname) {
            case this.MATCH.name: return this.MATCH;
            case this.NOTMATCH.name: return this.NOTMATCH;
            case this.EQ.name: return this.EQ;
            case this.NEQ.name: return this.NEQ;
            case this.GT.name: return this.GT;
            case this.GTE.name: return this.GTE;
            case this.LT.name: return this.LT;
            case this.LTE.name: return this.LTE;
            default: return this.NONE;
        }
    },
    NONE: null,
    MATCH: {
        name: 'Matches',
        func: function (value, term) {
            if (value) {
                return value.toString().search(utils.isRegExp(term) ? term : new RegExp(term, 'i')) >= 0;
            }
            else {
                return !(!!term);
            }
        },
        regexpSupported: true
    },
    NOTMATCH: {
        name: 'Does Not Match',
        func: function (value, term) {
            if (value) {
                return value.toString().search(utils.isRegExp(term) ? term : new RegExp(term, 'i')) < 0;
            }
            else {
                return !!term;
            }
        },
        regexpSupported: true
    },
    EQ: {
        name: '=',
        func: function (value, term) {
            return value == term;
        },
        regexpSupported: false
    },
    NEQ: {
        name: '<>',
        func: function (value, term) {
            return value != term;
        },
        regexpSupported: false
    },
    GT: {
        name: '>',
        func: function (value, term) {
            return value > term;
        },
        regexpSupported: false
    },
    GTE: {
        name: '>=',
        func: function (value, term) {
            return value >= term;
        },
        regexpSupported: false
    },
    LT: {
        name: '<',
        func: function (value, term) {
            return value < term;
        },
        regexpSupported: false
    },
    LTE: {
        name: '<=',
        func: function (value, term) {
            return value <= term;
        },
        regexpSupported: false
    }
};
