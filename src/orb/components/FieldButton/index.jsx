import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import { DragSource } from 'react-dnd';
import { Overlay } from 'react-overlays';

import FilterPanel from '../FilterPanel';

const filterImage = 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAALCAYAAACprHcmAAAAMUlEQVQYlWP4//9/I7GYgSzFDHgAVsX/sQCsirFpQFaI1c0wDegKB0AxeihQFs7EYAAT8WYwzt7jxgAAAABJRU5ErkJggg==) no-repeat 0px 0px';

class FieldButton extends Component {
  constructor(props) {
    super(props);
    this.state = { filtering: false };

    this.addFilterPanel = this.addFilterPanel.bind(this);
    this.removeFilterPanel = this.removeFilterPanel.bind(this);
    this.onFilter = this.onFilter.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    this.DOMNode = findDOMNode(this.buttonRef);
  }

  onFilter(all, operator, term, staticValue, excludeStatic) {
    const { store, field, axetype } = this.props;
    store.applyFilter(field.name, axetype, all, operator, term, staticValue, excludeStatic);
    this.removeFilterPanel();
  }

  removeFilterPanel() {
    this.setState({ filtering: false });
  }

  addFilterPanel(e) {
    const { filtering } = this.state;
    if (!filtering) {
      this.setState({ filtering: true });
    }
    e.preventDefault();
  }

  handleClick() {
    const { store, axetype, field } = this.props;
    store.sort(axetype, field.name);
  }

  render() {
    const { field, store, axetype, connectDragSource, isDragging } = this.props;
    const { filtering } = this.state;
    const styles = {
      div: {
        width: isDragging ? 0 : '',
        backgroundColor: '#5bc0de',
        borderRadius: 4,
        cursor: 'default',
        opacity: isDragging ? 0 : 1,
        padding: '0.2em',
        marginTop: '0.2em',
        marginBottom: '0.2em',
        display: 'flex',
        justifyContent: 'space-between',
        border: 'none',
        outline: 'none',
      },
      filterButton: {
        background: filterImage,
        border: 'none',
        outline: 'none',
        width: 11,
        height: 11,
        marginLeft: '0.5em',
      },
    };
    return connectDragSource(
      <div>
        <div style={styles.div} onClick={this.handleClick}>
          <div>
            {field.caption}
          </div>
          <button
            ref={(input) => { this.buttonRef = input; }}
            onClick={this.addFilterPanel}
            style={styles.filterButton}
          />
          {/* </div> */}
        </div>
        <Overlay
          container={this.DOMNode}
          placement="bottom"
          show={filtering}
          target={this.DOMNode}
          rootClose
          onHide={this.removeFilterPanel}
        >
          <FilterPanel
            field={field}
            axetype={axetype}
            store={store}
            onFilter={this.onFilter}
            onCancel={() => this.removeFilterPanel()}
          />
        </Overlay>
      </div>);
  }
}

const fieldSource = {
  beginDrag(props) {
    return {
      id: props.field.name,
      axetype: props.axetype,
    };
  },
};

function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
  };
}

export default DragSource('button', fieldSource, collect)(FieldButton);
