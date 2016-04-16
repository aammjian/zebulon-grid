/**
 * @fileOverview orb.query
 * @author Najmeddine Nouri <najmno@gmail.com>
 */
'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/* global module, require */
/*jshint eqnull: true*/
var utils = require('./orb.utils');
var orb_axe_1 = require('./orb.axe');
var aggregation = require('./orb.aggregation');
var Query = (function () {
    function Query(source, fieldsConfig) {
        if (utils.isArray(source)) {
            return new ArrayQuery(source).setup(fieldsConfig);
        }
        else {
            // assume it's a pgrid
            return function (parameters) {
                return new PGridQuery(source).setup(parameters);
            };
        }
    }
    return Query;
}());
exports.Query = Query;
var QueryBase = (function () {
    function QueryBase(source, query, filters) {
        this.source = source;
        this.query = query;
        this.filters = filters;
    }
    QueryBase.prototype.extractResult = function (aggs, options, outerArgs) {
        if (outerArgs.multi === true) {
            var res = {};
            for (var ai = 0; ai < options.multiFieldNames.length; ai++) {
                res[options.multiFieldNames[ai]] = aggs[this.getCaptionName(options.multiFieldNames[ai])];
            }
            return res;
        }
        else {
            return aggs[outerArgs.datafieldname];
        }
    };
    ;
    QueryBase.prototype.measureFunc = function (datafieldname, multi, aggregateFunc, fieldsConfig) {
        var outerArgs = {
            datafieldname: this.getCaptionName(datafieldname),
            multi: multi,
            aggregateFunc: aggregateFunc
        };
        return function (options) {
            options = this.cleanOptions(options, arguments, outerArgs);
            var aggs = this.compute(options, fieldsConfig, multi);
            return this.extractResult(aggs, options, outerArgs);
        };
    };
    ;
    QueryBase.prototype.setDefaultAggFunctions = function (param) {
        /*********************
         * val() function    *
         *********************/
        // if there is a registered field with a name or caption 'val', use 'val_'
        var valname = this.query.val ? 'val_' : 'val';
        this.query[valname] = this.measureFunc(undefined, true, undefined, param);
        /*********************
         * sum(), avg(), ... *
         *********************/
        var aggFunctions = utils.ownProperties(aggregation);
        for (var funcIndex = 0; funcIndex < aggFunctions.length; funcIndex++) {
            var funcName = aggFunctions[funcIndex];
            if (funcName !== 'toAggregateFunc') {
                this.query[funcName] = this.measureFunc(undefined, true, aggregation[funcName], param);
            }
        }
    };
    ;
    return QueryBase;
}());
;
var PGridQuery = (function (_super) {
    __extends(PGridQuery, _super);
    function PGridQuery(pgrid) {
        _super.call(this, pgrid, {}, {});
    }
    PGridQuery.prototype.getCaptionName = function (caption) {
        return this.source.config.captionToName(caption);
    };
    ;
    PGridQuery.prototype.cleanOptions = function (options, innerArgs, outerArgs) {
        var opts = {
            fieldNames: [],
            aggregateFunc: null,
            multiFieldNames: []
        };
        if (outerArgs.multi === true) {
            if (options && typeof options === 'object') {
                opts.aggregateFunc = options.aggregateFunc;
                opts.multiFieldNames = options.fields;
            }
            else {
                opts.aggregateFunc = outerArgs.aggregateFunc;
                opts.multiFieldNames = innerArgs;
            }
            for (var ai = 0; ai < opts.multiFieldNames.length; ai++) {
                opts.fieldNames.push(this.getCaptionName(opts.multiFieldNames[ai]));
            }
        }
        else {
            opts.aggregateFunc = options;
            opts.fieldNames.push(outerArgs.datafieldname);
        }
        if (opts.aggregateFunc) {
            opts.aggregateFunc = aggregation.toAggregateFunc(opts.aggregateFunc);
        }
        return opts;
    };
    ;
    PGridQuery.prototype.setup = function (parameters) {
        var rowFields = this.source.config.rowFields;
        var colFields = this.source.config.columnFields;
        var datafields = this.source.config.dataFields;
        var fIndex;
        // row fields setup
        for (fIndex = 0; fIndex < rowFields.length; fIndex++) {
            this.slice(rowFields[fIndex], orb_axe_1.AxeType.ROWS, rowFields.length - fIndex);
        }
        // column fields setup
        for (fIndex = 0; fIndex < colFields.length; fIndex++) {
            this.slice(colFields[fIndex], orb_axe_1.AxeType.COLUMNS, colFields.length - fIndex);
        }
        // data fields setup
        for (fIndex = 0; fIndex < datafields.length; fIndex++) {
            var df = datafields[fIndex];
            var dfname = df.name;
            var dfcaption = df.caption || dfname;
            this.query[dfname] = this.query[dfcaption] = _super.prototype.measureFunc.call(this, dfname);
        }
        if (parameters) {
            for (var param in parameters) {
                if (parameters.hasOwnProperty(param)) {
                    this.query[param](parameters[param]);
                }
            }
        }
        _super.prototype.setDefaultAggFunctions.call(this);
        return this.query;
    };
    ;
    PGridQuery.prototype.slice = function (field, axetype, depth) {
        this.query[field.name] = this.query[field.caption || field.name] = function (val) {
            var f = {
                name: field.name,
                val: val,
                depth: depth
            };
            (this.filters[axetype] = this.filters[axetype] || []).push(f);
            return this.query;
        };
    };
    ;
    PGridQuery.prototype.filterDimensions = function (upperDims, filter) {
        return function (dim) {
            return dim.value === filter.val &&
                (!upperDims || upperDims.some(function (upperDim) {
                    var parent = dim.parent;
                    if (parent) {
                        while (parent.depth < upperDim.depth) {
                            parent = parent.parent;
                        }
                    }
                    return parent === upperDim;
                }));
        };
    };
    PGridQuery.prototype.applyFilters = function (axetype) {
        if (this.filters[axetype]) {
            var sortedFilters = this.filters[axetype].sort(function (f1, f2) {
                return f2.depth - f1.depth;
            });
            var currAxe = this.source[axetype === orb_axe_1.AxeType.ROWS ? 'rows' : 'columns'];
            var filterIndex = 0;
            var filtered = null;
            while (filterIndex < sortedFilters.length) {
                var filter = sortedFilters[filterIndex];
                filtered = currAxe.dimensionsByDepth[filter.depth]
                    .filter(this.filterDimensions(filtered, filter));
                filterIndex++;
            }
            return filtered;
        }
        return null;
    };
    ;
    PGridQuery.prototype.compute = function (options) {
        var rowdims = this.applyFilters(orb_axe_1.AxeType.ROWS) || [this.source.rows.root];
        var coldims = this.applyFilters(orb_axe_1.AxeType.COLUMNS) || [this.source.columns.root];
        var aggs;
        if (rowdims.length === 1 && coldims.length === 1) {
            aggs = {};
            for (var ai = 0; ai < options.fieldNames.length; ai++) {
                aggs[options.fieldNames[ai]] = this.source.getData(options.fieldNames[ai], rowdims[0], coldims[0], options.aggregateFunc);
            }
        }
        else {
            var rowIndexes = [];
            var colIndexes = [];
            for (var rdi = 0; rdi < rowdims.length; rdi++) {
                rowIndexes = rowIndexes.concat(rowdims[rdi].getRowIndexes());
            }
            for (var cdi = 0; cdi < coldims.length; cdi++) {
                colIndexes = colIndexes.concat(coldims[cdi].getRowIndexes());
            }
            aggs = this.source.calcAggregation(rowIndexes, colIndexes, options.fieldNames, options.aggregateFunc);
        }
        return aggs;
    };
    ;
    return PGridQuery;
}(QueryBase));
;
var ArrayQuery = (function (_super) {
    __extends(ArrayQuery, _super);
    function ArrayQuery(array) {
        _super.call(this, array, {}, []);
        this.captionToName = {};
    }
    ArrayQuery.prototype.setCaptionName = function (caption, name) {
        this.captionToName[caption || name] = name;
    };
    ;
    ArrayQuery.prototype.getCaptionName = function (caption) {
        return this.captionToName[caption] || caption;
    };
    ;
    ArrayQuery.prototype.cleanOptions = function (options, innerArgs, outerArgs) {
        var opts = {
            fieldNames: [],
            aggregateFunc: null,
            multiFieldNames: []
        };
        if (outerArgs.multi === true) {
            if (options && typeof options === 'object') {
                opts.aggregateFunc = options.aggregateFunc;
                opts.multiFieldNames = options.fields;
            }
            else {
                opts.aggregateFunc = outerArgs.aggregateFunc;
                opts.multiFieldNames = innerArgs;
            }
            for (var ai = 0; ai < opts.multiFieldNames.length; ai++) {
                opts.fieldNames.push(this.getCaptionName(opts.multiFieldNames[ai]));
            }
        }
        else {
            opts.aggregateFunc = options || outerArgs.aggregateFunc;
            opts.fieldNames.push(outerArgs.datafieldname);
        }
        return opts;
    };
    ;
    ArrayQuery.prototype.setup = function (fieldsConfig) {
        this.query.slice = function (field, val) {
            var f = {
                name: field,
                val: val
            };
            this.filters.push(f);
            return this.query;
        };
        if (fieldsConfig) {
            var fieldNames = utils.ownProperties(fieldsConfig);
            for (var fi = 0; fi < fieldNames.length; fi++) {
                var fname = fieldNames[fi];
                var f = fieldsConfig[fname];
                var fcaption = f.caption || f.name;
                f.name = fname;
                this.setCaptionName(fcaption, fname);
                if (f.toAggregate) {
                    this.query[fname] = this.query[fcaption] = _super.prototype.measureFunc.call(this, fname, false, f.aggregateFunc);
                }
                else {
                    this.slice(f);
                }
            }
        }
        _super.prototype.setDefaultAggFunctions.call(this, fieldsConfig);
        return this.query;
    };
    ;
    ArrayQuery.prototype.slice = function (field) {
        this.query[field.name] = this.query[field.caption || field.name] = function (val) {
            return this.query.slice(field.name, val);
        };
    };
    ;
    ArrayQuery.prototype.applyFilters = function () {
        var rowIndexes = [];
        for (var i = 0; i < this.source.length; i++) {
            var row = this.source[i];
            var include = true;
            for (var j = 0; j < this.filters.length; j++) {
                var filter = this.filters[j];
                if (row[filter.name] !== filter.val) {
                    include = false;
                    break;
                }
            }
            if (include) {
                rowIndexes.push(i);
            }
        }
        return rowIndexes;
    };
    ;
    ArrayQuery.prototype.compute = function (options, fieldsConfig, multi) {
        var rowIndexes = this.applyFilters();
        var aggs = {};
        for (var ai = 0; ai < options.fieldNames.length; ai++) {
            var datafield = options.fieldNames[ai];
            var aggFunc = aggregation.toAggregateFunc(multi === true ?
                options.aggregateFunc || (fieldsConfig && fieldsConfig[datafield] ?
                    fieldsConfig[datafield].aggregateFunc :
                    undefined) :
                options.aggregateFunc);
            aggs[datafield] = aggFunc(datafield, rowIndexes || 'all', this.source, rowIndexes, null);
        }
        return aggs;
    };
    ;
    return ArrayQuery;
}(QueryBase));
;
