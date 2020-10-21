import React from 'react';
import {PivotData} from './Utilities';

/* eslint-disable react/prop-types */
class TableRenderer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      headersRows: [],
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

  calculateMultiLevelCell(stubEntry, stubId, index, finalRowLength, sums) {
    const {userResponses, settings} = this.props;
    const {showPercentage} = settings;
    const rows = [...this.state.headersRows];
    const selectedValues = [];

    rows.forEach(row => {
      const value =
        Math.ceil(((index + 1) * row.length) / finalRowLength) %
        row.optionsLength;

      selectedValues.push({
        title: row.title,
        questionId: row.questionId,
        value: value > 0 ? value : row.optionsLength,
      });
    });

    const entry = {
      baseScore: 0,
      stubScore: 0,
      stubScores: {},
    };

    if (!sums[index]) {
      sums[index] = {
        base: 0,
        stub: 0,
      };
    }

    if (sums[index].base > 0) {
      sums[index].base = 0;
    }
    userResponses.forEach(response => {
      if (!entry.stubScores[index]) {
        entry.stubScores[index] = {};
      }

      const checkedValues = selectedValues.filter(
        selectedValue =>
          response[selectedValue.questionId] == selectedValue.value
      );

      if (checkedValues.length === selectedValues.length) {
        entry.baseScore++;
        sums[index].base++;

        if (!entry.stubScores[index][stubId]) {
          entry.stubScores[index][stubId] = 0;
        }

        if (response[stubId] === stubEntry.value) {
          if (sums[index].stub >= 0) {
            sums[index].stub += 1;
          }

          entry.stubScore++;
        }
      }
    });

    if (showPercentage) {
      const score = Math.round((entry.stubScore / entry.baseScore) * 100);
      return <td>{`${score ? score : 0}%`}</td>;
    }

    return <td>{entry.stubScore}</td>;
  }

  calculateMultiLevelMissingValue(finalRowLength, sums) {
    const {settings} = this.props;
    const {showPercentage} = settings;

    const missingValues = [...Array(finalRowLength)].flatMap((_, index) => {
      if (sums[index]) {
        const missingRaw = sums[index].base - sums[index].stub;

        if (showPercentage) {
          const missingValue = Math.round(
            (missingRaw / sums[index].base) * 100
          );
          return missingValue ? missingValue : 0;
        }

        return missingRaw;
      }
    });

    return missingValues ? missingValues : [];
  }

  getMultiLevelHeaderBase(index, finalRowLength) {
    const {userResponses} = this.props;
    const rows = [...this.state.headersRows];
    const selectedValues = [];

    let total = 0;

    rows.forEach(row => {
      const value =
        Math.ceil(((index + 1) * row.length) / finalRowLength) %
        row.optionsLength;

      selectedValues.push({
        title: row.title,
        questionId: row.questionId,
        value: value > 0 ? value : row.optionsLength,
      });
    });

    userResponses.forEach(response => {
      const checkedValues = selectedValues.filter(
        selectedValue =>
          response[selectedValue.questionId] == selectedValue.value
      );

      if (checkedValues.length === selectedValues.length) {
        total++;
      }
    });

    return total;
  }

  updateSpans() {
    const rows = [...this.state.headersRows];

    rows.forEach(row => {
      row.html = row.html.map(th => {
        const divider = rows.length > 1 ? rows[rows.length - 1].length : 1;

        return React.cloneElement(th, {
          colSpan: divider / row.length,
        });
      });
    });

    this.setState({
      headersRows: rows,
    });
  }

  refreshHeaders() {
    const rows = [];
    const headerKeys = this.props.headers;
    const headerData = this.props.data;
    let it = 0;

    // insert top row
    const currHeaderKey = headerKeys[it];
    const headerRecord = headerData.find(record =>
      record[currHeaderKey] ? record : null
    );
    const headerQuestionId = headerRecord.id;
    const headerOptions = headerRecord[currHeaderKey];

    rows.push({
      html: headerOptions.map(option => <th>{option.text}</th>),
      length: headerOptions.length,
      optionsLength: headerOptions.length,
      title: currHeaderKey,
      questionId: headerQuestionId,
    });

    while (it < headerKeys.length - 1) {
      const nextOptionCells = [];

      const nextHeaderKey = headerKeys[it + 1];
      const nextHeaderRecord = headerData.find(record =>
        record[nextHeaderKey] ? record : null
      );
      const nextHeaderQuestionId = nextHeaderRecord.id;
      const nextHeaderOptions = nextHeaderRecord[nextHeaderKey];

      for (let j = 0; j < rows[it].length; j++) {
        nextHeaderOptions.forEach(nextOption => {
          nextOptionCells.push(<th colSpan="1">{nextOption.text}</th>);
        });
      }

      rows.push({
        html: nextOptionCells.map(o => o),
        length: nextOptionCells.length,
        optionsLength: nextHeaderOptions.length,
        title: nextHeaderKey,
        questionId: nextHeaderQuestionId,
      });

      it++;
    }

    this.setState(
      {
        headersRows: rows,
      },
      () => {
        this.updateSpans();
      }
    );
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.data !== this.props.data ||
      (this.props.multiLevelMode !== prevProps.multiLevelMode &&
        !this.props.multiLevelMode)
    ) {
      this.setState({
        headersRows: [],
      });
    } else if (
      this.props.multiLevelMode !== prevProps.multiLevelMode &&
      this.props.multiLevelMode
    ) {
      this.refreshHeaders();
      return;
    }

    if (prevProps.headers !== this.props.headers) {
      let it = 0;

      const rows = [...this.state.headersRows];
      const headerKeys = this.props.headers;
      const headerData = this.props.data;

      if (
        this.props.multiLevelMode &&
        this.props.headers.length <= prevProps.headers.length &&
        this.props.headers.length > 0
      ) {
        this.refreshHeaders();
        return;
      }

      if (headerKeys.length === 1) {
        const currHeaderKey = headerKeys[it];
        const headerRecord = headerData.find(record =>
          record[currHeaderKey] ? record : null
        );
        const headerQuestionId = headerRecord.id;
        const headerOptions = headerRecord[currHeaderKey];

        rows.push({
          html: headerOptions.map(option => <th>{option.text}</th>),
          length: headerOptions.length,
          optionsLength: headerOptions.length,
          title: currHeaderKey,
          questionId: headerQuestionId,
        });
      } else {
        it = this.state.headersRows.length - 1;
      }

      while (it < headerKeys.length - 1) {
        const nextOptionCells = [];

        const nextHeaderKey = headerKeys[it + 1];
        const nextHeaderRecord = headerData.find(record =>
          record[nextHeaderKey] ? record : null
        );
        const nextHeaderQuestionId = nextHeaderRecord.id;
        const nextHeaderOptions = nextHeaderRecord[nextHeaderKey];
        if (this.state.headersRows[it]) {
          for (let j = 0; j < this.state.headersRows[it].length; j++) {
            nextHeaderOptions.forEach(nextOption => {
              nextOptionCells.push(<th colSpan="1">{nextOption.text}</th>);
            });
          }

          rows.push({
            html: nextOptionCells.map(o => o),
            length: nextOptionCells.length,
            optionsLength: nextHeaderOptions.length,
            title: nextHeaderKey,
            questionId: nextHeaderQuestionId,
          });
        }
        it++;
      }

      this.setState({
        headersRows: rows,
      });
    }

    if (
      JSON.stringify(prevState.headersRows) !==
        JSON.stringify(this.state.headersRows) &&
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

    const {headersRows} = this.state;
    const headerLastRowIndex = headersRows.length - 1;
    const headersSpanSize =
      headersRows.length > 0 ? headersRows[headerLastRowIndex].length : 1;

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
                      className="pvtColLabel title"
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
                      <th
                        className="pvtColLabel subtitle"
                        key={`headerKey${i}`}
                      >
                        {headerEntry.text}
                      </th>
                    );
                  });
                })}
              </tr>
            </React.Fragment>
          )}

          {multiFlatMode && (
            <tr className="base--mode">
              <th className="row--handler"></th>
              <th className="title">Base</th>
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
        </thead>

        {/* {multiLevelMode && (
            <React.Fragment>
              {headersRows.map(row => (
                <tr>
                  <th colSpan="2">{row.title}</th>
                  {row.html}
                </tr>
              ))}

              <tr>
                <th className="pvtRowLabel" colSpan="2">
                  Base
                </th>
                {headersRows.length > 0 &&
                  [...Array(headersRows[headerLastRowIndex].length)].map(
                    (element, index) => {
                      return (
                        <th
                          className="pvtColLabel"
                          key={`headerKey${index}`}
                          colSpan="1"
                        >
                          {this.getMultiLevelHeaderBase(index, headersSpanSize)}
                        </th>
                      );
                    }
                  )}
              </tr>
            </React.Fragment>
          )} */}
        {stubKeys.map((stubKey, i) => {
          const stubEntry = stubData.find(record =>
            record[stubKey] ? record : null
          );

          const sums = {};

          return (
            <React.Fragment>
              <tbody>
                {stubEntry[stubKey].map((stubOption, j) => {
                  let showStubLabel = true;

                  if (headerKeys.length > 0)
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

                  return (
                    <React.Fragment>
                      {!j && (
                        <tr>
                          <th className="row--handler"></th>
                          <th className="title">{stubKey}</th>
                        </tr>
                      )}

                      <tr key={`stubKeyRow${i}`}>
                        <th></th>
                        <th
                          key={`stubKeyLabel${i}-${j}`}
                          className="pvtRowLabel subtitle"
                        >
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

                        {multiLevelMode &&
                          headersRows.length > 0 &&
                          [
                            ...Array(headersRows[headerLastRowIndex].length),
                          ].map((_, index) => {
                            return this.calculateMultiLevelCell(
                              stubOption,
                              stubEntry.id,
                              index,
                              headersSpanSize,
                              sums
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
                                      {this.props.settings.showPercentage &&
                                        '%'}
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          }

                          return null;
                        })}

                      {multiLevelMode &&
                        [true].map(_ => {
                          if (j === stubEntry[stubKey].length - 1) {
                            const missingValues = this.calculateMultiLevelMissingValue(
                              headersSpanSize,
                              sums
                            );

                            if (
                              missingValues.filter(value => value > 0).length >
                              0
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
                                        {this.props.settings.showPercentage &&
                                          '%'}
                                      </td>
                                    );
                                  })}
                                </tr>
                              );
                            }
                          }

                          return null;
                        })}
                    </React.Fragment>
                  );
                })}
              </tbody>
              <tbody className="separator"></tbody>
            </React.Fragment>
          );
        })}
      </table>
    );
  }
}

export default TableRenderer;
