// @flow
type promiseFn = () => Promise<void>;

export type netcdfExporter = {
  init: (variables : Array<{ fieldName: string, fieldType: string }>, rowCount: number) => Promise<void>,
  write: (row : Array<any>) => Promise<void>,
  finishWriting: promiseFn
}

export type variablesUses = 'LATITUDE' | 'LONGITUDE' | 'TIME';

export type dimensionIteratorController = { total: number, current: number, name: string };
