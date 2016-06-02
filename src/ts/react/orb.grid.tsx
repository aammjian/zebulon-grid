import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Grid, AutoSizer} from 'react-virtualized';

import CellSizeAndPositionManager from './utils/CellSizeAndPositionManager';

import{Header, DataCell, DataHeader} from '../orb.ui.header';
import {PivotHeaderCell, PivotDataCell} from './orb.react.PivotCells';

export class OrbGrid extends React.Component<any,{}>{

  private _grid;
  private _width;
  private _height;
  private _cellHeight;
  private _cellWidth;
  private _rowVerticalCount;
  private _rowHorizontalCount;
  private _columnVerticalCount;
  private _columnHorizontalCount;
  private _rowHeadersWidth;
  private _columnHeadersHeight;

  private _columnHeaders;
  private _rowHeaders;

  constructor(props){
    super(props);
    this.initLayoutInfos(props);

    this.cellRangeRenderer = this.cellRangeRenderer.bind(this);
    this.dataCellRenderer = this.dataCellRenderer.bind(this);
    this.rowHeaderRenderer = this.rowHeaderRenderer.bind(this);
    this.columnHeaderRenderer = this.columnHeaderRenderer.bind(this);
  }

  componentWillUpdate(nextProps, nextState){
    this.initLayoutInfos(nextProps);
  }

  initLayoutInfos(props){
    const {pgridwidgetstore} = props;

    this._width = pgridwidgetstore.pgrid.config.width;
    this._height = pgridwidgetstore.pgrid.config.height;

    this._cellHeight = pgridwidgetstore.layout.cell.height;
    this._cellWidth = pgridwidgetstore.layout.cell.width;

    this._rowVerticalCount = pgridwidgetstore.layout.rowHeaders.height;
    this._rowHorizontalCount = pgridwidgetstore.layout.rowHeaders.width;
    this._columnVerticalCount = pgridwidgetstore.layout.columnHeaders.height;
    this._columnHorizontalCount = pgridwidgetstore.layout.columnHeaders.width;
  }

  render(){
    // if (this._grid) {this._grid.forceUpdate()};
    this._rowHeadersWidth = this._rowHorizontalCount*this._cellWidth;
    this._columnHeadersHeight = this._columnVerticalCount*this._cellHeight;

    this._columnHeaders = this.props.pgridwidgetstore.columns.headers;
    this._rowHeaders = this.props.pgridwidgetstore.rows.headers;

    return (
          <Grid
            ref={ref => this._grid = ref}
            width={this._width}
            height={this._height}
            columnWidth={this._cellWidth}
            rowHeight={this._cellHeight}
            columnCount={this._columnHorizontalCount+this._rowHorizontalCount}
            rowCount={this._columnVerticalCount+this._rowVerticalCount}
            cellRangeRenderer={this.cellRangeRenderer}
            overscanRowCount={2}
            overscanColumnCount={2}
          />
    )
  }


