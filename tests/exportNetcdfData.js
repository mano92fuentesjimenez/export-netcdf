const exportNetcdf = require('../lib/exportNetcdfData');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('exporting netcdf files',() => {
  let file = 'tests/wrftest';
  let exporter;

  beforeEach(()=> {
    exporter = {
      init: sinon.stub().resolves(),
      write: sinon.stub().resolves(),
      finishWriting: sinon.stub().resolves(),
    }
  });
  it('should export a char variable of 1 dimension', async () => {
    await exportNetcdf({ dirToFile: file,exporter, variables: ['Times'] });

    expect(exporter.init.calledOnce).to.equal(true);
    expect(exporter.init.firstCall.args).to.deep.equal([[
      {
        fieldName: 'Times',
        fieldType: 'char'
      }], 1]);
    expect(exporter.write.calledOnce).to.equal(true);
    expect(exporter.write.firstCall.args).to.deep.equal([['2018-07-31_00:00:00']]);
    expect(exporter.finishWriting.calledOnce).to.equal(true);
  });

  it('should export a variable of 2 dimension XLAT', async () => {
    await exportNetcdf({ dirToFile: file,exporter, variables: ['XLAT'] });

    expect(exporter.init.calledOnce).to.equal(true);
    expect(exporter.init.firstCall.args).to.deep.equal([[{
      fieldName: 'XLAT',
      fieldType: 'float',
    }], 139*77]);
    expect(exporter.write.callCount).to.equal(139*77);
    exporter.write.args.forEach(([row]) => {
      const keys = Object.keys(row);
      expect(keys.length).to.equal(1);
    });
    expect(exporter.finishWriting.calledOnce).to.equal(true);
  });

  it('should export a variable of 2 dimension XLAT as LATITUDE', async () => {
    await exportNetcdf({ dirToFile: file,exporter, variables: ['XLAT'], variablesUses: {XLAT: 'LATITUDE'}});

    expect(exporter.init.calledOnce).to.equal(true);
    expect(exporter.init.firstCall.args).to.deep.equal([[{
      fieldName: 'LATITUDE',
      fieldType: 'float'
    }], 139*77]);
    expect(exporter.write.callCount).to.equal(139*77);
    exporter.write.args.forEach(([row]) => {
      const keys = Object.keys(row);
      expect(keys.length).to.equal(1);
    });
    expect(exporter.finishWriting.calledOnce).to.equal(true);
  });

  it('should export 2 variables XLAT and Times', async () => {
    await exportNetcdf({ dirToFile: file,exporter, variables: ['XLAT', 'Times'] });

    expect(exporter.init.calledOnce).to.equal(true);
    expect(exporter.init.firstCall.args).to.deep.equal([
      [{
        fieldName: 'XLAT',
        fieldType: 'float'
      },
      {
        fieldName: 'Times',
        fieldType: 'char'
      }], 139*77]);
    expect(exporter.write.callCount).to.equal(139*77);

    exporter.write.args.forEach(([row]) => {
      const keys = Object.keys(row);
      expect(keys.length).to.equal(2);
    });
    expect(exporter.finishWriting.calledOnce).to.equal(true);
  });

  it('should export 2 variables XLAT and XLONG as LATITUDE and LONGITUDE ', async () => {
    await exportNetcdf({ dirToFile: file,exporter, variables: ['XLAT', 'XLONG'],  variablesUses: {XLAT: 'LATITUDE', XLONG: 'LONGITUDE'} });

    expect(exporter.init.calledOnce).to.equal(true);
    expect(exporter.init.firstCall.args).to.deep.equal([
      [{
        fieldName: 'LATITUDE',
        fieldType: 'float'
      },
      {
        fieldName: 'LONGITUDE',
        fieldType: 'float'
      }], 139*77]);
    expect(exporter.write.callCount).to.equal(139*77);

    exporter.write.args.forEach(([row]) => {
      const keys = Object.keys(row);
      expect(keys.length).to.equal(2);
    });
    expect(exporter.finishWriting.calledOnce).to.equal(true);
  });

  it('should export some variables', async () => {
    await exportNetcdf({ dirToFile: file,exporter, variables: ['XLAT', 'Times', 'XLONG', 'Q2', 'T2', 'TH2', 'PSFC', 'U10', 'V10'] });

    expect(exporter.init.calledOnce).to.equal(true);
    expect(exporter.init.firstCall.args).to.deep.equal([[
      {
        fieldName: 'XLAT',
        fieldType: 'float'
      },
      {
        fieldName: 'Times',
        fieldType: 'char'
      },{
        fieldName: 'XLONG',
        fieldType: 'float'
      },
      {
        fieldName: 'Q2',
        fieldType: 'float'
      },
      {
        fieldName: 'T2',
        fieldType: 'float'
      },
      {
        fieldName: 'TH2',
        fieldType: 'float'
      },
      {
        fieldName: 'PSFC',
        fieldType: 'float'
      },
      {
        fieldName: 'U10',
        fieldType: 'float'
      },
      {
        fieldName: 'V10',
        fieldType: 'float'
      }], 139*77 ]);

    expect(exporter.write.callCount).to.equal(139*77);

    exporter.write.args.forEach(([row]) => {
      const keys = Object.keys(row);
      expect(keys.length).to.equal(9);
    });
    expect(exporter.finishWriting.calledOnce).to.equal(true);
  });

  it('should export some variables with XLAT as LATITUDE and XLONG as LONGITUDE', async () => {
    await exportNetcdf({ dirToFile: file,exporter, variables: ['XLAT', 'Times', 'XLONG', 'Q2', 'T2', 'TH2', 'PSFC', 'U10', 'V10'], variablesUses: {XLAT: 'LATITUDE', XLONG: 'LONGITUDE'} });

    expect(exporter.init.calledOnce).to.equal(true);
    expect(exporter.init.firstCall.args).to.deep.equal([[
      {
        fieldName: 'LATITUDE',
        fieldType: 'float'
      },
      {
        fieldName: 'Times',
        fieldType: 'char'
      },{
        fieldName: 'LONGITUDE',
        fieldType: 'float'
      },
      {
        fieldName: 'Q2',
        fieldType: 'float'
      },
      {
        fieldName: 'T2',
        fieldType: 'float'
      },
      {
        fieldName: 'TH2',
        fieldType: 'float'
      },
      {
        fieldName: 'PSFC',
        fieldType: 'float'
      },
      {
        fieldName: 'U10',
        fieldType: 'float'
      },
      {
        fieldName: 'V10',
        fieldType: 'float'
      }], 139*77 ]);

    expect(exporter.write.callCount).to.equal(139*77);

    exporter.write.args.forEach(([row]) => {
      const keys = Object.keys(row);
      expect(keys.length).to.equal(9);
    });
    expect(exporter.finishWriting.calledOnce).to.equal(true);
  });
});
