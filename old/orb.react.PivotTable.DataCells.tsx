import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import {AxeType} from '../orb.axe';
import {DataCell, DataHeader} from '../orb.ui.header';
import {debounce} from '../orb.utils';

import {Grid, AutoSizer} from 'react-virtualized';
import {PivotDataCell} from './orb.react.PivotCells';

import {PGridWidgetStore} from '../orb.ui.pgridwidgetstore';

export interface DataCellsProps{
  pgridwidgetstore: PGridWidgetStore,
  onScroll: any,
  scrollLeft: number,
  scrollTop: number
}

export default class DataCellsComponent extends React.Component<DataCellsProps,{}>{

  private _grid;
  constructor(){
    super();
    this.renderDataCell = this.renderDataCell.bind(this);
  }

  render(){
    console.log('render dataCells');
    const pgridwidgetstore = this.props.pgridwidgetstore;
    const config = pgridwidgetstore.pgrid.config;
    const columnCount = pgridwidgetstore.columns.leafsHeaders.length;

    const cellHeight = this.props.pgridwidgetstore.layout.cell.height;
    const cellWidth = this.props.pgridwidgetstore.layout.cell.width;
    if (this._grid) this._grid.forceUpdate();

    return(
        <AutoSizer>
          {({height, width}) => (
            <Grid
              ref={ref => this._grid = ref}
              onScroll={this.props.onScroll}
              scrollLeft={this.props.scrollLeft}
              scrollTop={this.props.scrollTop}
              width={width}
              height={height}
              columnWidth={cellWidth}
              rowHeight={cellHeight}
              columnCount={columnCount}
              rowCount={pgridwidgetstore.rows.headers.length}
              cellRenderer={this.renderDataCell}
              overscanRowCount={0}
              overscanColumnCount={0}
            />
          )}
        </AutoSizer>
    )
  }

  renderMockDataCell({columnIndex, rowIndex}){
    return `C: ${columnIndex} R: ${rowIndex}`;
  }

  renderDataCell({columnIndex, rowIndex, isScrolling}):string|JSX.Element{
    if (isScrolling){
      return '';
    }
    else {
    const rowHeaderRow = this.props.pgridwidgetstore.rows.headers[rowIndex];
    const rowHeader = rowHeaderRow[rowHeaderRow.length - 1];
    const columnHeader = this.props.pgridwidgetstore.columns.leafsHeaders[columnIndex];
    const cell = new DataCell(this.props.pgridwidgetstore.pgrid,() => (rowHeader as DataHeader).visible() && columnHeader.visible(), rowHeader, columnHeader);
    cell.value = this.props.pgridwidgetstore.pgrid.getData(
      (cell as DataCell).datafield ? (cell as DataCell).datafield.name : null,
      (cell as DataCell).rowDimension,
      (cell as DataCell).columnDimension);
    return <PivotDataCell
            key={columnIndex}
            cell={cell}
            pgridwidgetstore={this.props.pgridwidgetstore}
            />
    }
  }
};