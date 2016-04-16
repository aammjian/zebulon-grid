/**
 * @fileOverview Pivot Grid axe viewmodel
 * @author Najmeddine Nouri <najmno@gmail.com>
 */
'use strict';
/* global module, require */
/*jshint eqnull: true*/
var utils = require('./orb.utils');
var orb_axe_1 = require('./orb.axe');
var aggregation = require('./orb.aggregation');
var filtering = require('./orb.filtering');
var orb_themes_1 = require('./orb.themes');
function getpropertyvalue(property, configs, defaultvalue) {
    for (var i = 0; i < configs.length; i++) {
        if (configs[i][property] != null) {
            return configs[i][property];
        }
    }
    return defaultvalue;
}
function mergefieldconfigs() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i - 0] = arguments[_i];
    }
    var merged = {
        configs: [],
        sorts: [],
        subtotals: [],
        functions: []
    };
    for (var i = 0; i < args.length; i++) {
        var nnconfig = args[i] || {};
        merged.configs.push(nnconfig);
        merged.sorts.push(nnconfig.sort || {});
        merged.subtotals.push(nnconfig.subTotal || {});
        merged.functions.push({
            aggregateFuncName: nnconfig.aggregateFuncName,
            aggregateFunc: i === 0 ? nnconfig.aggregateFunc : (nnconfig.aggregateFunc ? nnconfig.aggregateFunc() : null),
            formatFunc: i === 0 ? nnconfig.formatFunc : (nnconfig.formatFunc ? nnconfig.formatFunc() : null)
        });
    }
    return merged;
}
function createfield(rootconfig, axetype, fieldconfig, defaultfieldconfig) {
    var axeconfig;
    var fieldAxeconfig;
    if (defaultfieldconfig) {
        switch (axetype) {
            case orb_axe_1.AxeType.ROWS:
                axeconfig = rootconfig.rowSettings;
                fieldAxeconfig = defaultfieldconfig.rowSettings;
                break;
            case orb_axe_1.AxeType.COLUMNS:
                axeconfig = rootconfig.columnSettings;
                fieldAxeconfig = defaultfieldconfig.columnSettings;
                break;
            case orb_axe_1.AxeType.DATA:
                axeconfig = rootconfig.dataSettings;
                fieldAxeconfig = defaultfieldconfig.dataSettings;
                break;
            default:
                axeconfig = null;
                fieldAxeconfig = null;
                break;
        }
    }
    else {
        axeconfig = null;
        fieldAxeconfig = null;
    }
    var merged = mergefieldconfigs(fieldconfig, fieldAxeconfig, axeconfig, defaultfieldconfig, rootconfig);
    return new Field({
        name: getpropertyvalue('name', merged.configs, ''),
        caption: getpropertyvalue('caption', merged.configs, ''),
        sort: {
            order: getpropertyvalue('order', merged.sorts, null),
            customfunc: getpropertyvalue('customfunc', merged.sorts, null)
        },
        subTotal: {
            visible: getpropertyvalue('visible', merged.subtotals, true),
            collapsible: getpropertyvalue('collapsible', merged.subtotals, true),
            collapsed: getpropertyvalue('collapsed', merged.subtotals, false) && getpropertyvalue('collapsible', merged.subtotals, true)
        },
        aggregateFuncName: getpropertyvalue('aggregateFuncName', merged.functions, 'sum'),
        aggregateFunc: getpropertyvalue('aggregateFunc', merged.functions, aggregation.sum),
        formatFunc: getpropertyvalue('formatFunc', merged.functions, null)
    }, false);
}
var GrandTotalConfig = (function () {
    function GrandTotalConfig(options) {
        options = options || {};
        this.rowsvisible = options.rowsvisible !== undefined ? options.rowsvisible : true;
        this.columnsvisible = options.columnsvisible !== undefined ? options.columnsvisible : true;
    }
    return GrandTotalConfig;
}());
var SubTotalConfig = (function () {
    function SubTotalConfig(options, setdefaults) {
        var defaults = {
            visible: setdefaults === true ? true : undefined,
            collapsible: setdefaults === true ? true : undefined,
            collapsed: setdefaults === true ? false : undefined
        };
        options = options || {};
        this.visible = options.visible !== undefined ? options.visible : defaults.visible;
        this.collapsible = options.collapsible !== undefined ? options.collapsible : defaults.collapsible;
        this.collapsed = options.collapsed !== undefined ? options.collapsed : defaults.collapsed;
    }
    return SubTotalConfig;
}());
function SortConfig(options) {
    options = options || {};
    this.order = options.order || (options.customfunc ? 'asc' : null);
    this.customfunc = options.customfunc;
}
function ChartConfig(options) {
    options = options || {};
    this.enabled = options.enabled || false;
    // type can be: 'LineChart', 'AreaChart', 'ColumnChart', 'BarChart', 'SteppedAreaChart'
    this.type = options.type || 'LineChart';
}
var Field = (function () {
    function Field(options, createSubOptions) {
        options = options || {};
        // field name
        this.name = options.name;
        // shared settings
        this.caption = options.caption || this.name;
        // rows & columns settings
        this.sort = new SortConfig(options.sort);
        this.subTotal = new SubTotalConfig(options.subTotal);
        this.aggregateFuncName = options.aggregateFuncName ||
            (options.aggregateFunc ?
                (utils.isString(options.aggregateFunc) ?
                    options.aggregateFunc :
                    'custom') :
                null);
        this.aggregateFunc(options.aggregateFunc);
        this.formatFunc(options.formatFunc || this.defaultFormatFunc);
        if (createSubOptions !== false) {
            (this.rowSettings = new Field(options.rowSettings, false)).name = this.name;
            (this.columnSettings = new Field(options.columnSettings, false)).name = this.name;
            (this.dataSettings = new Field(options.dataSettings, false)).name = this.name;
        }
    }
    Field.prototype.defaultFormatFunc = function (val) {
        return val != null ? val.toString() : '';
    };
    Field.prototype.aggregateFunc = function (func) {
        if (func) {
            this._aggregatefunc = aggregation.toAggregateFunc(func);
        }
        else {
            return this._aggregatefunc;
        }
    };
    ;
    Field.prototype.formatFunc = function (func) {
        if (func) {
            this._formatfunc = func;
        }
        else {
            return this._formatfunc;
        }
    };
    ;
    return Field;
}());
;
/**
 * Creates a new instance of pgrid config
 * @class
 * @memberOf orb
 * @param  {object} config - configuration object
 */
