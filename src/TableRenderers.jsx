import React from 'react';
import PropTypes from 'prop-types';
import {PivotData} from './Utilities';

function makeRenderer() {
  class TableRenderer extends React.PureComponent {
    calculateCell(stubEntry, stubId, colEntry, colAttr) {
      const {userResponses} = this.props;
      const colOptionId = colEntry.id;

      colEntry[colAttr].forEach(entry => {
        entry.baseScore = 0;
        entry.stubScore = 0;
      });

      userResponses.forEach(response => {
        colEntry[colAttr].forEach(entry => {
          if (response[colOptionId] === entry.value) {
            entry.baseScore++;

            if (response[stubId] === stubEntry.value) {
              entry.stubScore++;
            }
          }
        });
      });

      return colEntry[colAttr].map(entry => {
        const score = Math.round((entry.stubScore / entry.baseScore) * 100);

        return <td>{`${score ? score : 0}%`}</td>;
      });
    }

    render() {
      const pivotData = new PivotData(this.props);

      const stubFilters = pivotData.props.stubValueFilter;
      const colFilters = pivotData.props.colValueFilter;

      const colData = pivotData.props.data.map(dB => {
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
      const colKeys = pivotData.props.cols;

      return (
        <table className="pvtTable">
          <thead>
            <tr>
              <td></td>
              {colKeys.map(function(colAttr, j) {
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
            {stubKeys.map((stubKey, i) => {
              const stubEntry = stubData.find(record =>
                record[stubKey] ? record : null
              );

              return stubEntry[stubKey].map((stubOption, j) => {
                return (
                  <tr key={`stubKeyRow${i}`}>
                    <th key={`stubKeyLabel${i}-${j}`} className="pvtRowLabel">
                      {stubOption.text}
                    </th>
                    {colKeys.map((colAttr, k) => {
                      const colEntry = colData.find(record =>
                        record[colAttr] ? record : null
                      );
                      return this.calculateCell(
                        stubOption,
                        stubEntry.id,
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
