'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _Utilities = require('./Utilities');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function makeRenderer() {
  var TableRenderer = function (_React$Component) {
    _inherits(TableRenderer, _React$Component);

    function TableRenderer() {
      _classCallCheck(this, TableRenderer);

      return _possibleConstructorReturn(this, (TableRenderer.__proto__ || Object.getPrototypeOf(TableRenderer)).apply(this, arguments));
    }

    _createClass(TableRenderer, [{
      key: 'calculateCell',
      value: function calculateCell(stubEntry, stubId, headerEntry, headerAttr) {
        var userResponses = this.props.userResponses;

        var headerOptionId = headerEntry.id;

        headerEntry[headerAttr].forEach(function (entry) {
          entry.baseScore = 0;
          entry.stubScore = 0;

          if (!entry.stubScores) {
            entry.stubScores = {};
          }
        });

        userResponses.forEach(function (response) {
          headerEntry[headerAttr].forEach(function (entry) {
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

        var cells = headerEntry[headerAttr].map(function (entry) {
          var score = Math.round(entry.stubScore / entry.baseScore * 100);

          return _react2.default.createElement(
            'td',
            null,
            (score ? score : 0) + '%'
          );
        });

        return cells;
      }
    }, {
      key: 'calculateMissingValues',
      value: function calculateMissingValues(headerData, headerKeys, stubId) {
        var missingValues = headerKeys.flatMap(function (headerAttr) {
          var headerEntry = headerData.find(function (record) {
            return record[headerAttr] ? record : null;
          });

          return headerEntry[headerAttr].map(function (entry) {
            var missingRaw = entry.baseScore - entry.stubScores[headerAttr][stubId];
            var missingValue = Math.round(missingRaw / entry.baseScore * 100);

            return missingValue ? missingValue : 0;
          });
        });

        return missingValues;
      }
    }, {
      key: 'getHeaderBase',
      value: function getHeaderBase(headerEntry, headerId) {
        var userResponses = this.props.userResponses;

        var total = 0;

        userResponses.forEach(function (response) {
          if (response[headerId] === headerEntry.value) {
            total++;
          }
        });

        return total;
      }
    }, {
      key: 'render',
      value: function render() {
        var _this2 = this;

        var pivotData = new _Utilities.PivotData(this.props);

        var stubFilters = pivotData.props.stubValueFilter;
        var headerFilters = pivotData.props.headerValueFilter;

        var headerData = pivotData.props.data.map(function (dB) {
          var dCopy = Object.assign({}, dB);
          var key = Object.keys(dCopy)[0];
          var options = Object.values(dCopy)[0].filter(function (option) {
            for (var filterProp in headerFilters) {
              var filterValues = headerFilters[filterProp];
              if (filterValues[option.text]) {
                return false;
              }
            }
            return true;
          });

          dCopy[key] = options;
          return dCopy;
        });

        var stubData = pivotData.props.data.map(function (dB) {
          var dCopy = Object.assign({}, dB);
          var key = Object.keys(dCopy)[0];
          var options = Object.values(dCopy)[0].filter(function (option) {
            for (var filterProp in stubFilters) {
              var filterValues = stubFilters[filterProp];
              if (filterValues[option.text]) {
                return false;
              }
            }
            return true;
          });

          dCopy[key] = options;
          return dCopy;
        });

        var stubKeys = pivotData.props.stubs;
        var headerKeys = pivotData.props.headers;
        var currKey = '';

        return _react2.default.createElement(
          'table',
          { className: 'pvtTable' },
          _react2.default.createElement(
            'thead',
            null,
            _react2.default.createElement(
              'tr',
              null,
              _react2.default.createElement('td', { colSpan: '2' }),
              headerKeys.map(function (headerAttr) {
                var headerEntries = headerData.find(function (record) {
                  return record[headerAttr] ? record : null;
                })[headerAttr];
                return headerEntries.map(function (headerEntry, i) {
                  return _react2.default.createElement(
                    'th',
                    { className: 'pvtColLabel', key: 'headerKey' + i },
                    headerEntry.text
                  );
                });
              })
            ),
            _react2.default.createElement(
              'tr',
              null,
              _react2.default.createElement(
                'th',
                { colSpan: '2' },
                'Base'
              ),
              headerKeys.map(function (headerAttr) {
                var headerFullEntry = headerData.find(function (record) {
                  return record[headerAttr] ? record : null;
                });
                var headerOptions = headerFullEntry[headerAttr];

                return headerOptions.map(function (headerOption, i) {
                  return _react2.default.createElement(
                    'th',
                    { className: 'pvtColLabel', key: 'headerKey' + i },
                    _this2.getHeaderBase(headerOption, headerFullEntry.id)
                  );
                });
              })
            )
          ),
          _react2.default.createElement(
            'tbody',
            null,
            stubKeys.map(function (stubKey, i) {
              var stubEntry = stubData.find(function (record) {
                return record[stubKey] ? record : null;
              });

              return stubEntry[stubKey].map(function (stubOption, j) {
                var showStubLabel = true;

                if (i === 0) {
                  headerKeys.map(function (headerAttr) {
                    var headerOptions = headerData.find(function (record) {
                      return record[headerAttr] ? record : null;
                    });

                    if (headerOptions[headerAttr]) {
                      headerOptions[headerAttr].forEach(function (headerOption) {
                        if (headerOption.stubScores) {
                          var objs = Object.values(headerOption.stubScores[headerAttr]);

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

                var qLabelRowSpan = stubEntry[stubKey].length;

                return _react2.default.createElement(
                  _react2.default.Fragment,
                  null,
                  _react2.default.createElement(
                    'tr',
                    { key: 'stubKeyRow' + i },
                    showStubLabel && _react2.default.createElement(
                      'th',
                      {
                        key: 'stubKeyLabel2' + i + '-' + j,
                        rowSpan: qLabelRowSpan
                      },
                      stubKey
                    ),
                    _react2.default.createElement(
                      'th',
                      { key: 'stubKeyLabel' + i + '-' + j, className: 'pvtRowLabel' },
                      stubOption.text
                    ),
                    headerKeys.map(function (headerAttr) {
                      var headerEntry = headerData.find(function (record) {
                        return record[headerAttr] ? record : null;
                      });

                      return _this2.calculateCell(stubOption, stubEntry.id, headerEntry, headerAttr);
                    })
                  ),
                  [true].map(function (_) {
                    var missingValues = _this2.calculateMissingValues(headerData, headerKeys, stubEntry.id);
                    if (j === stubEntry[stubKey].length - 1 && missingValues.filter(function (value) {
                      return value > 0;
                    }).length > 0) {
                      return _react2.default.createElement(
                        'tr',
                        null,
                        _react2.default.createElement('td', null),
                        _react2.default.createElement(
                          'th',
                          { key: 'stubKeyLabel2' + i + '-' + j + '-' + j },
                          'Missing Values'
                        ),
                        missingValues.map(function (missingValue) {
                          return _react2.default.createElement(
                            'td',
                            null,
                            missingValue,
                            '%'
                          );
                        })
                      );
                    }

                    return null;
                  })
                );
              });
            })
          )
        );
      }
    }]);

    return TableRenderer;
  }(_react2.default.Component);

  TableRenderer.defaultProps = _Utilities.PivotData.defaultProps;
  TableRenderer.propTypes = _Utilities.PivotData.propTypes;
  TableRenderer.defaultProps.tableOptions = {};
  TableRenderer.propTypes.tableOptions = _propTypes2.default.object;
  return TableRenderer;
}

exports.default = {
  Table: makeRenderer()
};
module.exports = exports['default'];
//# sourceMappingURL=TableRenderers.js.map