import { dimensionFactory, measureFactory } from "../utils/configuration";
import {
  SET_AXIS,
  SET_DIMENSIONS,
  SET_MEASURES,
  SET_CONFIG_PROPERTY,
  TOGGLE_MEASURE,
  TOGGLE_MEASURES_AXIS,
  MOVE_MEASURE,
  MOVE_DIMENSION,
  ZOOM,
  LOADING_CONFIG
} from "../constants";
import { utils } from "zebulon-controls";
export const loadingConfig = loading => ({
  type: LOADING_CONFIG,
  loading
});
export const setDimensions = (configObject, functions) => ({
  type: SET_DIMENSIONS,
  dimensions: utils
    .objectToArray(configObject.dimensions)
    .map(dimension =>
      dimensionFactory(dimension, functions, configObject.object || "dataset")
    )
});

export const setMeasures = (configObject, functions) => ({
  type: SET_MEASURES,
  measures: utils
    .objectToArray(configObject.measures)
    .map(measure =>
      measureFactory(measure, functions, configObject.object || "dataset")
    )
});
export const setProperty = (property, value) => ({
  type: SET_CONFIG_PROPERTY,
  property,
  value: value
});
export const setConfigurationProperty = (
  configObject,
  property,
  defaultValue
) => ({
  type: SET_CONFIG_PROPERTY,
  property,
  value: configObject[property] || defaultValue
});

export const toggleMeasure = measureId => ({
  type: TOGGLE_MEASURE,
  id: measureId
});
export const toggleMeasuresAxis = () => ({
  type: TOGGLE_MEASURES_AXIS
});
export const moveMeasure = (measureId, position) => ({
  type: MOVE_MEASURE,
  id: measureId,
  position
});
export const moveDimension = (dimensionId, oldAxis, newAxis, position) => ({
  type: MOVE_DIMENSION,
  id: dimensionId,
  oldAxis,
  newAxis,
  position
});

export const setAxis = axis => ({
  type: SET_AXIS,
  axis
});

export const zoom = zoomValue => {
  return { type: ZOOM, zoomValue };
};
// export const zoomOut = () => ({ type: ZOOM_OUT });
// export const zoom = type => {
//   return { type };
// };
