import { connect } from 'react-redux';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import PivotGrid from '../components/Grid/Grid';
import {
  getLayout,
  getCellSizes,
  getRowAxis,
  getColumnUiAxis,
  getRowUiAxis,
  getColumnAxis,
  getActivatedDatafields
} from '../selectors';
import { updateCellSize, setConfigProperty, setCellSize } from '../actions';
import { AxisType } from '../Axis';

const mapStateToProps = state => ({
  width: state.config.width,
  zoom: state.config.zoom,
  layout: getLayout(state),
  defaultCellSizes: getCellSizes(state),
  sizes: state.sizes,
  columnHeaders: getColumnUiAxis(state).headers,
  rowHeaders: getRowUiAxis(state).headers,
  rowFields: getRowAxis(state).fields,
  columnFields: getColumnAxis(state).fields,
  dataFieldsCount: getActivatedDatafields(state).length
});

const mapDispatchToProps = dispatch => ({
  updateCellSize: (
    { handle, offset, initialOffset, sizes, defaultCellSizes, zoom }
  ) => {
    if (
      handle.leafSubheaders &&
      handle.leafSubheaders.length &&
      ((handle.axis === AxisType.COLUMNS && handle.position === 'right') ||
        (handle.axis === AxisType.ROWS && handle.position === 'bottom'))
    ) {
      const fractionalOffset = {
        x: (offset.x - initialOffset.x) / handle.leafSubheaders.length,
        y: (offset.y - initialOffset.y) / handle.leafSubheaders.length
      };
      handle.leafSubheaders.forEach(subheader => {
        dispatch(
          updateCellSize({
            handle: { ...handle, leafSubheaders: [], id: subheader.key },
            offset: fractionalOffset,
            initialOffset: { x: 0, y: 0 },
            defaultCellSizes,
            sizes,
            zoom
          })
        );
      });
    } else {
      dispatch(
        updateCellSize({
          handle,
          offset,
          initialOffset,
          sizes,
          defaultCellSizes,
          zoom
        })
      );
    }
  },
  setCellSize: ({ cell, size, direction, zoom }) => {
    dispatch(setCellSize({ cell, size, direction, zoom }));
  },
  setSizes: ({ height, width }) => {
    if (height) dispatch(setConfigProperty({ height, width }, 'height'));
    if (width) dispatch(setConfigProperty({ height, width }, 'width'));
  }
});

const mergeProps = (
  {
    width,
    layout,
    headerSizes,
    sizes,
    defaultCellSizes,
    columnHeaders,
    rowHeaders,
    rowFields,
    columnFields,
    dataFieldsCount,
    zoom
  },
  { setCellSize, updateCellSize, setSizes },
  ownProps
) => ({
  defaultCellSizes,
  rowFields,
  columnFields,
  columnHeaders,
  rowHeaders,
  width,
  layout,
  dataFieldsCount,
  setCellSize: ({ cell, size, direction }) =>
    setCellSize({ cell, size, direction, zoom }),
  updateCellSize: ({ handle, offset, initialOffset }) =>
    updateCellSize({
      handle,
      offset,
      initialOffset,
      sizes,
      defaultCellSizes,
      zoom
    }),
  setSizes,
  ...ownProps
});

export const PivotGridWithoutDndContext = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps,
  { withRef: true }
)(PivotGrid);

export default DragDropContext(HTML5Backend)(PivotGridWithoutDndContext);
