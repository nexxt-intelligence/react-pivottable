import React from 'react';
import PropTypes from 'prop-types';
import update from 'immutability-helper';
import {PivotData, sortAs, getSort} from './Utilities';
import TableRenderers from './TableRenderers';
import Sortable from 'react-sortablejs';
import Draggable from 'react-draggable';
import OptionsMenu from './OptionsMenu';

/* eslint-disable react/prop-types */
// eslint can't see inherited propTypes!

export class DraggableAttribute extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      filterText: '',
    };
  }

  toggleValue(value) {
    const filterProperty = this.props.valueFilter;
    if (
      this.props.name in filterProperty &&
      value.text in filterProperty[this.props.name]
    ) {
      this.props.removeValuesFromFilter(
        this.props.name,
        [value],
        this.props.type
      );
    } else {
      this.props.addValuesToFilter(this.props.name, [value], this.props.type);
    }
  }

  matchesFilter(x) {
    return x.text
      .toLowerCase()
      .trim()
      .includes(this.state.filterText.toLowerCase().trim());
  }

  selectOnly(e, value) {
    e.stopPropagation();
    const filterFieldName = `${this.props.type}ValueFilter`;
    this.props.setValuesInFilter(
      this.props.name,
      Object.keys(this.props.attrValuesB).filter(y => y !== value),
      filterFieldName
    );
  }

  getFilterBox() {
    const values = this.props.attrValuesB[this.props.name];
    const showMenu = values.length < this.props.menuLimit;
    const shown = values
      .filter(this.matchesFilter.bind(this))
      .sort(this.props.sorter);

    const options = Object.values(this.props.attrValuesB)
      .filter(property => Array.isArray(property))
      .flatMap(property => property);

    return (
      <Draggable handle=".pvtDragHandle">
        <div
          className="pvtFilterBox"
          style={{
            display: 'block',
            cursor: 'initial',
            zIndex: this.props.zIndex,
          }}
          onClick={() => this.props.moveFilterBoxToTop(this.props.name)}
        >
          <a onClick={() => this.setState({open: false})} className="pvtCloseX">
            ×
          </a>
          <span className="pvtDragHandle">☰</span>
          <h4>{this.props.name}</h4>

          {showMenu || <p>(too many values to show)</p>}

          {showMenu && (
            <p>
              <input
                type="text"
                placeholder="Filter values"
                className="pvtSearch"
                value={this.state.filterText}
                onChange={e =>
                  this.setState({
                    filterText: e.target.value,
                  })
                }
              />
              <br />
              <a
                role="button"
                className="pvtButton"
                onClick={() => {
                  this.props.removeValuesFromFilter(
                    this.props.name,
                    options.filter(this.matchesFilter.bind(this)),
                    this.props.type
                  );
                }}
              >
                Select {values.length === shown.length ? 'All' : shown.length}
              </a>{' '}
              <a
                role="button"
                className="pvtButton"
                onClick={() =>
                  this.props.addValuesToFilter(
                    this.props.name,
                    options.filter(this.matchesFilter.bind(this)),
                    this.props.type
                  )
                }
              >
                Deselect {values.length === shown.length ? 'All' : shown.length}
              </a>
            </p>
          )}

          {showMenu && (
            <div className="pvtCheckContainer">
              {shown.map(x => {
                const filterName = this.props.valueFilter[this.props.name];
                return (
                  <p
                    key={x}
                    onClick={() => this.toggleValue(x)}
                    className={
                      filterName && filterName[x.text] ? '' : 'selected'
                    }
                  >
                    {x.text === '' ? null : x.text}
                  </p>
                );
              })}
            </div>
          )}
        </div>
      </Draggable>
    );
  }

  toggleFilterBox() {
    this.setState({open: !this.state.open});
    this.props.moveFilterBoxToTop(this.props.name);
  }

  render() {
    const filtered =
      Object.keys(this.props.valueFilter).length !== 0
        ? 'pvtFilteredAttribute'
        : '';
    return (
      <li data-id={this.props.name}>
        <span className={'pvtAttr ' + filtered}>
          {this.props.name}
          <span
            className="pvtTriangle"
            onClick={this.toggleFilterBox.bind(this)}
          >
            {' '}
            ▾
          </span>
        </span>

        {this.state.open ? this.getFilterBox() : null}
      </li>
    );
  }
}

DraggableAttribute.defaultProps = {
  valueFilter: {},
};

DraggableAttribute.propTypes = {
  name: PropTypes.string.isRequired,
  addValuesToFilter: PropTypes.func.isRequired,
  removeValuesFromFilter: PropTypes.func.isRequired,
  attrValuesB: PropTypes.object.isRequired,
  valueFilter: PropTypes.objectOf(PropTypes.bool),
  moveFilterBoxToTop: PropTypes.func.isRequired,
  sorter: PropTypes.func.isRequired,
  menuLimit: PropTypes.number,
  zIndex: PropTypes.number,
};

export class Dropdown extends React.PureComponent {
  render() {
    return (
      <div className="pvtDropdown" style={{zIndex: this.props.zIndex}}>
        <div
          onClick={e => {
            e.stopPropagation();
            this.props.toggle();
          }}
          className={
            'pvtDropdownValue pvtDropdownCurrent ' +
            (this.props.open ? 'pvtDropdownCurrentOpen' : '')
          }
          role="button"
        >
          <div className="pvtDropdownIcon">{this.props.open ? '×' : '▾'}</div>
          {this.props.current || <span>&nbsp;</span>}
        </div>

        {this.props.open && (
          <div className="pvtDropdownMenu">
            {this.props.values.map(r => (
              <div
                key={r}
                role="button"
                onClick={e => {
                  e.stopPropagation();
                  if (this.props.current === r) {
                    this.props.toggle();
                  } else {
                    this.props.setValue(r);
                  }
                }}
                className={
                  'pvtDropdownValue ' +
                  (r === this.props.current ? 'pvtDropdownActiveValue' : '')
                }
              >
                {r.text}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}

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
        multiLevelMode: true,
      },
    };

    this.toggleTableOption = this.toggleTableOption.bind(this);
  }

  componentDidMount() {
    if (Array.isArray(this.props.data)) {
      this.materializeInputB(this.props.data);
    } else if (this.props.data) {
      this.materializeInput(this.props.data);
    }
  }

  componentDidUpdate() {
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
    return value => this.sendPropUpdate({[key]: {$set: value}});
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
          filter: '.pvtFilterBox',
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
          />
        ))}
      </Sortable>
    );
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

    const unusedAttrs = Object.keys(this.state.attrValuesB)
      .filter(
        e =>
          !this.props.headers.includes(e) &&
          !this.props.hiddenAttributes.includes(e) &&
          !this.props.hiddenFromDragDrop.includes(e) &&
          e !== 'id'
      )
      .sort(sortAs(this.state.unusedOrder));

    const unusedAttrsCell = this.makeDnDCell(
      unusedAttrs,
      order => this.setState({unusedOrder: order}),
      `pvtAxisContainer pvtUnused ${'pvtHorizList'}`,
      'header'
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
      />
    );

    return (
      <table className="pvtUi">
        <tbody onClick={() => this.setState({openDropdown: false})}>
          <tr>
            {rendererCell}
            {unusedAttrsCell}
          </tr>
          <tr>{headerAttrsCell}</tr>
          <tr>
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
