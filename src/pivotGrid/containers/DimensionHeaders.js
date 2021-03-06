import { connect } from "react-redux";
import {
  columnVisibleDimensionsSelector,
  rowVisibleDimensionsSelector,
  columnHeadersHeightSelector,
  rowHeadersWidthSelector,
  crossPositionsSelector,
  previewSizesSelector,
  availableDimensionsSelector,
  getExpandCollapseKeysSelector,
  toggleSortOrderSelector,
  getAxisTreesSelector
} from "../selectors";
import DimensionHeaders from "../components/DimensionHeaders/DimensionHeaders";
import {
  toggleCollapseDimension,
  toggleSortOrder,
  moveDimension,
  expandCollapseAll,
  toggleSubTotal
} from "../actions";
import { resetLeaves } from "../utils/headers";
const mapStateToProps = () => (state, ownProps) => {
  const columnDimensions = columnVisibleDimensionsSelector(state);
  const rowDimensions = rowVisibleDimensionsSelector(state);
  return {
    columnDimensions,
    rowDimensions,
    getExpandCollapseKeys: getExpandCollapseKeysSelector(state),
    filters: state.filters,
    availableDimensions: availableDimensionsSelector(state),
    crossPositions: crossPositionsSelector(state),
    height: columnHeadersHeightSelector(state),
    previewSizes: previewSizesSelector(state),
    width: rowHeadersWidthSelector(state),
    gridId: ownProps.gridId,
    sizes: state.sizes,
    features: state.configuration.features,
    toggleSort: toggleSortOrderSelector(state),
    getAxisTrees: getAxisTreesSelector(state),
    status: state.status
  };
};
const mapDispatchToProps = dispatch => ({
  toggleCollapseDimension: key => dispatch(toggleCollapseDimension({ key })),
  toggleSortOrder: (axisType, depth) =>
    dispatch(toggleSortOrder(axisType, depth)),
  expandCollapseAll: (axisType, keys, n, measuresCount) =>
    dispatch(expandCollapseAll({ axisType, keys, n, measuresCount })),
  moveDimension: (dimensionId, oldAxis, newAxis, position) => {
    dispatch(moveDimension(dimensionId, oldAxis, newAxis, position));
  },
  toggleSubTotal: dimensionId => dispatch(toggleSubTotal(dimensionId))
});
const mergeProps = (
  { toggleSort, measures, getAxisTrees, ...restStateProps },
  { toggleSortOrder, moveDimension, ...restDispatchProps },
  ownProps
) => ({
  toggleSortOrder: (axisType, depth) => {
    toggleSort(axisType, depth);
    toggleSortOrder(axisType, depth);
  },
  moveDimension: (dimensionId, oldAxis, newAxis, position) => {
    const { rows, columns } = getAxisTrees;
    resetLeaves(rows);
    resetLeaves(columns);
    return moveDimension(dimensionId, oldAxis, newAxis, position);
  },
  ...restStateProps,
  ...restDispatchProps,
  ...ownProps
});
export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(
  DimensionHeaders
);
