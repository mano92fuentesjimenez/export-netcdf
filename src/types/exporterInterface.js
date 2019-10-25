// @flow
type promiseFn = () => Promise<void>;

export type netcdfExporter = {
  init: (variables : {[colName: string]: string}, rowCount: number) => Promise<void>,
  write: (row : {[rowName: string]: any}) => Promise<void>,
  finishWriting: promiseFn
}

export type variablesUses = 'LATITUDE' | 'LONGITUDE' | 'TIME';

export type dimensionIteratorController = { total: number, current: number, name: string };
