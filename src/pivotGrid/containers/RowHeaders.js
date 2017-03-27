import { connect } from 'react-redux';

import { AxisType } from '../Axis';
import {
  getDimensionPositions,
  getDimensionSize,
  getHeaderSizes,
  getLastChildSize,
  getLayout,
  getPreviewSizes,
  getRowHeadersVisibleHeight,
  getRowHeight,
  getRowUiAxis
} from '../selectors';
import RowHeaders from '../components/RowHeaders';

const mapStateToProps = (state, ownProps) => ({
  columnCount: getLayout(state).rowHorizontalCount,
  dimensionPositions: getDimensionPositions(state),
  getColumnWidth: ({ index }) =>
    getDimensionSize(state)(AxisType.ROWS, state.axis.rows[index]),
  getDimensionSize: getDimensionSize(state),
  getLastChildSize: getLastChildSize(state),
  getRowHeight: getRowHeight(state),
  height: getRowHeadersVisibleHeight(state),
  previewSizes: getPreviewSizes(state),
  rowCount: getLayout(state).rowVerticalCount,
  rowHeaders: getRowUiAxis(state).headers,
  width: getHeaderSizes(state).rowHeadersWidth,
  sizesRowsLeafs: state.sizes.rows.leafs,
  zoom: state.config.zoom,
  gridId: ownProps.gridId
});

export default connect(mapStateToProps)(RowHeaders);
