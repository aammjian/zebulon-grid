import React from "react";
import {
  ContextMenu as ReactContextMenu,
  MenuItem,
  SubMenu
} from "react-contextmenu";
import classnames from "classnames";

import { isNullOrUndefined } from "../../utils/generic";
import { MEASURE_ID, TOTAL_ID } from "../../constants";
import Filter from "../../containers/Filter";

const DimensionMenu = (id, trigger) => {
  const { isNotCollapsible, hasSubTotal, hasGrandTotal, features } = trigger;
  const availableDimensions = trigger.availableDimensions.filter(
    dimension => dimension.id !== MEASURE_ID
  );
  const addDimensionSubMenu = (
    <SubMenu
      title="Add dimension"
      disabled={availableDimensions.length === 0}
      key={-1}
    >
      {availableDimensions.map(dimension => (
        <MenuItem
          key={dimension.id}
          onClick={trigger.onItemClick}
          data={{ action: "add", newDimensionId: dimension.id }}
        >
          {dimension.caption}
        </MenuItem>
      ))}
    </SubMenu>
  );
  if (trigger.dimensionId === MEASURE_ID) {
    return <ReactContextMenu id={id}>{addDimensionSubMenu}</ReactContextMenu>;
  }
  const menus = [];
  if (features.sorting === "enabled") {
    menus.push(
      <MenuItem
        onClick={trigger.onItemClick}
        disabled={trigger.dimensionId === TOTAL_ID}
        data={{ action: "sort" }}
        key={menus.length}
      >
        {`Sort  ${trigger.direction} `}
      </MenuItem>
    );
  }
  if (!isNotCollapsible && features.expandCollapse === "enabled") {
    menus.push(
      <MenuItem
        onClick={trigger.onItemClick}
        data={{ action: "expand all" }}
        disabled={isNotCollapsible}
        key={menus.length}
      >
        Expand all
      </MenuItem>,
      <MenuItem
        onClick={trigger.onItemClick}
        data={{ action: "collapse all" }}
        disabled={isNotCollapsible}
        key={menus.length}
      >
        Collapse all
      </MenuItem>
    );
  }
  if (features.totals === "enabled") {
    if (hasSubTotal !== null) {
      menus.push(
        <MenuItem
          onClick={trigger.onItemClick}
          data={{ action: "toggle subtotal" }}
          key={menus.length}
        >
          {(hasSubTotal ? "Remove" : "Add") + " subtotal"}
        </MenuItem>
      );
    }
    if (hasGrandTotal !== null) {
      menus.push(
        <MenuItem
          onClick={trigger.onItemClick}
          data={{ action: "toggle grandtotal" }}
          key={menus.length}
        >
          {(hasGrandTotal ? "Remove" : "Add") + " grand total"}
        </MenuItem>
      );
    }
  }
  if (features.filters === "enabled") {
    menus.push(
      <SubMenu
        title="Filter"
        disabled={trigger.dimensionId === TOTAL_ID}
        key={menus.length}
        style={
          !isNullOrUndefined(trigger.dimensionFilter) ? (
            { fontWeight: "bold" }
          ) : null
        }
      >
        <div style={{ maxHeight: 600 }}>
          <Filter dimensionId={trigger.dimensionId} />
        </div>
      </SubMenu>
    );
  }
  if (features.dimensions === "enabled") {
    menus.push(
      <MenuItem
        onClick={trigger.onItemClick}
        disabled={trigger.dimensionId === TOTAL_ID}
        data={{ action: "remove" }}
        key={menus.length}
      >
        Remove
      </MenuItem>,
      addDimensionSubMenu
    );
  }
  if (menus.length) {
    return <ReactContextMenu id={id}>{menus}</ReactContextMenu>;
  } else {
    return null;
  }
};

