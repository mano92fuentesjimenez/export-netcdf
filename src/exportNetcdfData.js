// @flow
import type {dimensionIteratorController, netcdfExporter, variablesUses} from "./types/exporterInterface";

// $FlowFixMe
const netcdf4 = require("netcdf4");
const _ = require('lodash');

function* getIterator(iteratorControllers : Array<dimensionIteratorController>, currentIterator: number) : Generator<Array<dimensionIteratorController>,void, void>{
  if(currentIterator === iteratorControllers.length) {
    return yield(iteratorControllers);
  }
  for (let i = 0; i < iteratorControllers[currentIterator].total; i++ ){
    iteratorControllers[currentIterator].current = i;
    for (let j of getIterator(iteratorControllers, currentIterator + 1)) {
      yield j;
    }
  }
}

module.exports = async function exportNetcdfData(
  {
    dirToFile,
    variables,
    exporter,
    variablesUses = {},
  }: {
    dirToFile: string,
    variables: Array<string>,
    exporter: netcdfExporter,
    variablesUses: { [variableName: string]: variablesUses }
  }
){
  if(!exporter)
    throw new Error('No exporter was given');

  const file = new netcdf4.File(dirToFile , "r");

  const dimensionIteratorsControllers : Array<dimensionIteratorController> = _.uniqBy(_.flatten(variables.map(variable => {
    const netcdfVariable = file.root.variables[variable];
    const dimensions = netcdfVariable.dimensions;

    if(netcdfVariable.type === 'char') {
      return { total: dimensions[0].length, name: dimensions[0].name };
    }
    return dimensions.map(d => ({ total: d.length, name: d.name, }));
  })), (d => d.name));

  const totalRows = dimensionIteratorsControllers.reduce( (v, c) => ({ current: 0, name: '', total: v.total * c.total })).total;
  const variablesToInitExporter = variables.map(variable => {
    const netcdfVariable = file.root.variables[variable];
    const variableName = variablesUses[variable]? variablesUses[variable] : variable;
    return { [variableName]: netcdfVariable.type };
  }).reduce((v,c) =>({...c, ...v}));

  await exporter.init(variablesToInitExporter, totalRows );

  const iterator = getIterator(dimensionIteratorsControllers, 0);

  const iteratorsByKeys = _.mapKeys(dimensionIteratorsControllers, iterator => iterator.name);
  const netcdfVariables = {};
  variables.forEach(v => netcdfVariables[v] = file.root.variables[v]);
  while(!iterator.next().done) {
    const row = {};
    variables.forEach( variable => {
      const netcdfVariable = netcdfVariables[variable] ;
      const dimensions = netcdfVariable.dimensions;
      const fieldName = variablesUses[variable]? variablesUses[variable] : variable;

      if (netcdfVariable.type === 'char') {
        const pos = iteratorsByKeys[dimensions[0].name].current;
        row[fieldName] = String.fromCharCode.apply(null,netcdfVariable.readSlice(pos, 1, 0, dimensions[1].length));
        return;
      }
      const pos = dimensions.map(d => iteratorsByKeys[d.name].current);
      row[fieldName] = netcdfVariable.read(...pos);
    });

    await exporter.write(row);
  }
  await exporter.finishWriting();
};
