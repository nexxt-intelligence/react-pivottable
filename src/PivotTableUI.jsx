import React from 'react';
import Toggle from 'react-toggle';
import PropTypes from 'prop-types';
import update from 'immutability-helper';
import {PivotData, sortAs, getSort} from './Utilities';
import TableRenderers from './TableRenderers';
import Sortable from 'react-sortablejs';
import DraggableAttribute from './DraggableAttribute';
import QuestionDropdown from './QuestionDropdown';
import Slider from 'rc-slider';
import OptionsMenu from './OptionsMenu';
import 'rc-slider/assets/index.css';
import 'react-toggle/style.css';

/* eslint-disable react/prop-types */
// eslint can't see inherited propTypes!

class PivotTableUI extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      unusedOrder: [],
      zIndices: {},
      maxZIndex: 1000,
      openDropdown: false,
      attrValuesB: {},
      materializedInput: [],
      materializedInputB: [],
      tableOptions: {
        showPercentage: true,
        multiLevelMode: false,
      },
      significanceTest: false,
      significance: 80,
    };

    this.toggleTableOption = this.toggleTableOption.bind(this);
    this.toggleSignificanceTest = this.toggleSignificanceTest.bind(this);
    this.handleSignificanceChange = this.handleSignificanceChange.bind(this);
  }

  componentDidMount() {
    if (Array.isArray(this.props.data)) {
      this.materializeInputB(this.props.data);
    } else if (this.props.data) {
      this.materializeInput(this.props.data);
    }
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.data !== this.props.data ||
      prevProps.crossTabID !== this.props.crossTabID
    ) {
      this.setState(prevState => {
        const newTableOptions = prevState.tableOptions;
        newTableOptions.multiLevelMode = false;

        return {
          tableOptions: newTableOptions,
        };
      });
    }

    if (Array.isArray(this.props.data)) {
      this.materializeInputB(this.props.data);
    } else if (this.props.data) {
      this.materializeInput(this.props.data);
    }
  }

  materializeInput(nextdata) {
    if (this.state.data === nextdata.data) {
      return;
    }

    const newState = {
      data: nextdata.data,
      attrValuesB: {},
      materializedInputB: [],
    };

    let recordsProcessed = 0;
    PivotData.forEachRecord(
      newState.data,
      this.props.derivedAttributes,
      function(record) {
        newState.materializedInputB.push(record);
        for (const attr of Object.keys(record)) {
          if (!(attr in newState.attrValuesB)) {
            newState.attrValuesB[attr] = {};
            if (recordsProcessed > 0) {
              newState.attrValuesB[attr].null = recordsProcessed;
            }
          }
        }
        for (const attr in newState.attrValuesB) {
          const value = attr in record ? record[attr] : 'null';
          if (!(value in newState.attrValuesB[attr])) {
            newState.attrValuesB[attr][value] = 0;
          }
          newState.attrValuesB[attr][value]++;
        }
        recordsProcessed++;
      }
    );

    this.setState(newState);
  }

  materializeInputB(nextdata) {
    if (this.state.data === nextdata) {
      return;
    }

    const newState = {
      data: nextdata,
      attrValuesB: {},
      materializedInputB: [],
    };

    let recordsProcessed = 0;
    PivotData.forEachRecord(
      newState.data,
      this.props.derivedAttributes,
      function(record) {
        newState.materializedInputB.push(record);
        for (const attr of Object.keys(record)) {
          if (!(attr in newState.attrValuesB)) {
            newState.attrValuesB[attr] = {};
            if (recordsProcessed > 0) {
              newState.attrValuesB[attr].null = recordsProcessed;
            }
          }
        }
        for (const attr in newState.attrValuesB) {
          const value = attr in record ? record[attr] : 'null';
          if (!(value in newState.attrValuesB[attr])) {
            newState.attrValuesB[attr][value] = 0;
          }
          newState.attrValuesB[attr][value]++;
        }
        recordsProcessed++;
      }
    );

    this.setState(newState);
  }

  toggleTableOption(optionName) {
    const tableOptions = this.state.tableOptions;
    tableOptions[optionName] = !tableOptions[optionName];

    this.setState({tableOptions});
  }

  sendPropUpdate(command) {
    this.props.onChange(update(this.props, command));
  }

  propUpdater(key) {
    return value => {
      console.log(value);
      return this.sendPropUpdate({[key]: {$set: value}});
    };
  }

  setValuesInFilter(attribute, values, filterFieldName) {
    this.sendPropUpdate({
      [filterFieldName]: {
        [attribute]: {
          $set: values.reduce((r, v) => {
            r[v.text] = true;
            return r;
          }, {}),
        },
      },
    });
  }

  addValuesToFilter(attribute, values, type) {
    const filterFieldName = `${type}ValueFilter`;
    if (attribute in this.props[filterFieldName]) {
      this.sendPropUpdate({
        [filterFieldName]: {
          [attribute]: values.reduce((r, v) => {
            r[v.text] = {$set: true};
            return r;
          }, {}),
        },
      });
    } else {
      this.setValuesInFilter(attribute, values, filterFieldName);
    }
  }

  removeValuesFromFilter(attribute, values, type) {
    const filterFieldName = `${type}ValueFilter`;
    const filterTexts = values.map(option => option.text);
    this.sendPropUpdate({
      [filterFieldName]: {[attribute]: {$unset: filterTexts}},
    });
  }

  moveFilterBoxToTop(attribute) {
    this.setState(
      update(this.state, {
        maxZIndex: {$set: this.state.maxZIndex + 1},
        zIndices: {[attribute]: {$set: this.state.maxZIndex + 1}},
      })
    );
  }

  isOpen(dropdown) {
    return this.state.openDropdown === dropdown;
  }

  removeHeader(headerName) {
    const newHeaders = this.props.headers;
    console.log(`removing ${headerName}`);
    const index = newHeaders.indexOf(headerName);

    if (index > -1) {
      newHeaders.splice(index, 1);
    } else {
      newHeaders.push(headerName);
    }

    this.sendPropUpdate({headers: {$set: newHeaders}});
  }

  makeDnDCell(items, onChange, classes, type) {
    const filterType =
      type === 'stub'
        ? this.props.stubValueFilter
        : this.props.headerValueFilter;

    return (
      <Sortable
        options={{
          group: 'shared',
          ghostClass: 'pvtPlaceholder',
          filter: '.excluded',
          preventOnFilter: false,
        }}
        tag="td"
        className={classes}
        onChange={onChange}
      >
        {items.map((item, index) => (
          <DraggableAttribute
            name={item}
            key={item}
            attrValuesB={
              Array.isArray(this.state.data)
                ? this.state.data.find(
                    record => Object.keys(record)[0] === item
                  )
                : {}
            }
            valueFilter={filterType}
            sorter={getSort(this.props.sorters, index)}
            menuLimit={this.props.menuLimit}
            setValuesInFilter={this.setValuesInFilter.bind(this)}
            addValuesToFilter={this.addValuesToFilter.bind(this)}
            moveFilterBoxToTop={this.moveFilterBoxToTop.bind(this)}
            removeValuesFromFilter={this.removeValuesFromFilter.bind(this)}
            type={type}
            zIndex={this.state.zIndices[item] || this.state.maxZIndex}
            removeHeader={() => this.removeHeader(item)}
          />
        ))}
      </Sortable>
    );
  }

  toggleSignificanceTest() {
    this.setState(prevState => ({
      significanceTest: !prevState.significanceTest,
    }));
  }

  handleSignificanceChange(value) {
    this.setState({
      significance: value,
    });
  }

  render() {
    const rendererCell = (
      <td className="settings-cell" rowSpan="2">
        <OptionsMenu
          moveFilterBoxToTop={this.moveFilterBoxToTop.bind(this)}
          toggleValue={this.toggleTableOption}
          options={this.state.tableOptions}
        />
      </td>
    );

    const headerAttrs = this.props.headers.filter(
      e =>
        !this.props.hiddenAttributes.includes(e) &&
        !this.props.hiddenFromDragDrop.includes(e)
    );

    const headerAttrsCell = this.makeDnDCell(
      headerAttrs,
      this.propUpdater('headers'),
      'pvtAxisContainer pvtHorizList pvtCols',
      'header'
    );

    const stubAttrs = this.props.stubs.filter(
      e =>
        !this.props.hiddenAttributes.includes(e) &&
        !this.props.hiddenFromDragDrop.includes(e)
    );
    const stubAttrsCell = this.makeDnDCell(
      stubAttrs,
      this.propUpdater('stubs'),
      'pvtAxisContainer pvtVertList pvtRows',
      'stub'
    );

    const outputCells = (
      <TableRenderers
        {...this.props}
        settings={this.state.tableOptions}
        multiLevelMode={this.state.tableOptions.multiLevelMode}
        significance={this.state.significance}
      />
    );

    const sigDisabled = !this.state.significanceTest;
    const sliderPrimaryColor = sigDisabled ? '#4D4D4D' : '#5AB82D';

    return (
      <table className="pvtUi">
        <tbody
          className="pvtUi-body-wrapper"
          onClick={() => this.setState({openDropdown: false})}
        >
          <tr className="header-row">
            {headerAttrsCell}
            <div className="pvtCols-ext">
              <QuestionDropdown
                name={'Add Question'}
                questions={this.props.stubs}
                updateHeaders={newHeaders => {
                  this.sendPropUpdate({headers: {$set: newHeaders}});
                }}
              />
            </div>{' '}
            <div className="sig-settings">
              <label>
                <Toggle
                  defaultChecked={this.state.significanceTest}
                  icons={false}
                  onChange={this.toggleSignificanceTest}
                />
                <span>
                  Highlight Significant Differences at Confidence Level of
                </span>
              </label>
              <Slider
                disabled={sigDisabled}
                onChange={this.handleSignificanceChange}
                value={this.state.significance}
                min={80}
                max={100}
                step={5}
                marks={{80: '80%', 85: '85%', 90: '90%', 95: '95%', 100: '99%'}}
                railStyle={{
                  backgroundColor: '#CDCDCD',
                }}
                trackStyle={{
                  backgroundColor: sliderPrimaryColor,
                }}
                dotStyle={{display: 'none'}}
                handleStyle={{
                  borderColor: sliderPrimaryColor,
                  borderWidth: '3px',
                  boxShadow: 'none',
                }}
              />
            </div>
          </tr>
          <tr className="table-data">
            {stubAttrsCell}
            {outputCells}
          </tr>
        </tbody>
      </table>
    );
  }
}

PivotTableUI.propTypes = Object.assign({}, PivotData.propTypes, {
  onChange: PropTypes.func.isRequired,
  hiddenAttributes: PropTypes.arrayOf(PropTypes.string),
  hiddenFromAggregators: PropTypes.arrayOf(PropTypes.string),
  hiddenFromDragDrop: PropTypes.arrayOf(PropTypes.string),
  unusedOrientationCutoff: PropTypes.number,
  menuLimit: PropTypes.number,
});

PivotTableUI.defaultProps = Object.assign({}, PivotData.defaultProps, {
  hiddenAttributes: [],
  hiddenFromAggregators: [],
  hiddenFromDragDrop: [],
  unusedOrientationCutoff: 85,
  menuLimit: 500,
});

export default PivotTableUI;
