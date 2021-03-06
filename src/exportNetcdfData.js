// @flow
import type { dimensionIteratorController, netcdfExporter } from './types/exporterInterface';

// $FlowFixMe
const netcdf4 = require('netcdf4');
const _ = require('lodash');

// eslint-disable-next-line consistent-return
function* getIterator(
  iteratorControllers: Array<dimensionIteratorController>,
  currentIterator: number,
): Generator<Array<dimensionIteratorController>, void, void> {
  if (currentIterator === iteratorControllers.length) {
    return yield (iteratorControllers);
  }
  for (let i = 0; i < iteratorControllers[currentIterator].total; i++) {
    // eslint-disable-next-line no-param-reassign
    iteratorControllers[currentIterator].current = i;
    // eslint-disable-next-line no-restricted-syntax
    for (const j of getIterator(iteratorControllers, currentIterator + 1)) {
      yield j;
    }
  }
}

module.exports = async function exportNetcdfData(
  {
    dirToFile,
    variables,
    exporter,
  }: {
    dirToFile: string,
    variables: Array<string>,
    exporter: netcdfExporter,
  },
) {
  if (!exporter) throw new Error('No exporter was given');

  const file = new netcdf4.File(dirToFile, 'r');

  const dimensionIteratorsControllers: Array<dimensionIteratorController> = _.uniqBy(
    _.flatten(
      variables.map((variable) => {
        const netcdfVariable = file.root.variables[variable];
        const { dimensions } = netcdfVariable;

        if (netcdfVariable.type === 'char') {
          return { total: dimensions[0].length, name: dimensions[0].name };
        }
        return dimensions.map((d) => ({ total: d.length, name: d.name }));
      }),
    ), ((d) => d.name),
  );

  const totalRows = dimensionIteratorsControllers.reduce((v, c) => (v * c.total), 1);
  const variablesToInitExporter = variables.map((variable) => {
    const netcdfVariable = file.root.variables[variable];
    return {
      fieldName: variable,
      fieldType: netcdfVariable.type,
    };
  });

  await exporter.init(variablesToInitExporter, totalRows);

  const iterator = getIterator(dimensionIteratorsControllers, 0);

  const iteratorsByKeys = _.mapKeys(
    dimensionIteratorsControllers,
    (iteratorController) => iteratorController.name,
  );
  const netcdfVariables = {};
  variables.forEach((v) => netcdfVariables[v] = file.root.variables[v]);
  while (!iterator.next().done) {
    const row = [];
    variables.forEach((variable) => {
      const netcdfVariable = netcdfVariables[variable];
      const { dimensions } = netcdfVariable;

      if (netcdfVariable.type === 'char') {
        const pos = iteratorsByKeys[dimensions[0].name].current;
        row.push(String.fromCharCode.apply(
          null,
          netcdfVariable.readSlice(pos, 1, 0, dimensions[1].length),
        ));
        return;
      }
      const pos = dimensions.map((d) => iteratorsByKeys[d.name].current);
      row.push(netcdfVariable.read(...pos));
    });

    // eslint-disable-next-line no-await-in-loop
    await exporter.write(row);
  }
  await exporter.finishWriting();
};
