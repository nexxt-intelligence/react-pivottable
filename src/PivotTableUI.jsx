import React from 'react';
import PropTypes from 'prop-types';
import update from 'immutability-helper';
import {PivotData, sortAs, getSort} from './Utilities';
import PivotTable from './PivotTable';
import Sortable from 'react-sortablejs';
import Draggable from 'react-draggable';

/* eslint-disable react/prop-types */
// eslint can't see inherited propTypes!

export class DraggableAttribute extends React.Component {
  constructor(props) {
    super(props);
    this.state = {open: false, filterText: ''};
  }

  toggleValue(value) {
    const filterProperty = this.props.valueFilter;
    if (
      this.props.name in filterProperty &&
      value in filterProperty[this.props.name]
    ) {
      console.log('true!');
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
    return x
      .toLowerCase()
      .trim()
      .includes(this.state.filterText.toLowerCase().trim());
  }

  selectOnly(e, value) {
    e.stopPropagation();
    const filterFieldName = `${this.props.type}ValueFilter`;
    this.props.setValuesInFilter(
      this.props.name,
      Object.keys(this.props.attrValues).filter(y => y !== value),
      filterFieldName
    );
  }

  getFilterBox() {
    const values = this.props.attrValues[this.props.name];
    const showMenu = values.length < this.props.menuLimit;
    const shown = values
      .filter(this.matchesFilter.bind(this))
      .sort(this.props.sorter);

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
                onClick={
                  (() =>
                    this.props.removeValuesFromFilter(
                      this.props.name,
                      Object.keys(this.props.attrValues).filter(
                        this.matchesFilter.bind(this)
                      )
                    ),
                  this.props.type)
                }
              >
                Select {values.length === shown.length ? 'All' : shown.length}
              </a>{' '}
              <a
                role="button"
                className="pvtButton"
                onClick={() =>
                  this.props.addValuesToFilter(
                    this.props.name,
                    Object.keys(this.props.attrValues).filter(
                      this.matchesFilter.bind(this)
                    ),
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
                    className={filterName && filterName[x] ? '' : 'selected'}
                  >
                    <a className="pvtOnly" onClick={e => this.selectOnly(e, x)}>
                      only
                    </a>
                    <a className="pvtOnlySpacer">&nbsp;</a>

                    {x === '' ? <em>null</em> : x}
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
  attrValues: PropTypes.object.isRequired,
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
                {r}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}

class PivotTableUI extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      unusedOrder: [],
      zIndices: {},
      maxZIndex: 1000,
      openDropdown: false,
      attrValues: {},
      attrValuesB: {},
      materializedInput: [],
      materializedInputB: [],
    };
  }

  componentDidMount() {
    this.materializeInput(this.props.data);
    this.materializeInputB(this.props.dataB);
  }

  componentDidUpdate() {
    this.materializeInput(this.props.data);
    this.materializeInputB(this.props.dataB);
  }

  materializeInput(nextData) {
    if (this.state.data === nextData) {
      return;
    }
    const newState = {
      data: nextData,
      attrValues: {},
      materializedInput: [],
    };

    let recordsProcessed = 0;
    PivotData.forEachRecord(
      newState.data,
      this.props.derivedAttributes,
      function(record) {
        newState.materializedInput.push(record);
        for (const attr of Object.keys(record)) {
          if (!(attr in newState.attrValues)) {
            newState.attrValues[attr] = {};
            if (recordsProcessed > 0) {
              newState.attrValues[attr].null = recordsProcessed;
            }
          }
        }
        for (const attr in newState.attrValues) {
          const value = attr in record ? record[attr] : 'null';
          if (!(value in newState.attrValues[attr])) {
            newState.attrValues[attr][value] = 0;
          }
          newState.attrValues[attr][value]++;
        }
        recordsProcessed++;
      }
    );

    this.setState(newState);
  }

  materializeInputB(nextDataB) {
    if (this.state.dataB === nextDataB) {
      return;
    }

    const newState = {
      dataB: nextDataB,
      attrValuesB: {},
      materializedInputB: [],
    };

    let recordsProcessed = 0;
    PivotData.forEachRecord(
      newState.dataB,
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

  sendPropUpdate(command) {
    console.log(command);
    this.props.onChange(update(this.props, command));
  }

  propUpdater(key) {
    return value => this.sendPropUpdate({[key]: {$set: value}});
  }

  setValuesInFilter(attribute, values, filterFieldName) {
    console.log(filterFieldName);
    this.sendPropUpdate({
      [filterFieldName]: {
        [attribute]: {
          $set: values.reduce((r, v) => {
            r[v] = true;
            return r;
          }, {}),
        },
      },
    });
  }

  addValuesToFilter(attribute, values, type) {
    const filterFieldName = `${type}ValueFilter`;
    console.log('at:', attribute);
    console.log('at:', this.props.valueFilter);
    if (attribute in this.props[filterFieldName]) {
      this.sendPropUpdate({
        [filterFieldName]: {
          [attribute]: values.reduce((r, v) => {
            r[v] = {$set: true};
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
    this.sendPropUpdate({
      [filterFieldName]: {[attribute]: {$unset: values}},
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
    // console.log('items:', items);
    // console.log('items:', this.state.dataB);
    const filterType =
      type === 'row' ? this.props.rowValueFilter : this.props.colValueFilter;
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
            attrValues={this.state.dataB.find(
              record => Object.keys(record)[0] === item
            )}
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
    const numValsAllowed =
      this.props.aggregators[this.props.aggregatorName]([])().numInputs || 0;

    const rendererName =
      this.props.rendererName in this.props.renderers
        ? this.props.rendererName
        : Object.keys(this.props.renderers)[0];

    const rendererCell = (
      <td className="pvtRenderers">
        <Dropdown
          current={rendererName}
          values={Object.keys(this.props.renderers)}
          open={this.isOpen('renderer')}
          zIndex={this.isOpen('renderer') ? this.state.maxZIndex + 1 : 1}
          toggle={() =>
            this.setState({
              openDropdown: this.isOpen('renderer') ? false : 'renderer',
            })
          }
          setValue={this.propUpdater('rendererName')}
        />
      </td>
    );

    const sortIcons = {
      key_a_to_z: {
        rowSymbol: '↕',
        colSymbol: '↔',
        next: 'value_a_to_z',
      },
      value_a_to_z: {
        rowSymbol: '↓',
        colSymbol: '→',
        next: 'value_z_to_a',
      },
      value_z_to_a: {rowSymbol: '↑', colSymbol: '←', next: 'key_a_to_z'},
    };

    const aggregatorCell = (
      <td className="pvtVals">
        <Dropdown
          current={this.props.aggregatorName}
          values={Object.keys(this.props.aggregators)}
          open={this.isOpen('aggregators')}
          zIndex={this.isOpen('aggregators') ? this.state.maxZIndex + 1 : 1}
          toggle={() =>
            this.setState({
              openDropdown: this.isOpen('aggregators') ? false : 'aggregators',
            })
          }
          setValue={this.propUpdater('aggregatorName')}
        />
        <a
          role="button"
          className="pvtRowOrder"
          onClick={() =>
            this.propUpdater('rowOrder')(sortIcons[this.props.rowOrder].next)
          }
        >
          {sortIcons[this.props.rowOrder].rowSymbol}
        </a>
        <a
          role="button"
          className="pvtColOrder"
          onClick={() =>
            this.propUpdater('colOrder')(sortIcons[this.props.colOrder].next)
          }
        >
          {sortIcons[this.props.colOrder].colSymbol}
        </a>
        {numValsAllowed > 0 && <br />}
        {new Array(numValsAllowed).fill().map((n, i) => [
          <Dropdown
            key={i}
            current={this.props.vals[i]}
            values={Object.keys(this.state.attrValues).filter(
              e =>
                !this.props.hiddenAttributes.includes(e) &&
                !this.props.hiddenFromAggregators.includes(e)
            )}
            open={this.isOpen(`val${i}`)}
            zIndex={this.isOpen(`val${i}`) ? this.state.maxZIndex + 1 : 1}
            toggle={() =>
              this.setState({
                openDropdown: this.isOpen(`val${i}`) ? false : `val${i}`,
              })
            }
            setValue={value =>
              this.sendPropUpdate({
                vals: {$splice: [[i, 1, value]]},
              })
            }
          />,
          i + 1 !== numValsAllowed ? <br key={`br${i}`} /> : null,
        ])}
      </td>
    );

    const unusedAttrs = Object.keys(this.state.attrValuesB)
      .filter(
        e =>
          !this.props.cols.includes(e) &&
          !this.props.hiddenAttributes.includes(e) &&
          !this.props.hiddenFromDragDrop.includes(e)
      )
      .sort(sortAs(this.state.unusedOrder));

    const unusedLength = unusedAttrs.reduce((r, e) => r + e.length, 0);
    const horizUnused = unusedLength < this.props.unusedOrientationCutoff;

    const unusedAttrsCell = this.makeDnDCell(
      unusedAttrs,
      order => this.setState({unusedOrder: order}),
      `pvtAxisContainer pvtUnused ${
        horizUnused ? 'pvtHorizList' : 'pvtVertList'
      }`,
      'row'
    );

    const colAttrs = this.props.cols.filter(
      e =>
        !this.props.hiddenAttributes.includes(e) &&
        !this.props.hiddenFromDragDrop.includes(e)
    );

    const colAttrsCell = this.makeDnDCell(
      colAttrs,
      this.propUpdater('cols'),
      'pvtAxisContainer pvtHorizList pvtCols',
      'col'
    );

    const rowAttrs = this.props.rows.filter(
      e =>
        !this.props.hiddenAttributes.includes(e) &&
        !this.props.hiddenFromDragDrop.includes(e)
    );
    const rowAttrsCell = this.makeDnDCell(
      rowAttrs,
      this.propUpdater('rows'),
      'pvtAxisContainer pvtVertList pvtRows',
      'row'
    );

    const outputCell = (
      <td className="pvtOutput">
        <PivotTable
          {...update(this.props, {
            data: {$set: this.state.materializedInput},
            dataB: {$set: this.state.materializedInputB},
          })}
        />
      </td>
    );

    if (horizUnused) {
      return (
        <table className="pvtUi">
          <tbody onClick={() => this.setState({openDropdown: false})}>
            <tr>
              <td></td>
              {unusedAttrsCell}
            </tr>
            <tr>
              <td></td>
              {colAttrsCell}
            </tr>
            <tr>
              {rowAttrsCell}
              {outputCell}
            </tr>
          </tbody>
        </table>
      );
    }

    return (
      <table className="pvtUi">
        <tbody onClick={() => this.setState({openDropdown: false})}>
          <tr>
            <td></td>
            {colAttrsCell}
          </tr>
          <tr>
            {unusedAttrsCell}
            {rowAttrsCell}
            {outputCell}
          </tr>
        </tbody>
      </table>
    );
  }
}

PivotTableUI.propTypes = Object.assign({}, PivotTable.propTypes, {
  onChange: PropTypes.func.isRequired,
  hiddenAttributes: PropTypes.arrayOf(PropTypes.string),
  hiddenFromAggregators: PropTypes.arrayOf(PropTypes.string),
  hiddenFromDragDrop: PropTypes.arrayOf(PropTypes.string),
  unusedOrientationCutoff: PropTypes.number,
  menuLimit: PropTypes.number,
});

PivotTableUI.defaultProps = Object.assign({}, PivotTable.defaultProps, {
  hiddenAttributes: [],
  hiddenFromAggregators: [],
  hiddenFromDragDrop: [],
  unusedOrientationCutoff: 85,
  menuLimit: 500,
});

export default PivotTableUI;
