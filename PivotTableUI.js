'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Dropdown = exports.DraggableAttribute = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _immutabilityHelper = require('immutability-helper');

var _immutabilityHelper2 = _interopRequireDefault(_immutabilityHelper);

var _Utilities = require('./Utilities');

var _PivotTable = require('./PivotTable');

var _PivotTable2 = _interopRequireDefault(_PivotTable);

var _reactSortablejs = require('react-sortablejs');

var _reactSortablejs2 = _interopRequireDefault(_reactSortablejs);

var _reactDraggable = require('react-draggable');

var _reactDraggable2 = _interopRequireDefault(_reactDraggable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/* eslint-disable react/prop-types */
// eslint can't see inherited propTypes!

var DraggableAttribute = exports.DraggableAttribute = function (_React$Component) {
  _inherits(DraggableAttribute, _React$Component);

  function DraggableAttribute(props) {
    _classCallCheck(this, DraggableAttribute);

    var _this = _possibleConstructorReturn(this, (DraggableAttribute.__proto__ || Object.getPrototypeOf(DraggableAttribute)).call(this, props));

    _this.state = { open: false, filterText: '' };
    return _this;
  }

  _createClass(DraggableAttribute, [{
    key: 'toggleValue',
    value: function toggleValue(value) {
      var filterProperty = this.props.valueFilter;
      if (this.props.name in filterProperty && value.text in filterProperty[this.props.name]) {
        this.props.removeValuesFromFilter(this.props.name, [value], this.props.type);
      } else {
        this.props.addValuesToFilter(this.props.name, [value], this.props.type);
      }
    }
  }, {
    key: 'matchesFilter',
    value: function matchesFilter(x) {
      return x.text.toLowerCase().trim().includes(this.state.filterText.toLowerCase().trim());
    }
  }, {
    key: 'selectOnly',
    value: function selectOnly(e, value) {
      e.stopPropagation();
      var filterFieldName = this.props.type + 'ValueFilter';
      this.props.setValuesInFilter(this.props.name, Object.keys(this.props.attrValuesB).filter(function (y) {
        return y !== value;
      }), filterFieldName);
    }
  }, {
    key: 'getFilterBox',
    value: function getFilterBox() {
      var _this2 = this;

      var values = this.props.attrValuesB[this.props.name];
      var showMenu = values.length < this.props.menuLimit;
      var shown = values.filter(this.matchesFilter.bind(this)).sort(this.props.sorter);

      var options = Object.values(this.props.attrValuesB).filter(function (property) {
        return Array.isArray(property);
      }).flatMap(function (property) {
        return property;
      });

      return _react2.default.createElement(
        _reactDraggable2.default,
        { handle: '.pvtDragHandle' },
        _react2.default.createElement(
          'div',
          {
            className: 'pvtFilterBox',
            style: {
              display: 'block',
              cursor: 'initial',
              zIndex: this.props.zIndex
            },
            onClick: function onClick() {
              return _this2.props.moveFilterBoxToTop(_this2.props.name);
            }
          },
          _react2.default.createElement(
            'a',
            { onClick: function onClick() {
                return _this2.setState({ open: false });
              }, className: 'pvtCloseX' },
            '\xD7'
          ),
          _react2.default.createElement(
            'span',
            { className: 'pvtDragHandle' },
            '\u2630'
          ),
          _react2.default.createElement(
            'h4',
            null,
            this.props.name
          ),
          showMenu || _react2.default.createElement(
            'p',
            null,
            '(too many values to show)'
          ),
          showMenu && _react2.default.createElement(
            'p',
            null,
            _react2.default.createElement('input', {
              type: 'text',
              placeholder: 'Filter values',
              className: 'pvtSearch',
              value: this.state.filterText,
              onChange: function onChange(e) {
                return _this2.setState({
                  filterText: e.target.value
                });
              }
            }),
            _react2.default.createElement('br', null),
            _react2.default.createElement(
              'a',
              {
                role: 'button',
                className: 'pvtButton',
                onClick: function onClick() {
                  _this2.props.removeValuesFromFilter(_this2.props.name, options.filter(_this2.matchesFilter.bind(_this2)), _this2.props.type);
                }
              },
              'Select ',
              values.length === shown.length ? 'All' : shown.length
            ),
            ' ',
            _react2.default.createElement(
              'a',
              {
                role: 'button',
                className: 'pvtButton',
                onClick: function onClick() {
                  return _this2.props.addValuesToFilter(_this2.props.name, options.filter(_this2.matchesFilter.bind(_this2)), _this2.props.type);
                }
              },
              'Deselect ',
              values.length === shown.length ? 'All' : shown.length
            )
          ),
          showMenu && _react2.default.createElement(
            'div',
            { className: 'pvtCheckContainer' },
            shown.map(function (x) {
              var filterName = _this2.props.valueFilter[_this2.props.name];
              return _react2.default.createElement(
                'p',
                {
                  key: x,
                  onClick: function onClick() {
                    return _this2.toggleValue(x);
                  },
                  className: filterName && filterName[x.text] ? '' : 'selected'
                },
                _react2.default.createElement(
                  'a',
                  { className: 'pvtOnly', onClick: function onClick(e) {
                      return _this2.selectOnly(e, x);
                    } },
                  'only'
                ),
                _react2.default.createElement(
                  'a',
                  { className: 'pvtOnlySpacer' },
                  '\xA0'
                ),
                x.text === '' ? null : x.text
              );
            })
          )
        )
      );
    }
  }, {
    key: 'toggleFilterBox',
    value: function toggleFilterBox() {
      this.setState({ open: !this.state.open });
      this.props.moveFilterBoxToTop(this.props.name);
    }
  }, {
    key: 'render',
    value: function render() {
      var filtered = Object.keys(this.props.valueFilter).length !== 0 ? 'pvtFilteredAttribute' : '';
      return _react2.default.createElement(
        'li',
        { 'data-id': this.props.name },
        _react2.default.createElement(
          'span',
          { className: 'pvtAttr ' + filtered },
          this.props.name,
          _react2.default.createElement(
            'span',
            {
              className: 'pvtTriangle',
              onClick: this.toggleFilterBox.bind(this)
            },
            ' ',
            '\u25BE'
          )
        ),
        this.state.open ? this.getFilterBox() : null
      );
    }
  }]);

  return DraggableAttribute;
}(_react2.default.Component);

DraggableAttribute.defaultProps = {
  valueFilter: {}
};

DraggableAttribute.propTypes = {
  name: _propTypes2.default.string.isRequired,
  addValuesToFilter: _propTypes2.default.func.isRequired,
  removeValuesFromFilter: _propTypes2.default.func.isRequired,
  attrValuesB: _propTypes2.default.object.isRequired,
  valueFilter: _propTypes2.default.objectOf(_propTypes2.default.bool),
  moveFilterBoxToTop: _propTypes2.default.func.isRequired,
  sorter: _propTypes2.default.func.isRequired,
  menuLimit: _propTypes2.default.number,
  zIndex: _propTypes2.default.number
};

var Dropdown = exports.Dropdown = function (_React$PureComponent) {
  _inherits(Dropdown, _React$PureComponent);

  function Dropdown() {
    _classCallCheck(this, Dropdown);

    return _possibleConstructorReturn(this, (Dropdown.__proto__ || Object.getPrototypeOf(Dropdown)).apply(this, arguments));
  }

  _createClass(Dropdown, [{
    key: 'render',
    value: function render() {
      var _this4 = this;

      return _react2.default.createElement(
        'div',
        { className: 'pvtDropdown', style: { zIndex: this.props.zIndex } },
        _react2.default.createElement(
          'div',
          {
            onClick: function onClick(e) {
              e.stopPropagation();
              _this4.props.toggle();
            },
            className: 'pvtDropdownValue pvtDropdownCurrent ' + (this.props.open ? 'pvtDropdownCurrentOpen' : ''),
            role: 'button'
          },
          _react2.default.createElement(
            'div',
            { className: 'pvtDropdownIcon' },
            this.props.open ? '×' : '▾'
          ),
          this.props.current || _react2.default.createElement(
            'span',
            null,
            '\xA0'
          )
        ),
        this.props.open && _react2.default.createElement(
          'div',
          { className: 'pvtDropdownMenu' },
          this.props.values.map(function (r) {
            return _react2.default.createElement(
              'div',
              {
                key: r,
                role: 'button',
                onClick: function onClick(e) {
                  e.stopPropagation();
                  if (_this4.props.current === r) {
                    _this4.props.toggle();
                  } else {
                    _this4.props.setValue(r);
                  }
                },
                className: 'pvtDropdownValue ' + (r === _this4.props.current ? 'pvtDropdownActiveValue' : '')
              },
              r.text
            );
          })
        )
      );
    }
  }]);

  return Dropdown;
}(_react2.default.PureComponent);

var PivotTableUI = function (_React$PureComponent2) {
  _inherits(PivotTableUI, _React$PureComponent2);

  function PivotTableUI(props) {
    var _this5$state;

    _classCallCheck(this, PivotTableUI);

    var _this5 = _possibleConstructorReturn(this, (PivotTableUI.__proto__ || Object.getPrototypeOf(PivotTableUI)).call(this, props));

    _this5.state = (_this5$state = {
      unusedOrder: [],
      zIndices: {},
      maxZIndex: 1000,
      openDropdown: false,
      attrValuesB: {}
    }, _defineProperty(_this5$state, 'attrValuesB', {}), _defineProperty(_this5$state, 'materializedInput', []), _defineProperty(_this5$state, 'materializedInputB', []), _this5$state);
    return _this5;
  }

  _createClass(PivotTableUI, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      if (Array.isArray(this.props.data)) {
        this.materializeInputB(this.props.data);
      } else {
        this.materializeInput(this.props.data);
      }
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      if (Array.isArray(this.props.data)) {
        this.materializeInputB(this.props.data);
      } else {
        this.materializeInput(this.props.data);
      }
    }
  }, {
    key: 'materializeInput',
    value: function materializeInput(nextdata) {
      if (this.state.data === nextdata.data) {
        return;
      }

      var newState = {
        data: nextdata.data,
        attrValuesB: {},
        materializedInputB: []
      };

      var recordsProcessed = 0;
      _Utilities.PivotData.forEachRecord(newState.data, this.props.derivedAttributes, function (record) {
        newState.materializedInputB.push(record);
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = Object.keys(record)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var attr = _step.value;

            if (!(attr in newState.attrValuesB)) {
              newState.attrValuesB[attr] = {};
              if (recordsProcessed > 0) {
                newState.attrValuesB[attr].null = recordsProcessed;
              }
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        for (var _attr in newState.attrValuesB) {
          var value = _attr in record ? record[_attr] : 'null';
          if (!(value in newState.attrValuesB[_attr])) {
            newState.attrValuesB[_attr][value] = 0;
          }
          newState.attrValuesB[_attr][value]++;
        }
        recordsProcessed++;
      });

      this.setState(newState);
    }
  }, {
    key: 'materializeInputB',
    value: function materializeInputB(nextdata) {
      if (this.state.data === nextdata) {
        return;
      }

      var newState = {
        data: nextdata,
        attrValuesB: {},
        materializedInputB: []
      };

      var recordsProcessed = 0;
      _Utilities.PivotData.forEachRecord(newState.data, this.props.derivedAttributes, function (record) {
        newState.materializedInputB.push(record);
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = Object.keys(record)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var attr = _step2.value;

            if (!(attr in newState.attrValuesB)) {
              newState.attrValuesB[attr] = {};
              if (recordsProcessed > 0) {
                newState.attrValuesB[attr].null = recordsProcessed;
              }
            }
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }

        for (var _attr2 in newState.attrValuesB) {
          var value = _attr2 in record ? record[_attr2] : 'null';
          if (!(value in newState.attrValuesB[_attr2])) {
            newState.attrValuesB[_attr2][value] = 0;
          }
          newState.attrValuesB[_attr2][value]++;
        }
        recordsProcessed++;
      });

      this.setState(newState);
    }
  }, {
    key: 'sendPropUpdate',
    value: function sendPropUpdate(command) {
      this.props.onChange((0, _immutabilityHelper2.default)(this.props, command));
    }
  }, {
    key: 'propUpdater',
    value: function propUpdater(key) {
      var _this6 = this;

      return function (value) {
        return _this6.sendPropUpdate(_defineProperty({}, key, { $set: value }));
      };
    }
  }, {
    key: 'setValuesInFilter',
    value: function setValuesInFilter(attribute, values, filterFieldName) {
      this.sendPropUpdate(_defineProperty({}, filterFieldName, _defineProperty({}, attribute, {
        $set: values.reduce(function (r, v) {
          r[v.text] = true;
          return r;
        }, {})
      })));
    }
  }, {
    key: 'addValuesToFilter',
    value: function addValuesToFilter(attribute, values, type) {
      var filterFieldName = type + 'ValueFilter';
      if (attribute in this.props[filterFieldName]) {
        this.sendPropUpdate(_defineProperty({}, filterFieldName, _defineProperty({}, attribute, values.reduce(function (r, v) {
          r[v.text] = { $set: true };
          return r;
        }, {}))));
      } else {
        this.setValuesInFilter(attribute, values, filterFieldName);
      }
    }
  }, {
    key: 'removeValuesFromFilter',
    value: function removeValuesFromFilter(attribute, values, type) {
      var filterFieldName = type + 'ValueFilter';
      var filterTexts = values.map(function (option) {
        return option.text;
      });
      this.sendPropUpdate(_defineProperty({}, filterFieldName, _defineProperty({}, attribute, { $unset: filterTexts })));
    }
  }, {
    key: 'moveFilterBoxToTop',
    value: function moveFilterBoxToTop(attribute) {
      this.setState((0, _immutabilityHelper2.default)(this.state, {
        maxZIndex: { $set: this.state.maxZIndex + 1 },
        zIndices: _defineProperty({}, attribute, { $set: this.state.maxZIndex + 1 })
      }));
    }
  }, {
    key: 'isOpen',
    value: function isOpen(dropdown) {
      return this.state.openDropdown === dropdown;
    }
  }, {
    key: 'makeDnDCell',
    value: function makeDnDCell(items, onChange, classes, type) {
      var _this7 = this;

      var filterType = type === 'stub' ? this.props.stubValueFilter : this.props.headerValueFilter;
      return _react2.default.createElement(
        _reactSortablejs2.default,
        {
          options: {
            group: 'shared',
            ghostClass: 'pvtPlaceholder',
            filter: '.pvtFilterBox',
            preventOnFilter: false
          },
          tag: 'td',
          className: classes,
          onChange: onChange
        },
        items.map(function (item, index) {
          return _react2.default.createElement(DraggableAttribute, {
            name: item,
            key: item,
            attrValuesB: _this7.state.data.find(function (record) {
              return Object.keys(record)[0] === item;
            }),
            valueFilter: filterType,
            sorter: (0, _Utilities.getSort)(_this7.props.sorters, index),
            menuLimit: _this7.props.menuLimit,
            setValuesInFilter: _this7.setValuesInFilter.bind(_this7),
            addValuesToFilter: _this7.addValuesToFilter.bind(_this7),
            moveFilterBoxToTop: _this7.moveFilterBoxToTop.bind(_this7),
            removeValuesFromFilter: _this7.removeValuesFromFilter.bind(_this7),
            type: type,
            zIndex: _this7.state.zIndices[item] || _this7.state.maxZIndex
          });
        })
      );
    }
  }, {
    key: 'render',
    value: function render() {
      var _this8 = this;

      var numValsAllowed = this.props.aggregators[this.props.aggregatorName]([])().numInputs || 0;

      var rendererName = this.props.rendererName in this.props.renderers ? this.props.rendererName : Object.keys(this.props.renderers)[0];

      var rendererCell = _react2.default.createElement(
        'td',
        { className: 'pvtRenderers' },
        _react2.default.createElement(Dropdown, {
          current: rendererName,
          values: Object.keys(this.props.renderers),
          open: this.isOpen('renderer'),
          zIndex: this.isOpen('renderer') ? this.state.maxZIndex + 1 : 1,
          toggle: function toggle() {
            return _this8.setState({
              openDropdown: _this8.isOpen('renderer') ? false : 'renderer'
            });
          },
          setValue: this.propUpdater('rendererName')
        })
      );

      var sortIcons = {
        key_a_to_z: {
          rowSymbol: '↕',
          colSymbol: '↔',
          next: 'value_a_to_z'
        },
        value_a_to_z: {
          rowSymbol: '↓',
          colSymbol: '→',
          next: 'value_z_to_a'
        },
        value_z_to_a: { rowSymbol: '↑', colSymbol: '←', next: 'key_a_to_z' }
      };

      var aggregatorCell = _react2.default.createElement(
        'td',
        { className: 'pvtVals' },
        _react2.default.createElement(Dropdown, {
          current: this.props.aggregatorName,
          values: Object.keys(this.props.aggregators),
          open: this.isOpen('aggregators'),
          zIndex: this.isOpen('aggregators') ? this.state.maxZIndex + 1 : 1,
          toggle: function toggle() {
            return _this8.setState({
              openDropdown: _this8.isOpen('aggregators') ? false : 'aggregators'
            });
          },
          setValue: this.propUpdater('aggregatorName')
        }),
        _react2.default.createElement(
          'a',
          {
            role: 'button',
            className: 'pvtstubOrder',
            onClick: function onClick() {
              return _this8.propUpdater('stubOrder')(sortIcons[_this8.props.stubOrder].next);
            }
          },
          sortIcons[this.props.stubOrder].rowSymbol
        ),
        _react2.default.createElement(
          'a',
          {
            role: 'button',
            className: 'pvtheaderOrder',
            onClick: function onClick() {
              return _this8.propUpdater('headerOrder')(sortIcons[_this8.props.headerOrder].next);
            }
          },
          sortIcons[this.props.headerOrder].colSymbol
        ),
        numValsAllowed > 0 && _react2.default.createElement('br', null),
        new Array(numValsAllowed).fill().map(function (n, i) {
          return [_react2.default.createElement(Dropdown, {
            key: i,
            current: _this8.props.vals[i],
            values: Object.keys(_this8.state.attrValuesB).filter(function (e) {
              return !_this8.props.hiddenAttributes.includes(e) && !_this8.props.hiddenFromAggregators.includes(e);
            }),
            open: _this8.isOpen('val' + i),
            zIndex: _this8.isOpen('val' + i) ? _this8.state.maxZIndex + 1 : 1,
            toggle: function toggle() {
              return _this8.setState({
                openDropdown: _this8.isOpen('val' + i) ? false : 'val' + i
              });
            },
            setValue: function setValue(value) {
              return _this8.sendPropUpdate({
                vals: { $splice: [[i, 1, value]] }
              });
            }
          }), i + 1 !== numValsAllowed ? _react2.default.createElement('br', { key: 'br' + i }) : null];
        })
      );

      var unusedAttrs = Object.keys(this.state.attrValuesB).filter(function (e) {
        return !_this8.props.headers.includes(e) && !_this8.props.hiddenAttributes.includes(e) && !_this8.props.hiddenFromDragDrop.includes(e) && e !== 'id';
      }).sort((0, _Utilities.sortAs)(this.state.unusedOrder));

      var unusedLength = unusedAttrs.reduce(function (r, e) {
        return r + e.length;
      }, 0);
      var horizUnused = unusedLength < this.props.unusedOrientationCutoff;

      var unusedAttrsCell = this.makeDnDCell(unusedAttrs, function (order) {
        return _this8.setState({ unusedOrder: order });
      }, 'pvtAxisContainer pvtUnused ' + (horizUnused ? 'pvtHorizList' : 'pvtVertList'), 'stub');

      var headerAttrs = this.props.headers.filter(function (e) {
        return !_this8.props.hiddenAttributes.includes(e) && !_this8.props.hiddenFromDragDrop.includes(e);
      });

      var headerAttrsCell = this.makeDnDCell(headerAttrs, this.propUpdater('headers'), 'pvtAxisContainer pvtHorizList pvtCols', 'header');

      var stubAttrs = this.props.stubs.filter(function (e) {
        return !_this8.props.hiddenAttributes.includes(e) && !_this8.props.hiddenFromDragDrop.includes(e);
      });
      var stubAttrsCell = this.makeDnDCell(stubAttrs, this.propUpdater('stubs'), 'pvtAxisContainer pvtVertList pvtRows', 'stub');

      var outputCell = _react2.default.createElement(
        'td',
        { className: 'pvtOutput' },
        _react2.default.createElement(_PivotTable2.default, _extends({}, (0, _immutabilityHelper2.default)(this.props, _defineProperty({
          data: { $set: this.state.materializedInput }
        }, 'data', { $set: this.state.materializedInputB })), {
          userResponses: this.props.userResponses
        }))
      );

      if (horizUnused) {
        return _react2.default.createElement(
          'table',
          { className: 'pvtUi' },
          _react2.default.createElement(
            'tbody',
            { onClick: function onClick() {
                return _this8.setState({ openDropdown: false });
              } },
            _react2.default.createElement(
              'tr',
              null,
              _react2.default.createElement('td', null),
              unusedAttrsCell
            ),
            _react2.default.createElement(
              'tr',
              null,
              _react2.default.createElement('td', null),
              headerAttrsCell
            ),
            _react2.default.createElement(
              'tr',
              null,
              stubAttrsCell,
              outputCell
            )
          )
        );
      }

      return _react2.default.createElement(
        'table',
        { className: 'pvtUi' },
        _react2.default.createElement(
          'tbody',
          { onClick: function onClick() {
              return _this8.setState({ openDropdown: false });
            } },
          _react2.default.createElement(
            'tr',
            null,
            _react2.default.createElement('td', null),
            headerAttrsCell
          ),
          _react2.default.createElement(
            'tr',
            null,
            unusedAttrsCell,
            stubAttrsCell,
            outputCell
          )
        )
      );
    }
  }]);

  return PivotTableUI;
}(_react2.default.PureComponent);

PivotTableUI.propTypes = Object.assign({}, _PivotTable2.default.propTypes, {
  onChange: _propTypes2.default.func.isRequired,
  hiddenAttributes: _propTypes2.default.arrayOf(_propTypes2.default.string),
  hiddenFromAggregators: _propTypes2.default.arrayOf(_propTypes2.default.string),
  hiddenFromDragDrop: _propTypes2.default.arrayOf(_propTypes2.default.string),
  unusedOrientationCutoff: _propTypes2.default.number,
  menuLimit: _propTypes2.default.number
});

PivotTableUI.defaultProps = Object.assign({}, _PivotTable2.default.defaultProps, {
  hiddenAttributes: [],
  hiddenFromAggregators: [],
  hiddenFromDragDrop: [],
  unusedOrientationCutoff: 85,
  menuLimit: 500
});

exports.default = PivotTableUI;
//# sourceMappingURL=PivotTableUI.js.map