const MeasureMenu = (id, trigger) => {
  const isDisabled = trigger.availableMeasures.length === 0;
  if (trigger.features.measures === "enabled") {
    return (
      <ReactContextMenu id={id}>
        <MenuItem onClick={trigger.onItemClick} data={{ action: "move" }}>
          Move measures
        </MenuItem>
        <MenuItem
          onClick={trigger.onItemClick}
          data={{ action: "remove" }}
          disabled={Object.keys(trigger.measures || {}).length < 2}
        >
          Remove
        </MenuItem>
        <SubMenu title="Add" disabled={isDisabled}>
          {trigger.availableMeasures.map(measure => (
            <MenuItem
              key={measure.id}
              onClick={trigger.onItemClick}
              data={{ action: "add", newMeasureId: measure.id }}
            >
              {measure.caption}
            </MenuItem>
          ))}
        </SubMenu>
      </ReactContextMenu>
    );
  } else {
    return null;
  }
};
const externalMenu = (functionType, externalFunction, onClick) => {
  if (externalFunction.type === "SubMenu") {
    return (
      <SubMenu
        key={externalFunction.code}
        title={externalFunction.caption}
        // onClick={e => console.log("SubMenu", e)}
      >
        {externalFunction.function()}
      </SubMenu>
    );
  } else if (externalFunction.type === "MenuItem") {
    return (
      <MenuItem
        key={externalFunction.code}
        onClick={onClick}
        data={{ action: externalFunction.code, functionType }}
      >
        {externalFunction.caption}
      </MenuItem>
    );
  }
};

// {externalFunction.function()}
const DataCellMenu = (id, trigger) => {
  let fct = trigger.menuFunctions.dataCellFunctions || {},
    keys,
    cellFunctions,
    rangeFunctions,
    gridFunctions;
  const menus = [];
  const features = trigger.configuration.features;
  keys = Object.keys(fct);
  if (keys.length) {
    menus.push(
      <SubMenu title="Cell" key={menus.length}>
        {keys.map(externalFunction =>
          externalMenu("cell", fct[externalFunction], trigger.onItemClick)
        )}
      </SubMenu>
    );
  }
  fct = trigger.menuFunctions.rangeFunctions || {};
  keys = Object.keys(fct);
  if (keys.length) {
    menus.push(
      <SubMenu title="Range" key={menus.length}>
        {keys.map(externalFunction =>
          externalMenu("range", fct[externalFunction], trigger.onItemClick)
        )}
      </SubMenu>
    );
  }
  fct = trigger.menuFunctions.gridFunctions || {};
  keys = Object.keys(fct);
  if (keys.length) {
    menus.push(
      <SubMenu title="Grid" key={menus.length}>
        {keys.map(externalFunction =>
          externalMenu("grid", fct[externalFunction], trigger.onItemClick)
        )}
      </SubMenu>
    );
  }
  if (features.filters === "enabled") {
    menus.push(
      <SubMenu title="Filters" key={menus.length}>
        {trigger.dimensions
          .filter(dimension => dimension.id !== MEASURE_ID)
          .map(dimension => (
            <SubMenu
              key={dimension.id}
              title={
                <span
                  className={classnames({
                    "react-contextmenu-item-filtered": !isNullOrUndefined(
                      trigger.filters[dimension.id]
                    )
                  })}
                >
                  {dimension.caption}
                </span>
              }
            >
              <Filter dimensionId={dimension.id} />
            </SubMenu>
          ))}
      </SubMenu>
    );
  }
  if (features.configuration === "enabled") {
    menus.push(
      <SubMenu
        title="Configuration"
        style={{ width: "fitContent" }}
        key={menus.length}
      >
        <SubMenu key={"cell-height"} title={"Default cell height"}>
          <div style={{ textAlign: "right", backgroundColor: "lightgrey" }}>
            {trigger.configuration.cellHeight}
          </div>
        </SubMenu>
        <SubMenu key={"cell-width"} title={"Default cell width"}>
          <div style={{ textAlign: "right", backgroundColor: "lightgrey" }}>
            {trigger.configuration.cellWidth}
          </div>
        </SubMenu>
        <MenuItem
          key={"toggle-subtotals"}
          onClick={trigger.onItemClick}
          data={{
            action: "toggle-totals",
            value: !trigger.configuration.totalsFirst
          }}
        >
          {"Set totals " +
            (trigger.configuration.totalsFirst ? "after" : "before")}
        </MenuItem>
      </SubMenu>
    );
  }
  if (menus.length) {
    return <ReactContextMenu id={id}>{menus}</ReactContextMenu>;
  } else {
    return null;
  }
};

const ContextMenu = props => {
  const { id, trigger } = props;
  if (isNullOrUndefined(trigger)) {
    return <ReactContextMenu id={id}> </ReactContextMenu>;
    return null;
  }

  if (trigger.type === "dimension-header") {
    return DimensionMenu(id, trigger);
  } else if (trigger.type === `header-${trigger.axis}`) {
    return MeasureMenu(id, trigger);
  } else if (trigger.type === "data-cell") {
    return DataCellMenu(id, trigger);
  }
};

export default ContextMenu;
