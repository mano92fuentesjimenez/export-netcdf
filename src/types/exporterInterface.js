// @flow
type emptyFn = () => void;

export type netcdfExporter = {
  write:  Object => Promise<boolean>,
  finishWriting: emptyFn,
  endCallback: emptyFn,
}

export type variablesUses = 'LATITUDE' | 'LONGITUDE' | 'TIME';

export type iteratorController = { total: number, current: number, name: string };
