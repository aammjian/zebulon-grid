import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import { GridConfiguration, Grid, Store } from './orb';
import { AxisType } from './orb/Axis';

function getMockDataSource(dataRepetition, nToto) {
  const nTiti = 10;
  const nTutu = 2;
  let obj = [];
  const res = [];
  for (let k = 0; k < dataRepetition; k += 1) {
    for (let o = 0; o < nToto; o += 1) {
      for (let i = 0; i < nTiti; i += 1) {
        for (let u = 0; u < nTutu; u += 1) {
          obj = [];
          obj.toto = String(o);
          obj.toto_lb = `toto ${String(o)}`;
          obj.titi = `titi ${String(i)}`;
          obj.tutu = String(u);
          obj.qty = u + (10 * i) + (100 * o); // +9999999999.1234567890123456
          obj.amt = u + (10 * i) + (100 * o); // +9999999999.1234567890123456
          res.push(obj);
        }
      }
    }
  }
  return res;
}

const datasource = getMockDataSource(1, 10);
const baseConfig = {
  canMoveFields: true,
  dataHeadersLocation: 'columns',
  width: 1099,
  height: 601,
  cellHeight: 30,
  cellWidth: 100,
  theme: 'green',
  toolbar: {
    visible: true,
  },
  grandTotal: {
    rowsvisible: false,
    columnsvisible: false,
  },
  subTotal: {
    visible: false,
    collapsed: false,
    collapsible: false,
  },
  rowSettings: {
    subTotal: {
      visible: false,
      collapsed: false,
      collapsible: false,
    },
  },
  columnSettings: {
    subTotal: {
      visible: false,
      collapsed: false,
      collapsible: false,
    },
  },
  fields: [
    {
      name: 'toto_lb',
      code: 'toto',
      caption: 'Toto',
      sort: {
        order: 'asc',
      },
    },
    {
      name: 'titi',
      caption: 'Titi',
    },
    {
      name: 'tutu',
      caption: 'Tutu',
    },
  ],
  dataFields: [
    {
      name: 'qty',
      caption: 'Quantity',
      aggregateFunc: 'sum',
    },
    {
      name: 'amt',
      caption: 'Amount',
      aggregateFunc: 'sum',
      aggregateFuncName: 'whatever',
      formatFunc: (value) => {
        if (value || value === 0) {
          return `${Number(value).toFixed(0)} $`;
        }
        return '';
      },
    },
  ],
  columns: ['Titi'],
  rows: ['Toto', 'Tutu'],
  data: ['Quantity'],
};


class RawApp extends React.Component {
  componentDidMount() {
    this.props.store.forceUpdateCallback = this.forceUpdate.bind(this);
  }
  render() {
    return (
      <div>
        <GridConfiguration store={this.props.store} />
        <Grid store={this.props.store} height={600} width={800} />
      </div>
    );
  }
}

const App = DragDropContext(HTML5Backend)(RawApp);

it('renders without crashing', () => {
  const store = new Store(baseConfig, null, datasource);
  const div = document.createElement('div');
  ReactDOM.render(<App store={store} />, div);
});

describe('works when config', () => {
  it('is empty', () => {
    const store = new Store({}, null, datasource);
    const tree = renderer.create(<App store={store} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
  it('has no columns', () => {
    const config = { ...baseConfig, columns: [] };
    const store = new Store(config, null, datasource);
    const tree = renderer.create(<App store={store} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
  it('has no rows', () => {
    const config = { ...baseConfig, rows: [] };
    const store = new Store(config, null, datasource);
    const tree = renderer.create(<App store={store} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('has no data field', () => {
    const store = new Store({ ...baseConfig, data: [] }, null, datasource);
    const tree = renderer.create(<App store={store} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
  it('has one data field', () => {
    const store = new Store({ ...baseConfig, data: ['Quantity'] }, null, datasource);
    const tree = renderer.create(<App store={store} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
  it('has two data fields', () => {
    const store = new Store({ ...baseConfig, data: ['Quantity', 'Amount'] }, null, datasource);
    const tree = renderer.create(<App store={store} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
  it('has data fields on row axis', () => {
    const store = new Store({ ...baseConfig, dataHeadersLocation: 'rows' }, null, datasource);
    const tree = renderer.create(<App store={store} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});

describe('actions', () => {
  it('push a record', () => {
    const store = new Store(baseConfig, null, datasource);
    store.push({ toto: '0', toto_lb: 'toto 0', qty: 100, amt: 100, titi: 'titi 0', tutu: '1' });
    const tree = renderer.create(<App store={store} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('push an array of records', () => {
    const store = new Store(baseConfig, null, datasource);
    store.push([
      { toto: '0', toto_lb: 'toto 0', qty: 100, amt: 100, titi: 'titi 0', tutu: '1' },
      { toto: '0', toto_lb: 'toto 0', qty: 100, amt: 100, titi: 'titi 0', tutu: '0' },
    ]);
    const tree = renderer.create(<App store={store} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('zoom in', () => {
    const store = new Store(baseConfig, null, datasource);
    store.handleZoom(true);
    const tree = renderer.create(<App store={store} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('zoom out', () => {
    const store = new Store(baseConfig, null, datasource);
    store.handleZoom(false);
    const tree = renderer.create(<App store={store} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('sort', () => {
    const store = new Store(baseConfig, null, datasource);
    store.sort(AxisType.COLUMNS, 'titi');
    const tree = renderer.create(<App store={store} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('sort nested field', () => {
    const store = new Store(baseConfig, null, datasource);
    store.sort(AxisType.ROWS, 'tutu');
    const tree = renderer.create(<App store={store} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('move field from row to column', () => {
    const store = new Store(baseConfig, null, datasource);
    store.moveField('tutu', AxisType.ROWS, AxisType.COLUMNS, 1);
    const tree = renderer.create(<App store={store} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('move field from row to reserve', () => {
    const store = new Store(baseConfig, null, datasource);
    store.moveField('toto_lb', AxisType.ROWS, AxisType.FIELDS, 0);
    const tree = renderer.create(<App store={store} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('toggle datafield', () => {
    const store = new Store(baseConfig, null, datasource);
    store.toggleDataField('amt');
    const tree = renderer.create(<App store={store} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('resize header', () => {
    const store = new Store(baseConfig, null, datasource);
    store.updateCellSizes(
      { id: 'titi 1-/-qty', axis: AxisType.COLUMNS, leafSubheaders: [], position: 'right' },
      { x: 200 },
      { x: 0 },
    );
    const tree = renderer.create(<App store={store} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('resize header in cross direction', () => {
    const store = new Store(baseConfig, null, datasource);
    store.updateCellSizes(
      { id: 'titi', axis: AxisType.COLUMNS, position: 'bottom' },
      { y: 200 },
      { y: 0 },
    );
    const tree = renderer.create(<App store={store} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