  cellRangeRenderer ({
      cellCache,
      cellRenderer,
      columnSizeAndPositionManager,
      columnStartIndex,
      columnStopIndex,
      isScrolling,
      rowSizeAndPositionManager,
      rowStartIndex,
      rowStopIndex,
      scrollLeft,
      scrollTop
    }) {
    const renderedCells = [];


    // Top-left corner piece
    renderedCells.push(
      <div
        key='fixed-fixed'
        className={'Grid__cell'}
        style={{
          position: 'fixed',
          left: scrollLeft,
          top: scrollTop,
          width: this._rowHeadersWidth,
          height: this._columnHeadersHeight,
          zIndex: 1
        }}
      >
        &nbsp;
      </div>
    )


    // Render fixed header row
    for (let columnIndex = columnStartIndex; columnIndex <= columnStopIndex; columnIndex++) {
      for (let columnHeaderIndex = 0; columnHeaderIndex < this._columnHeaders[columnIndex].length; columnHeaderIndex++){
        let renderedCell = this.columnHeaderRenderer({
          rowIndex: columnIndex,
          columnIndex: columnHeaderIndex
        });
        let columnHeader = this._columnHeaders[columnIndex][columnHeaderIndex];
        renderedCells.push(
          <div
            key={`fixedrow-${columnHeaderIndex}-${columnIndex}`}
            className={'Grid__cell'}
            style={{
              position: 'fixed',
              left:columnIndex*this._cellWidth+this._rowHeadersWidth,
              top:(this._columnVerticalCount - this._columnHeaders[columnIndex].length + columnHeaderIndex)*this._cellHeight + scrollTop,
              height:this._cellHeight*columnHeader.vspan(),
              width:this._cellWidth*columnHeader.hspan()
            }}
          >
          {renderedCell}
          </div>
          )
        }
      }


    // Render fixed left column
    for (let rowIndex = rowStartIndex; rowIndex <= rowStopIndex; rowIndex++) {
      for (let rowHeaderIndex = 0; rowHeaderIndex < this._rowHeaders[rowIndex].length; rowHeaderIndex++){
        let renderedCell = this.rowHeaderRenderer({
            columnIndex: rowHeaderIndex,
            rowIndex
          });
        renderedCells.push(
          <div
            key={`fixedcol-${rowHeaderIndex}-${rowIndex}`}
            className={'Grid__cell'}
            style={{
              position: 'fixed',
              left:(this._rowHorizontalCount - this._rowHeaders[rowIndex].length+rowHeaderIndex)*this._cellWidth + scrollLeft,
              top:rowIndex*this._cellHeight + this._columnHeadersHeight+scrollTop,
              height:this._cellHeight*this._rowHeaders[rowIndex][rowHeaderIndex].vspan(),
              width:this._cellWidth*this._rowHeaders[rowIndex][rowHeaderIndex].hspan()
            }}
          >
            {renderedCell}
          </div>
        )
      }
    }

    for (let rowIndex = rowStartIndex; rowIndex <= rowStopIndex; rowIndex++) {
      let rowDatum = rowSizeAndPositionManager.getSizeAndPositionOfCell(rowIndex)

      for (let columnIndex = columnStartIndex; columnIndex <= columnStopIndex; columnIndex++) {
        let columnDatum = columnSizeAndPositionManager.getSizeAndPositionOfCell(columnIndex)
        let key = `${rowIndex}-${columnIndex}`
        let renderedCell

        // Avoid re-creating cells while scrolling.
        // This can lead to the same cell being created many times and can cause performance issues for "heavy" cells.
        // If a scroll is in progress- cache and reuse cells.
        // This cache will be thrown away once scrolling complets.
        if (isScrolling) {
          if (!cellCache[key]) {
            cellCache[key] = this.dataCellRenderer({
              columnIndex,
              isScrolling,
              rowIndex
            })
          }
          renderedCell = cellCache[key]
        // If the user is no longer scrolling, don't cache cells.
        // This makes dynamic cell content difficult for users and would also lead to a heavier memory footprint.
        } else {
          renderedCell = this.dataCellRenderer({
            columnIndex,
            isScrolling,
            rowIndex
          })
        }

        if (renderedCell == null || renderedCell === false) {
       continue
     }

     let child = (
       <div
         key={key}
         className='Grid__cell'
         style={{
           height: this._cellHeight,
           width: this._cellWidth,
           left: columnDatum.offset+this._rowHeadersWidth,
           top: rowDatum.offset+this._columnHeadersHeight
         }}
       >
         {renderedCell}
       </div>
     )
        renderedCells.push(child)
      }
    }

    return renderedCells
  }

  dataCellRenderer({columnIndex, rowIndex, isScrolling}):string|JSX.Element {
    if (isScrolling){
      return '';
    }
    else {
    const rowHeaderRow = this.props.pgridwidgetstore.rows.headers[rowIndex];
    const rowHeader = rowHeaderRow[rowHeaderRow.length - 1];
    const columnHeaderColumn = this.props.pgridwidgetstore.columns.headers[columnIndex];
    const columnHeader = columnHeaderColumn[columnHeaderColumn.length - 1];
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

  columnHeaderRenderer ({columnIndex, rowIndex}){
    const cell = this.props.pgridwidgetstore.columns.headers[rowIndex][columnIndex];
    if (!cell){
      return null;
    }
    else {
      return <PivotHeaderCell
                  cell={cell}
                  pgridwidgetstore={this.props.pgridwidgetstore} />
    }
  }

  rowHeaderRenderer({columnIndex, rowIndex}){
    const cell = this.props.pgridwidgetstore.rows.headers[rowIndex][columnIndex];
    if (!cell){
      return null;
    }
    else {
      return <PivotHeaderCell
                cell={cell}
                pgridwidgetstore={this.props.pgridwidgetstore} />
    }
  }
}
