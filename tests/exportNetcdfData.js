const exportNetcdf = require('../lib/exportNetcdfData');
const sinon = require('sinon');
const expect = require('chai').expect;

const data = require('./netcdfData');

describe('exporting netcdf files',() => {
  let file = 'tests/netcdf.nc';
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
    expect(exporter.write.firstCall.args).to.deep.equal([['2019-02-26_08:00:00']]);
    expect(exporter.finishWriting.calledOnce).to.equal(true);
  });

  it('should export a variable of 2 dimension XLAT', async () => {
    await exportNetcdf({ dirToFile: file,exporter, variables: ['lat'] });

    expect(exporter.init.calledOnce).to.equal(true);
    expect(exporter.init.firstCall.args).to.deep.equal([[{
      fieldName: 'lat',
      fieldType: 'float',
    }], 5 * 5]);
    expect(exporter.write.callCount).to.equal(5 * 5);
    exporter.write.args.forEach(([row], index) => {
      const keys = Object.keys(row);
      expect(keys.length).to.equal(1);
      expect(row[0]).to.equal(data.lat[Math.floor(index / 5)][index % 5]);
    });
    expect(exporter.finishWriting.calledOnce).to.equal(true);
  });

  it('should export 2 variables XLAT and Times', async () => {
    await exportNetcdf({ dirToFile: file,exporter, variables: ['lat', 'Times'] });

    expect(exporter.init.calledOnce).to.equal(true);
    expect(exporter.init.firstCall.args).to.deep.equal([
      [{
        fieldName: 'lat',
        fieldType: 'float'
      },
      {
        fieldName: 'Times',
        fieldType: 'char'
      }], 5 * 5]);
    expect(exporter.write.callCount).to.equal(5 * 5);


    exporter.write.args.forEach(([row], index) => {
      const keys = Object.keys(row);
      expect(keys.length).to.equal(2);
      expect(row[0]).to.equal(data.lat[Math.floor(index / 5)][index % 5]);
      expect(row[1]).to.equal('2019-02-26_08:00:00');
    });
    expect(exporter.finishWriting.calledOnce).to.equal(true);
  });

  it('should export some variables', async () => {
    await exportNetcdf({ dirToFile: file,exporter, variables: ['lat', 'Times', 'lon', 'Q2', 'T2', 'TH2', 'PSFC', 'U10', 'V10'] });

    expect(exporter.init.calledOnce).to.equal(true);
    expect(exporter.init.firstCall.args).to.deep.equal([[
      {
        fieldName: 'lat',
        fieldType: 'float'
      },
      {
        fieldName: 'Times',
        fieldType: 'char'
      },{
        fieldName: 'lon',
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
      }], 5 * 5 ]);

    expect(exporter.write.callCount).to.equal(5 * 5);

    exporter.write.args.forEach(([row], index) => {
      const keys = Object.keys(row);
      expect(keys.length).to.equal(9);

      expect(row[0]).to.equal(data.lat[Math.floor(index / 5)][index % 5]);
      expect(row[1]).to.equal('2019-02-26_08:00:00');
      expect(row[2]).to.equal(data.lon[Math.floor(index / 5)][index % 5]);
      expect(row[3]).to.equal(data.Q2[Math.floor(index / 5)][index % 5]);
      expect(row[4]).to.equal(data.T2[Math.floor(index / 5)][index % 5]);
      expect(row[5]).to.equal(data.TH2[Math.floor(index / 5)][index % 5]);
      expect(row[6]).to.equal(data.PSFC[Math.floor(index / 5)][index % 5]);
      expect(row[7]).to.equal(data.U10[Math.floor(index / 5)][index % 5]);
      expect(row[8]).to.equal(data.V10[Math.floor(index / 5)][index % 5]);
    });
    expect(exporter.finishWriting.calledOnce).to.equal(true);
  });
});