// module.config(config) {
var Config = (function () {
    function Config(config) {
        var _this = this;
        // datasource field names
        this.dataSourceFieldNames = [];
        // datasource field captions
        this.dataSourceFieldCaptions = [];
        this.config = config;
        this.dataSource = config.dataSource || [];
        this.canMoveFields = config.canMoveFields !== undefined ? !!config.canMoveFields : true;
        this.dataHeadersLocation = config.dataHeadersLocation === 'columns' ? 'columns' : 'rows';
        this.grandTotal = new GrandTotalConfig(config.grandTotal);
        this.subTotal = new SubTotalConfig(config.subTotal, true);
        this.width = config.width;
        this.height = config.height;
        this.toolbar = config.toolbar;
        this.theme = new orb_themes_1.ThemeManager();
        this.chartMode = new ChartConfig(config.chartMode);
        this.rowSettings = new Field(config.rowSettings, false);
        this.columnSettings = new Field(config.columnSettings, false);
        this.dataSettings = new Field(config.dataSettings, false);
        this.allFields = (config.fields || []).map(function (fieldconfig) {
            var f = new Field(fieldconfig);
            // map fields names to captions
            _this.dataSourceFieldNames.push(f.name);
            _this.dataSourceFieldCaptions.push(f.caption);
            return f;
        });
        this.rowFields = (config.rows || []).map(function (fieldconfig) {
            fieldconfig = this.ensureFieldConfig(fieldconfig);
            return createfield(this, orb_axe_1.AxeType.ROWS, fieldconfig, this.getfield(this.allFields, fieldconfig.name));
        });
        this.columnFields = (config.columns || []).map(function (fieldconfig) {
            fieldconfig = this.ensureFieldConfig(fieldconfig);
            return createfield(this, orb_axe_1.AxeType.COLUMNS, fieldconfig, this.getfield(this.allFields, fieldconfig.name));
        });
        this.dataFields = (config.data || []).map(function (fieldconfig) {
            fieldconfig = this.ensureFieldConfig(fieldconfig);
            return createfield(this, orb_axe_1.AxeType.DATA, fieldconfig, this.getfield(this.allFields, fieldconfig.name));
        });
        this.dataFieldsCount = this.dataFields ? (this.dataFields.length || 1) : 1;
        this.runtimeVisibility = {
            subtotals: {
                rows: this.rowSettings.subTotal.visible !== undefined ? this.rowSettings.subTotal.visible : true,
                columns: this.columnSettings.subTotal.visible !== undefined ? this.columnSettings.subTotal.visible : true
            }
        };
    }
    Config.prototype.captionToName = function (caption) {
        var fcaptionIndex = this.dataSourceFieldCaptions.indexOf(caption);
        return fcaptionIndex >= 0 ? this.dataSourceFieldNames[fcaptionIndex] : caption;
    };
    ;
    Config.prototype.nameToCaption = function (name) {
        var fnameIndex = this.dataSourceFieldNames.indexOf(name);
        return fnameIndex >= 0 ? this.dataSourceFieldCaptions[fnameIndex] : name;
    };
    ;
    Config.prototype.setTheme = function (newTheme) {
        return this.theme.current() !== this.theme.current(newTheme);
    };
    ;
    Config.prototype.ensureFieldConfig = function (obj) {
        if (typeof obj === 'string') {
            return {
                name: this.captionToName(obj)
            };
        }
        return obj;
    };
    Config.prototype.getfield = function (axefields, fieldname) {
        var fieldindex = this.getfieldindex(axefields, fieldname);
        if (fieldindex > -1) {
            return axefields[fieldindex];
        }
        return null;
    };
    Config.prototype.getfieldindex = function (axefields, fieldname) {
        for (var fi = 0; fi < axefields.length; fi++) {
            if (axefields[fi].name === fieldname) {
                return fi;
            }
        }
        return -1;
    };
    Config.prototype.getField = function (fieldname) {
        return this.getfield(this.allFields, fieldname);
    };
    ;
    Config.prototype.getRowField = function (fieldname) {
        return this.getfield(this.rowFields, fieldname);
    };
    ;
    Config.prototype.getColumnField = function (fieldname) {
        return this.getfield(this.columnFields, fieldname);
    };
    ;
    Config.prototype.getDataField = function (fieldname) {
        return this.getfield(this.dataFields, fieldname);
    };
    ;
    Config.prototype.availablefields = function () {
        var _this = this;
        return this.allFields.filter(function (field) {
            function notequalfield(otherfield) {
                return field.name !== otherfield.name;
            }
            ;
            return _this.dataFields.every(notequalfield) &&
                _this.rowFields.every(notequalfield) &&
                _this.columnFields.every(notequalfield);
        });
    };
    ;
    Config.prototype.getDataSourceFieldCaptions = function () {
        var row0;
        if (this.dataSource && (row0 = this.dataSource[0])) {
            var fieldNames = utils.ownProperties(row0);
            var headers = [];
            for (var i = 0; i < fieldNames.length; i++) {
                headers.push(this.nameToCaption(fieldNames[i]));
            }
            return headers;
        }
        return null;
    };
    ;
    Config.prototype.getPreFilters = function () {
        var prefilters = {};
        if (this.config.preFilters) {
            utils.forEach(utils.ownProperties(this.config.preFilters), function (filteredField) {
                var prefilterConfig = this.config.preFilters[filteredField];
                if (utils.isArray(prefilterConfig)) {
                    prefilters[this.captionToName(filteredField)] = new filtering.ExpressionFilter(null, null, prefilterConfig, false);
                }
                else {
                    var opname = utils.ownProperties(prefilterConfig)[0];
                    if (opname) {
                        prefilters[this.captionToName(filteredField)] = new filtering.ExpressionFilter(opname, prefilterConfig[opname]);
                    }
                }
            });
        }
        return prefilters;
    };
    ;
    Config.prototype.moveField = function (fieldname, oldaxetype, newaxetype, position) {
        var oldaxe, oldposition;
        var newaxe;
        var fieldConfig;
        var defaultFieldConfig = this.getfield(this.allFields, fieldname);
        if (defaultFieldConfig) {
            switch (oldaxetype) {
                case orb_axe_1.AxeType.ROWS:
                    oldaxe = this.rowFields;
                    break;
                case orb_axe_1.AxeType.COLUMNS:
                    oldaxe = this.columnFields;
                    break;
                case orb_axe_1.AxeType.DATA:
                    oldaxe = this.dataFields;
                    break;
                default:
                    break;
            }
            switch (newaxetype) {
                case orb_axe_1.AxeType.ROWS:
                    newaxe = this.rowFields;
                    fieldConfig = this.getRowField(fieldname);
                    break;
                case orb_axe_1.AxeType.COLUMNS:
                    newaxe = this.columnFields;
                    fieldConfig = this.getColumnField(fieldname);
                    break;
                case orb_axe_1.AxeType.DATA:
                    newaxe = this.dataFields;
                    fieldConfig = this.getDataField(fieldname);
                    break;
                default:
                    break;
            }
            if (oldaxe || newaxe) {
                var newAxeSubtotalsState = this.areSubtotalsVisible(newaxetype);
                if (oldaxe) {
                    oldposition = this.getfieldindex(oldaxe, fieldname);
                    if (oldaxetype === newaxetype) {
                        if (oldposition == oldaxe.length - 1 &&
                            position == null ||
                            oldposition === position - 1) {
                            return false;
                        }
                    }
                    oldaxe.splice(oldposition, 1);
                }
                var field = createfield(this, newaxetype, fieldConfig, defaultFieldConfig);
                if (!newAxeSubtotalsState && field.subTotal.visible !== false) {
                    field.subTotal.visible = null;
                }
                if (newaxe) {
                    if (position != null) {
                        newaxe.splice(position, 0, field);
                    }
                    else {
                        newaxe.push(field);
                    }
                }
                // update data fields count
                this.dataFieldsCount = this.dataFields ? (this.dataFields.length || 1) : 1;
                return true;
            }
        }
    };
    ;
    Config.prototype.toggleSubtotals = function (axetype) {
        var i;
        var axeFields;
        var newState = !this.areSubtotalsVisible(axetype);
        if (axetype === orb_axe_1.AxeType.ROWS) {
            this.runtimeVisibility.subtotals.rows = newState;
            axeFields = this.rowFields;
        }
        else if (axetype === orb_axe_1.AxeType.COLUMNS) {
            this.runtimeVisibility.subtotals.columns = newState;
            axeFields = this.columnFields;
        }
        else {
            return false;
        }
        newState = newState === false ? null : true;
        for (i = 0; i < axeFields.length; i++) {
            if (axeFields[i].subTotal.visible !== false) {
                axeFields[i].subTotal.visible = newState;
            }
        }
        return true;
    };
    ;
    Config.prototype.areSubtotalsVisible = function (axetype) {
        if (axetype === orb_axe_1.AxeType.ROWS) {
            return this.runtimeVisibility.subtotals.rows;
        }
        else if (axetype === orb_axe_1.AxeType.COLUMNS) {
            return this.runtimeVisibility.subtotals.columns;
        }
        else {
            return null;
        }
    };
    ;
    Config.prototype.toggleGrandtotal = function (axetype) {
        var newState = !this.isGrandtotalVisible(axetype);
        if (axetype === orb_axe_1.AxeType.ROWS) {
            this.grandTotal.rowsvisible = newState;
        }
        else if (axetype === orb_axe_1.AxeType.COLUMNS) {
            this.grandTotal.columnsvisible = newState;
        }
        else {
            return false;
        }
        return true;
    };
    ;
    Config.prototype.isGrandtotalVisible = function (axetype) {
        if (axetype === orb_axe_1.AxeType.ROWS) {
            return this.grandTotal.rowsvisible;
        }
        else if (axetype === orb_axe_1.AxeType.COLUMNS) {
            return this.grandTotal.columnsvisible;
        }
        else {
            return false;
        }
    };
    ;
    return Config;
}());
exports.Config = Config;
;
