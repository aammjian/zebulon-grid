import {
  pushData,
  setDimensions,
  setMeasures,
  setConfigProperty,
  moveDimension,
  toggleMeasure
} from './actions';
import {
  isPromise,
  isObservable,
  isStringOrNumber,
  isNullOrUndefined,
  toAccessorFunction
} from './utils/generic';
import { MEASURE_ID } from './constants';
import * as aggregations from './Aggregation';

export default function hydrateStore(
  store,
  config,
  datasource,
  configFunctions
) {
  if (Array.isArray(datasource)) {
    store.dispatch(pushData(datasource));
  } else if (isPromise(datasource)) {
    datasource.then(data => store.dispatch(pushData(data)));
  } else if (isObservable(datasource)) {
    datasource.subscribe(data => {
      store.dispatch(pushData(data));
    });
  } else {
    throw new Error(
      'datasource type is not supported, datasource must be an array, a promise or an observable, got ',
      datasource
    );
  }
  config.dimensions.push({ id: MEASURE_ID, caption: '' });
  store.dispatch(setDimensions(config, configFunctions));

  store.dispatch(setDimensions(config, configFunctions));

  store.dispatch(setMeasures(config, configFunctions));
  const dimensions = config.dimensions.map(dimension =>
    dimensionFactory(dimension, configFunctions)
  );
  const measures = config.measures.map(measure =>
    measureFactory(measure, configFunctions)
  );

  store.dispatch(setConfigProperty(config, 'measureHeadersAxis', 'columns'));
  store.dispatch(setConfigProperty(config, 'height', 600));
  store.dispatch(setConfigProperty(config, 'width', 800));
  store.dispatch(setConfigProperty(config, 'cellHeight', 30));
  store.dispatch(setConfigProperty(config, 'cellWidth', 100));
  store.dispatch(setConfigProperty(config, 'zoom', 1));

  const dimensionIdsPositioned = [MEASURE_ID];
  config.rows.forEach((dimensionId, index) => {
    store.dispatch(moveDimension(dimensionId, 'dimensions', 'rows', index));
    dimensionIdsPositioned.push(dimensionId);
  });
  config.columns.forEach((dimensionId, index) => {
    store.dispatch(moveDimension(dimensionId, 'dimensions', 'columns', index));
    dimensionIdsPositioned.push(dimensionId);
  });
  if (config.measureHeadersAxis === 'columns') {
    store.dispatch(
      moveDimension(MEASURE_ID, 'dimensions', 'columns', config.columns.length)
    );
  } else {
    store.dispatch(
      moveDimension(MEASURE_ID, 'dimensions', 'rows', config.rows.length)
    );
  }
  Object.values(dimensions)
    .filter(dimension => !dimensionIdsPositioned.includes(dimension.id))
    .forEach((dimension, index) => {
      store.dispatch(
        moveDimension(dimension.id, 'dimensions', 'dimensions', index)
      );
    });

  config.activeMeasures.forEach(measureId => {
    store.dispatch(toggleMeasure(measureId));
  });

  // const customFunctions = {
  //   sort: dimensions.reduce(
  //     (acc, dimension) => ({ ...acc, [dimension.id]: dimension.sort.custom }),
  //     {}
  //   ),
  //   access: measures.reduce(
  //     (acc, dimension) => ({ ...acc, [dimension.id]: dimension.accessor }),
  //     {}
  //   ),
  //   format: measures.reduce(
  //     (acc, dimension) => ({ ...acc, [dimension.id]: dimension.format }),
  //     {}
  //   ),
  //   aggregation: measures.reduce(
  //     (acc, dimension) => ({ ...acc, [dimension.id]: dimension.aggregation }),
  //     {}
  //   )
  // };
  // return customFunctions;
}

// initialisation of dimensions from configuration
export function dimensionFactory(dimensionConfig, configFunctions) {
  const {
    id,
    caption,
    keyAccessor,
    labelAccessor,
    sort,
    format,
    subTotal,
    isAttributeOf
  } = dimensionConfig;
  const { formats, accessors, sorts } = configFunctions;
  const dimSort = !isNullOrUndefined(sort)
    ? {
        direction: sort.direction,
        custom: sorts[sort.custom] || sort.custom,
        keyAccessor: toAccessorFunction(
          accessors[sort.keyAccessor] ||
            sort.keyAccessor ||
            accessors[labelAccessor] ||
            labelAccessor ||
            accessors[keyAccessor] ||
            keyAccessor
        )
      }
    : {
        direction: 'asc',
        keyAccessor: toAccessorFunction(
          accessors[labelAccessor] ||
            labelAccessor ||
            accessors[keyAccessor] ||
            keyAccessor
        )
      };
  return {
    id,
    caption: id === MEASURE_ID ? '' : caption || id,
    keyAccessor: toAccessorFunction(accessors[keyAccessor] || keyAccessor),
    labelAccessor: toAccessorFunction(
      accessors[labelAccessor] ||
        labelAccessor ||
        accessors[keyAccessor] ||
        keyAccessor
    ),
    format: formats[format] || (value => value),
    sort: dimSort,
    subTotal,
    isAttributeOf
  };
}
// initialisation of measures from configuration
export function measureFactory(measureConfig, configFunctions) {
  const {
    formats,
    accessors,
    customAggregations = aggregations
  } = configFunctions;
  const {
    id,
    caption,
    valueAccessor,
    format,
    aggregation,
    aggregationCaption
  } = measureConfig;
  const aggs = { ...aggregations, ...customAggregations };
  return {
    id,
    caption: caption || id,
    valueAccessor: toAccessorFunction(
      accessors[valueAccessor] || valueAccessor
    ),
    format: formats[format] || (value => value),
    aggregation: isStringOrNumber(aggregation)
      ? aggs[aggregation]
      : aggregation,
    aggregationCaption
  };
}
