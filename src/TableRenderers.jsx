import React from 'react';
import PropTypes from 'prop-types';
import {PivotData} from './Utilities';

function makeRenderer() {
  class TableRenderer extends React.PureComponent {
    calculateCell(stubEntry, stubId, headerEntry, headerAttr) {
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

      return headerEntry[headerAttr].map(entry => {
        const score = Math.round((entry.stubScore / entry.baseScore) * 100);

        return <td>{`${score ? score : 0}%`}</td>;
      });
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

                if (currKey !== stubKey) {
                  currKey = stubKey;
                } else {
                  showStubLabel = false;
                }

                return (
                  <tr key={`stubKeyRow${i}`}>
                    {showStubLabel && (
                      <th
                        key={`stubKeyLabel2${i}-${j}`}
                        rowSpan={stubEntry[stubKey].length}
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
