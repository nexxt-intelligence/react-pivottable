import React from 'react';
import {PivotData} from './Utilities';

/* eslint-disable react/prop-types */

const spanSize = function(arr, i, j) {
  let x;
  if (i !== 0) {
    let asc, end;
    let noDraw = true;
    for (
      x = 0, end = j, asc = end >= 0;
      asc ? x <= end : x >= end;
      asc ? x++ : x--
    ) {
      if (arr[i - 1][x] !== arr[i][x]) {
        noDraw = false;
      }
    }
    if (noDraw) {
      return -1;
    }
  }
  let len = 0;
  while (i + len < arr.length) {
    let asc1, end1;
    let stop = false;
    for (
      x = 0, end1 = j, asc1 = end1 >= 0;
      asc1 ? x <= end1 : x >= end1;
      asc1 ? x++ : x--
    ) {
      if (arr[i][x] !== arr[i + len][x]) {
        stop = true;
      }
    }
    if (stop) {
      break;
    }
    len++;
  }
  return len;
};

class TableRenderer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      headersRow: [],
    };
  }

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

  updateSpans() {
    const rows = [...this.state.headersRow];
    rows.forEach(row => {
      row.html = React.cloneElement(row.html, {
        children: row.html.props.children.map(th => {
          const divider = rows.length > 1 ? rows[rows.length - 1].length : 1;

          return React.cloneElement(th, {
            colSpan: divider / row.length,
          });
        }),
      });
    });

    this.setState({
      headersRow: rows,
    });
  }

  refreshHeaders() {
    const rows = [];
    const headerKeys = this.props.headers;
    const headerData = this.props.data;
    let it = 0;

    // insert top row
    const currHeaderKey = headerKeys[0];
    const headerOptions = headerData.find(record =>
      record[currHeaderKey] ? record : null
    )[currHeaderKey];

    rows.push({
      html: (
        <tr>
          {headerOptions.map(option => (
            <th>{option.text}</th>
          ))}
        </tr>
      ),
      length: headerOptions.length,
    });

    while (it < headerKeys.length - 1) {
      const nextOptionCells = [];

      const nextHeaderKey = headerKeys[it + 1];
      const nextHeaderOptions = headerData.find(record =>
        record[nextHeaderKey] ? record : null
      )[nextHeaderKey];

      for (let j = 0; j < rows[it].length; j++) {
        nextHeaderOptions.forEach(nextOption => {
          nextOptionCells.push(<th colSpan="1">{nextOption.text}</th>);
        });
      }

      rows.push({
        html: <tr>{nextOptionCells.map(o => o)}</tr>,
        length: nextOptionCells.length,
      });
      it++;
    }

    this.setState(
      {
        headersRow: rows,
      },
      () => {
        this.updateSpans();
      }
    );
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.headers !== this.props.headers) {
      let it = 0;

      const rows = [...this.state.headersRow];
      const headerKeys = this.props.headers;
      const headerData = this.props.data;

      if (this.props.headers.length <= prevProps.headers.length) {
        this.refreshHeaders();
        return;
      }
      if (headerKeys.length === 1) {
        const currHeaderKey = headerKeys[it];
        const headerOptions = headerData.find(record =>
          record[currHeaderKey] ? record : null
        )[currHeaderKey];

        rows.push({
          html: (
            <tr>
              {headerOptions.map(option => (
                <th>{option.text}</th>
              ))}
            </tr>
          ),
          length: headerOptions.length,
        });
      } else {
        it = this.state.headersRow.length - 1;
      }

      while (it < headerKeys.length - 1) {
        const nextOptionCells = [];

        const nextHeaderKey = headerKeys[it + 1];
        const nextHeaderOptions = headerData.find(record =>
          record[nextHeaderKey] ? record : null
        )[nextHeaderKey];
        for (let j = 0; j < this.state.headersRow[it].length; j++) {
          nextHeaderOptions.forEach(nextOption => {
            nextOptionCells.push(<th colSpan="1">{nextOption.text}</th>);
          });
        }

        rows.push({
          html: <tr>{nextOptionCells.map(o => o)}</tr>,
          length: nextOptionCells.length,
        });
        it++;
      }

      this.setState({
        headersRow: rows,
      });
    }

    if (
      JSON.stringify(prevState.headersRow) !==
        JSON.stringify(this.state.headersRow) &&
      this.props.headers.length > 1
    ) {
      this.updateSpans();
    }
  }

  render() {
    const pivotData = new PivotData(this.props);

    const stubFilters = pivotData.props.stubValueFilter;
    const headerFilters = pivotData.props.headerValueFilter;

    const multiLevelMode = this.props.multiLevelMode;
    const multiFlatMode = !multiLevelMode;

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
          {multiFlatMode && (
            <React.Fragment>
              <tr>
                <td colSpan="2"></td>
                {headerKeys.map((headerKey, i) => {
                  const headerEntries = headerData.find(record =>
                    record[headerKey] ? record : null
                  )[headerKey];

                  return (
                    <th
                      className="pvtColLabel"
                      key={`headerKeyTitle${i}`}
                      colSpan={headerEntries.length}
                    >
                      {headerKey}
                    </th>
                  );
                })}
              </tr>
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
            </React.Fragment>
          )}

          {multiLevelMode && (
            <tr>
              <td colSpan="2">
                {headerKeys.map(headerKey => (
                  <tr>
                    <th>{headerKey}</th>
                  </tr>
                ))}
              </td>
              <td>{this.state.headersRow.map(row => row.html)}</td>
            </tr>
          )}

          {multiFlatMode && (
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
          )}

          {multiLevelMode && (
            <tr>
              <th colSpan="2">Base</th>
            </tr>
          )}
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

                    {multiFlatMode &&
                      headerKeys.map(headerAttr => {
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
                  {multiFlatMode &&
                    [true].map(_ => {
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
