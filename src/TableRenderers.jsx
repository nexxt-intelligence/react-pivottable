import React from 'react';
import PropTypes from 'prop-types';
import {PivotData} from './Utilities';

// helper function for setting row/col-span in pivotTableRenderer
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

function redColorScaleGenerator(values) {
  const min = Math.min.apply(Math, values);
  const max = Math.max.apply(Math, values);
  return x => {
    // eslint-disable-next-line no-magic-numbers
    const nonRed = 255 - Math.round((255 * (x - min)) / (max - min));
    return {backgroundColor: `rgb(255,${nonRed},${nonRed})`};
  };
}

function makeRenderer() {
  class TableRenderer extends React.PureComponent {
    render() {
      // console.log('Renderer props: ', this.props);
      const pivotData = new PivotData(this.props);
      console.log('pivotData: ', pivotData);
      const colAttrs = pivotData.props.cols;
      const rowAttrs = pivotData.props.rows;
      const dataB = pivotData.props.dataB;

      const rowKeys = pivotData.props.rows;
      const colKeys = pivotData.getColKeys();
      const grandTotalAggregator = pivotData.getAggregator([], []);
      console.log('Row Keyz: ', rowKeys);

      const getClickHandler =
        this.props.tableOptions && this.props.tableOptions.clickCallback
          ? (value, rowValues, colValues) => {
              const filters = {};
              for (const i of Object.keys(colAttrs || {})) {
                const attr = colAttrs[i];
                if (colValues[i] !== null) {
                  filters[attr] = colValues[i];
                }
              }
              for (const i of Object.keys(rowAttrs || {})) {
                const attr = rowAttrs[i];
                if (rowValues[i] !== null) {
                  filters[attr] = rowValues[i];
                }
              }
              return e =>
                this.props.tableOptions.clickCallback(
                  e,
                  value,
                  filters,
                  pivotData
                );
            }
          : null;

      return (
        <table className="pvtTable">
          <thead>
            {colAttrs.map(function(c, j) {
              return (
                <tr key={`colAttr${j}`}>
                  {j === 0 && rowAttrs.length !== 0 && (
                    <th colSpan={rowAttrs.length} rowSpan={colAttrs.length} />
                  )}
                  <th className="pvtAxisLabel">{c}</th>
                  {colKeys.map(function(colKey, i) {
                    const x = spanSize(colKeys, i, j);
                    if (x === -1) {
                      return null;
                    }
                    return (
                      <th
                        className="pvtColLabel"
                        key={`colKey${i}`}
                        colSpan={x}
                        rowSpan={
                          j === colAttrs.length - 1 && rowAttrs.length !== 0
                            ? 2
                            : 1
                        }
                      >
                        {colKey[j]}
                      </th>
                    );
                  })}

                  {j === 0 && (
                    <th
                      className="pvtTotalLabel"
                      rowSpan={
                        colAttrs.length + (rowAttrs.length === 0 ? 0 : 1)
                      }
                    >
                      Totals
                    </th>
                  )}
                </tr>
              );
            })}

            {/* {rowAttrs.length !== 0 && (
              <tr>
                {rowAttrs.map(function(r, i) {
                  return (
                    <th className="pvtAxisLabel" key={`rowAttr${i}`}>
                      {r}
                    </th>
                  );
                })}
                <th className="pvtTotalLabel">
                  {colAttrs.length === 0 ? 'Totals' : null}
                </th>
              </tr>
            )} */}
          </thead>

          <tbody>
            {rowKeys.map((rowKey, i) => {
              console.log('Key:', rowKey);
              const rowEntry = dataB.find(record =>
                record[rowKey] ? record : null
              )[rowKey];

              console.log('Row Entry: ', rowEntry);

              return rowEntry.map(function(txt, j) {
                console.log('Row Text: ', txt);
                return (
                  <tr key={`rowKeyRow${i}`}>
                    <th key={`rowKeyLabel${i}-${j}`} className="pvtRowLabel">
                      {txt}
                    </th>
                  </tr>
                );
              });
            })}
            {/* {rowKeys.map(function(rowKey, i) {
              const totalAggregator = pivotData.getAggregator(rowKey, []);

              return rowKey.map(function(txt, j) {
                const x = spanSize(rowKeys, i, j);
                if (x === -1) {
                  return null;
                }
                return (
                  <tr key={`rowKeyRow${i}`}>
                    <th
                      key={`rowKeyLabel${i}-${j}`}
                      className="pvtRowLabel"
                      rowSpan={x}
                      colSpan={
                        j === rowAttrs.length - 1 && colAttrs.length !== 0
                          ? 2
                          : 1
                      }
                    >
                      {txt}
                    </th>
                  </tr>
                );
              });
            })} */}

            <tr>
              <th
                className="pvtTotalLabel"
                colSpan={rowAttrs.length + (colAttrs.length === 0 ? 0 : 1)}
              >
                Totals
              </th>

              {colKeys.map(function(colKey, i) {
                const totalAggregator = pivotData.getAggregator([], colKey);
                return (
                  <td
                    className="pvtTotal"
                    key={`total${i}`}
                    onClick={
                      getClickHandler &&
                      getClickHandler(totalAggregator.value(), [null], colKey)
                    }
                  >
                    {totalAggregator.format(totalAggregator.value())}
                  </td>
                );
              })}

              <td
                onClick={
                  getClickHandler &&
                  getClickHandler(grandTotalAggregator.value(), [null], [null])
                }
                className="pvtGrandTotal"
              >
                {grandTotalAggregator.format(grandTotalAggregator.value())}
              </td>
            </tr>
          </tbody>
        </table>
      );
    }
  }

  TableRenderer.defaultProps = PivotData.defaultProps;
  TableRenderer.propTypes = PivotData.propTypes;
  TableRenderer.defaultProps.tableColorScaleGenerator = redColorScaleGenerator;
  TableRenderer.defaultProps.tableOptions = {};
  TableRenderer.propTypes.tableColorScaleGenerator = PropTypes.func;
  TableRenderer.propTypes.tableOptions = PropTypes.object;
  return TableRenderer;
}

export default {
  Table: makeRenderer(),
};
