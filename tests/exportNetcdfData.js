const exportNetcdf = require('../lib/exportNetcdfData');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('exporting netcdf files',() => {
  let file = 'tests/wrftest';
  let exporter;

  beforeEach(()=> {
    exporter = {
      init: sinon.stub().resolves(),
      endCallback: sinon.stub().resolves(),
      write: sinon.stub().resolves(),
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
    // expect(exporter.write.firstCall.args).to.deep.equal([{Times: '2018-07-31_00:00:00'}])
  });

  it('should export 2 variables XLAT and Times', async () => {
    await exportNetcdf({ dirToFile: file,exporter, variables: ['XLAT', 'Times'] });
    expect(exporter.write.callCount).to.equal(139*77);
    // expect(exporter.write.firstCall.args).to.deep.equal([{Times: '2018-07-31_00:00:00'}])
  });

  it('should export some variables', async () => {
    await exportNetcdf({ dirToFile: file,exporter, variables: ['XLAT', 'Times', 'XLONG', 'Q2', 'T2', 'TH2', 'PSFC', 'U10', 'V10'] });
    expect(exporter.write.callCount).to.equal(139*77);
  });
});
