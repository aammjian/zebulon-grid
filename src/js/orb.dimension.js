/**
 * @fileOverview Pivot Grid dimension viewmodel
 * @author Najmeddine Nouri <najmno@gmail.com>
 */
'use strict';
/* global module */
/*jshint eqnull: true*/
/**
 * Creates a new container for a row/column dimension values.<br/>
 * This object will have all informations related to a dimension: its values, depth, width and subdimensions.
 * @class
 * @memberOf orb
 * @param  {orb.dimension} parent - parent dimension
 * @param  {array} fields - array describing the fields used for an axe dimenisons
 * @param  {int} fieldindex - index of this dimension field in fields array
 * @param  {Boolean} isRoot - whether or not this is the root dimension for a given axe (row/column)
 */
var Dimension = (function () {
    function Dimension(id, parent, value, field, depth, isRoot, isLeaf) {
        /**
         * Dimension's set of all values
         * @type {Array}
         */
        this.values = [];
        /**
         * Direct descendant subdimensions dictionary
         * @type {Object}
         */
        this.subdimvals = {};
        this.rowIndexes = null;
        this.id = id;
        this.parent = parent;
        this.value = value;
        this.isRoot = isRoot;
        this.isLeaf = isLeaf;
        this.field = field;
        this.depth = depth;
    }
    ;
    Dimension.prototype.getRowIndexes = function (result) {
        if (this.rowIndexes == null) {
            this.rowIndexes = [];
            for (var i = 0; i < this.values.length; i++) {
                this.subdimvals[this.values[i]].getRowIndexes(this.rowIndexes);
            }
        }
        if (result != null) {
            for (var j = 0; j < this.rowIndexes.length; j++) {
                result.push(this.rowIndexes[j]);
            }
            return result;
        }
        else {
            return this.rowIndexes;
        }
    };
    return Dimension;
}());
exports.Dimension = Dimension;
;
