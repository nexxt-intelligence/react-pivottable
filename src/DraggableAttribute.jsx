import React from 'react';
import PropTypes from 'prop-types';
import Draggable from 'react-draggable';

/* eslint-disable react/prop-types */
// eslint can't see inherited propTypes!

class DraggableAttribute extends React.Component {
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
          className="pvtFilterBox excluded"
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
          <h4>{this.props.name}</h4>

          {showMenu || <p>(too many values to show)</p>}

          {showMenu && (
            <div className="pvtCheckContainer">
              {shown.map(x => {
                const filterName = this.props.valueFilter[this.props.name];
                return (
                  <div
                    className="pvtCheckWrapper"
                    onClick={() => this.toggleValue(x)}
                  >
                    <label className="pvtCheckItem">
                      <input
                        type="checkbox"
                        defaultChecked={true}
                        checked={filterName && !filterName[x.text]}
                      />
                      <span className="checkmark"></span>
                      {x.text === '' ? null : x.text}
                    </label>
                  </div>
                );
              })}
              <button
                className="header-rm-button"
                onClick={this.props.removeHeader}
              >
                Remove Header
              </button>
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
          <span className="pvtHandle"></span>
          {this.props.name}{' '}
          <span
            className="pvtDots"
            onClick={this.toggleFilterBox.bind(this)}
          ></span>
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

export default DraggableAttribute;
