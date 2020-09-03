import React from 'react';
import PropTypes from 'prop-types';
import {PivotData} from './Utilities';

class TableRenderer extends React.Component {
  calculateCell(stubEntry, stubId, headerEntry, headerAttr) {
    const {userResponses, settings} = this.props;
    const {showPercentage} = settings;

    const headerOptionId = headerEntry.id;

    headerEntry[headerAttr].forEach(entry => {
      entry.baseScore = 0;
      entry.stubScore = 0;

      if (!entry.stubScores) {
        entry.stubScores = {};
      }
    });

    userResponses.forEach(response => {
      headerEntry[headerAttr].forEach(entry => {
        if (!entry.stubScores[headerAttr]) {
          entry.stubScores[headerAttr] = {};
        }

        if (response[headerOptionId] === entry.value) {
          entry.baseScore++;

          if (!entry.stubScores[headerAttr][stubId]) {
            entry.stubScores[headerAttr][stubId] = 0;
          }

          if (response[stubId] === stubEntry.value) {
            entry.stubScore++;
            entry.stubScores[headerAttr][stubId] += 1;
          }
        }
      });
    });

    const cells = headerEntry[headerAttr].map(entry => {
      if (showPercentage) {
        const score = Math.round((entry.stubScore / entry.baseScore) * 100);
        return <td>{`${score ? score : 0}%`}</td>;
      }

      return <td>{entry.stubScore}</td>;
    });

    return cells;
  }

  calculateMissingValues(headerData, headerKeys, stubId) {
    const {settings} = this.props;
    const {showPercentage} = settings;

    const missingValues = headerKeys.flatMap(headerAttr => {
      const headerEntry = headerData.find(record =>
        record[headerAttr] ? record : null
      );

      return headerEntry[headerAttr].map(entry => {
        const missingRaw =
          entry.baseScore - entry.stubScores[headerAttr][stubId];

        if (showPercentage) {
          const missingValue = Math.round((missingRaw / entry.baseScore) * 100);
          return missingValue ? missingValue : 0;
        }

        return missingRaw;
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

            return stubEntry[stubKey].map((stubOption, j) => {
              let showStubLabel = true;

              if (j === 0) {
                headerKeys.map(headerAttr => {
                  const headerOptions = headerData.find(record =>
                    record[headerAttr] ? record : null
                  );

                  if (headerOptions[headerAttr]) {
                    headerOptions[headerAttr].forEach(headerOption => {
                      if (headerOption.stubScores) {
                        const objs = Object.values(
                          headerOption.stubScores[headerAttr]
                        );

                        if (objs.length > 0) {
                          headerOption.stubScores[headerAttr] = {};
                        }
                      }
                    });
                  }
                });
              }

              if (currKey !== stubKey) {
                currKey = stubKey;
              } else {
                showStubLabel = false;
              }

              const qLabelRowSpan = stubEntry[stubKey].length;

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
                    {headerKeys.map(headerAttr => {
                      const headerEntry = headerData.find(record =>
                        record[headerAttr] ? record : null
                      );

                      return this.calculateCell(
                        stubOption,
                        stubEntry.id,
                        headerEntry,
                        headerAttr
                      );
                    })}
                  </tr>
                  {[true].map(_ => {
                    const missingValues = this.calculateMissingValues(
                      headerData,
                      headerKeys,
                      stubEntry.id
                    );
                    if (
                      j === stubEntry[stubKey].length - 1 &&
                      missingValues.filter(value => value > 0).length > 0
                    ) {
                      return (
                        <tr>
                          <td></td>
                          <th key={`stubKeyLabel2${i}-${j}-${j}`}>
                            Missing Values
                          </th>
                          {missingValues.map(missingValue => {
                            return (
                              <td>
                                {missingValue}
                                {this.props.settings.showPercentage && '%'}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    }

                    return null;
                  })}
                </React.Fragment>
              );
            });
          })}
        </tbody>
      </table>
    );
  }
}

export default TableRenderer;
