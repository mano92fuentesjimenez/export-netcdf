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

    expect(exporter.write.calledOnce).to.equal(true);
    expect(exporter.write.firstCall.args).to.deep.equal([{Times: '2018-07-31_00:00:00'}])
  });

  it('should export a variable of 2 dimension XLAT', async () => {
    await exportNetcdf({ dirToFile: file,exporter, variables: ['XLAT'] });
    expect(exporter.write.callCount).to.equal(139*77);
    exporter.write.args.forEach(([row]) => {
      const keys = Object.keys(row);
      expect(keys.length).to.equal(1);
      expect(keys[0]).to.equal('XLAT');
    })
  });

  it('should export a variable of 2 dimension XLAT as LATITUDE', async () => {
    await exportNetcdf({ dirToFile: file,exporter, variables: ['XLAT'], variablesUses: {XLAT: 'LATITUDE'}});
    expect(exporter.write.callCount).to.equal(139*77);
    exporter.write.args.forEach(([row]) => {
      const keys = Object.keys(row);
      expect(keys.length).to.equal(1);
      expect(keys[0]).to.equal('LATITUDE');
    })

  });

  it('should export 2 variables XLAT and Times', async () => {
    await exportNetcdf({ dirToFile: file,exporter, variables: ['XLAT', 'Times'] });
    expect(exporter.write.callCount).to.equal(139*77);

    exporter.write.args.forEach(([row]) => {
      const keys = Object.keys(row);
      expect(keys.length).to.equal(2);
      expect(keys[0]).to.equal('XLAT');
      expect(keys[1]).to.equal('Times');
    })
  });

  it('should export 2 variables XLAT and XLONG as LATITUDE and LONGITUDE ', async () => {
    await exportNetcdf({ dirToFile: file,exporter, variables: ['XLAT', 'XLONG'],  variablesUses: {XLAT: 'LATITUDE', XLONG: 'LONGITUDE'} });
    expect(exporter.write.callCount).to.equal(139*77);

    exporter.write.args.forEach(([row]) => {
      const keys = Object.keys(row);
      expect(keys.length).to.equal(2);
      expect(keys[0]).to.equal('LATITUDE');
      expect(keys[1]).to.equal('LONGITUDE');
    })
  });

  it('should export some variables', async () => {
    await exportNetcdf({ dirToFile: file,exporter, variables: ['XLAT', 'Times', 'XLONG', 'Q2', 'T2', 'TH2', 'PSFC', 'U10', 'V10'] });
    expect(exporter.write.callCount).to.equal(139*77);

    exporter.write.args.forEach(([row]) => {
      const keys = Object.keys(row);
      expect(keys.length).to.equal(9);
      expect(keys[0]).to.equal('XLAT');
      expect(keys[1]).to.equal('Times');
      expect(keys[2]).to.equal('XLONG');
      expect(keys[3]).to.equal('Q2');
      expect(keys[4]).to.equal('T2');
      expect(keys[5]).to.equal('TH2');
      expect(keys[6]).to.equal('PSFC');
      expect(keys[7]).to.equal('U10');
      expect(keys[8]).to.equal('V10');
    })
  });

  it('should export some variables with XLAT as LATITUDE and XLONG as LONGITUDE', async () => {
    await exportNetcdf({ dirToFile: file,exporter, variables: ['XLAT', 'Times', 'XLONG', 'Q2', 'T2', 'TH2', 'PSFC', 'U10', 'V10'], variablesUses: {XLAT: 'LATITUDE', XLONG: 'LONGITUDE'} });
    expect(exporter.write.callCount).to.equal(139*77);

    exporter.write.args.forEach(([row]) => {
      const keys = Object.keys(row);
      expect(keys.length).to.equal(9);
      expect(keys[0]).to.equal('LATITUDE');
      expect(keys[1]).to.equal('Times');
      expect(keys[2]).to.equal('LONGITUDE');
      expect(keys[3]).to.equal('Q2');
      expect(keys[4]).to.equal('T2');
      expect(keys[5]).to.equal('TH2');
      expect(keys[6]).to.equal('PSFC');
      expect(keys[7]).to.equal('U10');
      expect(keys[8]).to.equal('V10');
    })
  });
});
