import React from 'react';
import PropTypes from 'prop-types';
import {PivotData} from './Utilities';

function makeRenderer() {
  class TableRenderer extends React.PureComponent {
    constructor(props) {
      super(props);
      this.state = {
        hasMissingValues: false,
      };
    }
    calculateCell(
      stubEntry,
      stubId,
      headerEntry,
      headerAttr,
      headerBaseScoreSums
    ) {
      const {userResponses} = this.props;
      const headerOptionId = headerEntry.id;

      headerEntry[headerAttr].forEach(entry => {
        entry.baseScore = 0;
        entry.stubScore = 0;
      });

      userResponses.forEach(response => {
        headerEntry[headerAttr].forEach(entry => {
          if (response[headerOptionId] === entry.value) {
            entry.baseScore++;

            if (response[stubId] === stubEntry.value) {
              entry.stubScore++;
            }
          }
        });
      });

      return headerEntry[headerAttr].map((entry, i) => {
        const score = Math.round((entry.stubScore / entry.baseScore) * 100);
        headerBaseScoreSums[i] += entry.stubScore;
        return <td>{`${score ? score : 0}%`}</td>;
      });
    }

    calculateMissingValues(headerData, headerKeys, headerBaseScoreSums) {
      const missingValues = headerKeys.flatMap(headerAttr => {
        const headerEntry = headerData.find(record =>
          record[headerAttr] ? record : null
        );

        return headerEntry[headerAttr].map((entry, i) => {
          const headerBaseScore = this.getHeaderBase(entry, headerEntry.id);

          const missingValue = Math.round(
            ((headerBaseScore - headerBaseScoreSums[i]) / headerBaseScore) * 100
          );

          return missingValue ? missingValue : 0;
        });
      });

      return missingValues;
    }

    getHeaderBase(headerEntry, headerId) {
      const {userResponses} = this.props;
      let total = 0;

      userResponses.forEach(response => {
        if (response[headerId] === headerEntry.value) {
          total++;
        }
      });

      return total;
    }

    render() {
      const pivotData = new PivotData(this.props);

      const stubFilters = pivotData.props.stubValueFilter;
      const headerFilters = pivotData.props.headerValueFilter;

      const headerData = pivotData.props.data.map(dB => {
        const dCopy = Object.assign({}, dB);
        const key = Object.keys(dCopy)[0];
        const options = Object.values(dCopy)[0].filter(option => {
          for (const filterProp in headerFilters) {
            const filterValues = headerFilters[filterProp];
            if (filterValues[option.text]) {
              return false;
            }
          }
          return true;
        });

        dCopy[key] = options;
        return dCopy;
      });

      const stubData = pivotData.props.data.map(dB => {
        const dCopy = Object.assign({}, dB);
        const key = Object.keys(dCopy)[0];
        const options = Object.values(dCopy)[0].filter(option => {
          for (const filterProp in stubFilters) {
            const filterValues = stubFilters[filterProp];
            if (filterValues[option.text]) {
              return false;
            }
          }
          return true;
        });

        dCopy[key] = options;
        return dCopy;
      });

      const stubKeys = pivotData.props.stubs;
      const headerKeys = pivotData.props.headers;
      let currKey = '';

      return (
        <table className="pvtTable">
          <thead>
            <tr>
              <td colSpan="2"></td>
              {headerKeys.map(headerAttr => {
                const headerEntries = headerData.find(record =>
                  record[headerAttr] ? record : null
                )[headerAttr];
                return headerEntries.map((headerEntry, i) => {
                  return (
                    <th className="pvtColLabel" key={`headerKey${i}`}>
                      {headerEntry.text}
                    </th>
                  );
                });
              })}
            </tr>
            <tr>
              <th colSpan="2">Base</th>
              {headerKeys.map(headerAttr => {
                const headerFullEntry = headerData.find(record =>
                  record[headerAttr] ? record : null
                );
                const headerOptions = headerFullEntry[headerAttr];

                return headerOptions.map((headerOption, i) => {
                  return (
                    <th className="pvtColLabel" key={`headerKey${i}`}>
                      {this.getHeaderBase(headerOption, headerFullEntry.id)}
                    </th>
                  );
                });
              })}
            </tr>
          </thead>

          <tbody>
            {stubKeys.map((stubKey, i) => {
              const stubEntry = stubData.find(record =>
                record[stubKey] ? record : null
              );

              const headerBaseScoreSums = [0, 0, 0, 0];
              return stubEntry[stubKey].map((stubOption, j) => {
                let showStubLabel = true;
                let missingValues = [];
                if (currKey !== stubKey) {
                  currKey = stubKey;
                } else {
                  showStubLabel = false;
                }

                const qLabelRowSpan = stubEntry[stubKey].length;

                if (j === stubEntry[stubKey].length - 1) {
                  missingValues = this.calculateMissingValues(
                    headerData,
                    headerKeys,
                    headerBaseScoreSums
                  );
                }

                return (
                  <React.Fragment>
                    <tr key={`stubKeyRow${i}`}>
                      {showStubLabel && (
                        <th
                          key={`stubKeyLabel2${i}-${j}`}
                          rowSpan={qLabelRowSpan}
                        >
                          {stubKey}
                        </th>
                      )}
                      <th key={`stubKeyLabel${i}-${j}`} className="pvtRowLabel">
                        {stubOption.text}
                      </th>
                      {headerKeys.map((headerAttr, k) => {
                        const headerEntry = headerData.find(record =>
                          record[headerAttr] ? record : null
                        );
                        return this.calculateCell(
                          stubOption,
                          stubEntry.id,
                          headerEntry,
                          headerAttr,
                          headerBaseScoreSums
                        );
                      })}
                    </tr>
                    {j === stubEntry[stubKey].length - 1 &&
                      this.calculateMissingValues(
                        headerData,
                        headerKeys,
                        headerBaseScoreSums
                      ).filter(value => value > 0).length > 0 && (
                        <tr>
                          <td></td>
                          <th key={`stubKeyLabel2${i}-${j}-${j}`}>
                            Missing Values
                          </th>
                          {missingValues.map(missingValue => {
                            return <td>{missingValue}%</td>;
                          })}
                        </tr>
                      )}
                  </React.Fragment>
                );
              });
            })}
          </tbody>
        </table>
      );
    }
  }

  TableRenderer.defaultProps = PivotData.defaultProps;
  TableRenderer.propTypes = PivotData.propTypes;
  TableRenderer.defaultProps.tableOptions = {};
  TableRenderer.propTypes.tableOptions = PropTypes.object;
  return TableRenderer;
}

export default {
  Table: makeRenderer(),
};
