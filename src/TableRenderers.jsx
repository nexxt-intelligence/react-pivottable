import React from 'react';
import PropTypes from 'prop-types';
import {PivotData} from './Utilities';

function makeRenderer() {
  class TableRenderer extends React.PureComponent {
    calculateCell(rowEntry, rowId, colEntry, colAttr) {
      const {userResponses} = this.props;
      const colOptionId = colEntry.id;
      const rowOptionId = rowId;

      colEntry[colAttr].forEach(entry => {
        entry.baseScore = 0;
        entry.rowScore = 0;
      });

      userResponses.forEach(response => {
        colEntry[colAttr].forEach(entry => {
          if (response[colOptionId] === entry.value) {
            entry.baseScore++;
            // response[rowOptionId]

            if (response[rowOptionId] === rowEntry.value) {
              entry.rowScore++;
            }
          }
        });
      });

      return colEntry[colAttr].map(entry => (
        <td>{`${Math.round((entry.rowScore / entry.baseScore) * 100)}%`}</td>
      ));
    }

    render() {
      const pivotData = new PivotData(this.props);

      const rowFilters = pivotData.props.rowValueFilter;
      const colFilters = pivotData.props.colValueFilter;
      const colAttrs = pivotData.props.cols;
      const rowAttrs = pivotData.props.rows;
      const colData = pivotData.props.dataB.map(dB => {
        const dCopy = Object.assign({}, dB);
        const key = Object.keys(dCopy)[0];
        const options = Object.values(dCopy)[0].filter(option => {
          for (const filterProp in colFilters) {
            const filterValues = colFilters[filterProp];
            if (filterValues[option.text]) {
              return false;
            }
          }
          return true;
        });

        dCopy[key] = options;
        return dCopy;
      });

      const rowData = pivotData.props.dataB.map(dB => {
        const dCopy = Object.assign({}, dB);
        const key = Object.keys(dCopy)[0];
        const options = Object.values(dCopy)[0].filter(option => {
          for (const filterProp in rowFilters) {
            const filterValues = rowFilters[filterProp];
            if (filterValues[option.text]) {
              return false;
            }
          }
          return true;
        });

        dCopy[key] = options;
        return dCopy;
      });

      const rowKeys = pivotData.props.rows;
      const colKeys = pivotData.props.cols;

      const responses = pivotData.props.userResponses;
      const grandTotalAggregator = pivotData.getAggregator([], []);

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
            <tr>
              <td></td>
              {colAttrs.map(function(colAttr, j) {
                const colEntries = colData.find(record =>
                  record[colAttr] ? record : null
                )[colAttr];
                return colEntries.map(function(colEntry, i) {
                  return (
                    <th className="pvtColLabel" key={`colKey${i}`}>
                      {colEntry.text}
                    </th>
                  );
                });
              })}
            </tr>
          </thead>

          <tbody>
            {rowKeys.map((rowKey, i) => {
              const rowEntry = rowData.find(record =>
                record[rowKey] ? record : null
              );

              return rowEntry[rowKey].map((rowOption, j) => {
                return (
                  <tr key={`rowKeyRow${i}`}>
                    <th key={`rowKeyLabel${i}-${j}`} className="pvtRowLabel">
                      {rowOption.text}
                    </th>
                    {colAttrs.map((colAttr, k) => {
                      const colEntry = colData.find(record =>
                        record[colAttr] ? record : null
                      );
                      return this.calculateCell(
                        rowOption,
                        rowEntry.id,
                        colEntry,
                        colAttr
                      );
                    })}
                  </tr>
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
