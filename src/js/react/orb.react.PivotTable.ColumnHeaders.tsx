import * as React from 'react';
import axe from '../orb.axe';
import PivotRow from './orb.react.PivotRow';

export default React.createClass({
  render() {
    const self = this;
    const pgridwidget = this.props.pivotTableComp.pgridwidget;
    const cntrClass = pgridwidget.columns.headers.length === 0 ? '' : ' columns-cntr';

    const layoutInfos = {
      lastLeftMostCellVSpan: 0,
      topMostCells: {}
    };

    const columnHeaders = pgridwidget.columns.headers.map((headerRow, index) => {
      return <PivotRow key={index}
                       row={headerRow}
                       axetype={axe.Type.COLUMNS}
                       pivotTableComp={self.props.pivotTableComp}
                       layoutInfos={layoutInfos}>
      </PivotRow>;
    });

    return  <div className={'inner-table-container' + cntrClass} onWheel={this.props.pivotTableComp.onWheel}>
      <table className="inner-table">
        <colgroup>
        </colgroup>
        <tbody>
          {columnHeaders}
        </tbody>
      </table>
    </div>;
  }
});