'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _Utilities = require('./Utilities');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/* eslint-disable react/prop-types */
var TableRenderer = function (_React$Component) {
  _inherits(TableRenderer, _React$Component);

  function TableRenderer(props) {
    _classCallCheck(this, TableRenderer);

    var _this = _possibleConstructorReturn(this, (TableRenderer.__proto__ || Object.getPrototypeOf(TableRenderer)).call(this, props));

    _this.state = {
      headersRows: []
    };
    return _this;
  }

  _createClass(TableRenderer, [{
    key: 'calculateCell',
    value: function calculateCell(stubEntry, stubId, headerEntry, headerAttr) {
      var _props = this.props,
          userResponses = _props.userResponses,
          settings = _props.settings;
      var showPercentage = settings.showPercentage;


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
        if (showPercentage) {
          var score = Math.round(entry.stubScore / entry.baseScore * 100);
          return _react2.default.createElement(
            'td',
            null,
            (score ? score : 0) + '%'
          );
        }

        return _react2.default.createElement(
          'td',
          null,
          entry.stubScore
        );
      });

      return cells;
    }
  }, {
    key: 'calculateMissingValues',
    value: function calculateMissingValues(headerData, headerKeys, stubId) {
      var settings = this.props.settings;
      var showPercentage = settings.showPercentage;


      var missingValues = headerKeys.flatMap(function (headerAttr) {
        var headerEntry = headerData.find(function (record) {
          return record[headerAttr] ? record : null;
        });

        return headerEntry[headerAttr].map(function (entry) {
          var missingRaw = entry.baseScore - entry.stubScores[headerAttr][stubId];

          if (showPercentage) {
            var missingValue = Math.round(missingRaw / entry.baseScore * 100);
            return missingValue ? missingValue : 0;
          }

          return missingRaw;
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
    key: 'calculateMultiLevelCell',
    value: function calculateMultiLevelCell(stubEntry, stubId, index, finalRowLength, sums) {
      var _props2 = this.props,
          userResponses = _props2.userResponses,
          settings = _props2.settings;
      var showPercentage = settings.showPercentage;

      var rows = [].concat(_toConsumableArray(this.state.headersRows));
      var selectedValues = [];

      rows.forEach(function (row) {
        var value = Math.ceil((index + 1) * row.length / finalRowLength) % row.optionsLength;

        selectedValues.push({
          title: row.title,
          questionId: row.questionId,
          value: value > 0 ? value : row.optionsLength
        });
      });

      var entry = {
        baseScore: 0,
        stubScore: 0,
        stubScores: {}
      };

      if (!sums[index]) {
        sums[index] = {
          base: 0,
          stub: 0
        };
      }

      if (sums[index].base > 0) {
        sums[index].base = 0;
      }
      userResponses.forEach(function (response) {
        if (!entry.stubScores[index]) {
          entry.stubScores[index] = {};
        }

        var checkedValues = selectedValues.filter(function (selectedValue) {
          return response[selectedValue.questionId] == selectedValue.value;
        });

        if (checkedValues.length === selectedValues.length) {
          entry.baseScore++;
          sums[index].base++;

          if (!entry.stubScores[index][stubId]) {
            entry.stubScores[index][stubId] = 0;
          }

          if (response[stubId] === stubEntry.value) {
            if (sums[index].stub >= 0) {
              sums[index].stub += 1;
            }

            entry.stubScore++;
          }
        }
      });

      if (showPercentage) {
        var score = Math.round(entry.stubScore / entry.baseScore * 100);
        return _react2.default.createElement(
          'td',
          null,
          (score ? score : 0) + '%'
        );
      }

      return _react2.default.createElement(
        'td',
        null,
        entry.stubScore
      );
    }
  }, {
    key: 'calculateMultiLevelMissingValue',
    value: function calculateMultiLevelMissingValue(finalRowLength, sums) {
      var settings = this.props.settings;
      var showPercentage = settings.showPercentage;


      var missingValues = [].concat(_toConsumableArray(Array(finalRowLength))).flatMap(function (_, index) {
        if (sums[index]) {
          var missingRaw = sums[index].base - sums[index].stub;

          if (showPercentage) {
            var missingValue = Math.round(missingRaw / sums[index].base * 100);
            return missingValue ? missingValue : 0;
          }

          return missingRaw;
        }
      });

      return missingValues ? missingValues : [];
    }
  }, {
    key: 'getMultiLevelHeaderBase',
    value: function getMultiLevelHeaderBase(index, finalRowLength) {
      var userResponses = this.props.userResponses;

      var rows = [].concat(_toConsumableArray(this.state.headersRows));
      var selectedValues = [];

      var total = 0;

      rows.forEach(function (row) {
        var value = Math.ceil((index + 1) * row.length / finalRowLength) % row.optionsLength;

        selectedValues.push({
          title: row.title,
          questionId: row.questionId,
          value: value > 0 ? value : row.optionsLength
        });
      });

      userResponses.forEach(function (response) {
        var checkedValues = selectedValues.filter(function (selectedValue) {
          return response[selectedValue.questionId] == selectedValue.value;
        });

        if (checkedValues.length === selectedValues.length) {
          total++;
        }
      });

      return total;
    }
  }, {
    key: 'updateSpans',
    value: function updateSpans() {
      var rows = [].concat(_toConsumableArray(this.state.headersRows));

      rows.forEach(function (row) {
        row.html = row.html.map(function (th) {
          var divider = rows.length > 1 ? rows[rows.length - 1].length : 1;

          return _react2.default.cloneElement(th, {
            colSpan: divider / row.length
          });
        });
      });

      this.setState({
        headersRows: rows
      });
    }
  }, {
    key: 'refreshHeaders',
    value: function refreshHeaders() {
      var _this2 = this;

      var rows = [];
      var headerKeys = this.props.headers;
      var headerData = this.props.data;
      var it = 0;

      // insert top row
      var currHeaderKey = headerKeys[it];
      var headerRecord = headerData.find(function (record) {
        return record[currHeaderKey] ? record : null;
      });
      var headerQuestionId = headerRecord.id;
      var headerOptions = headerRecord[currHeaderKey];

      rows.push({
        html: headerOptions.map(function (option) {
          return _react2.default.createElement(
            'th',
            null,
            option.text
          );
        }),
        length: headerOptions.length,
        optionsLength: headerOptions.length,
        title: currHeaderKey,
        questionId: headerQuestionId
      });

      var _loop = function _loop() {
        var nextOptionCells = [];

        var nextHeaderKey = headerKeys[it + 1];
        var nextHeaderRecord = headerData.find(function (record) {
          return record[nextHeaderKey] ? record : null;
        });
        var nextHeaderQuestionId = nextHeaderRecord.id;
        var nextHeaderOptions = nextHeaderRecord[nextHeaderKey];

        for (var j = 0; j < rows[it].length; j++) {
          nextHeaderOptions.forEach(function (nextOption) {
            nextOptionCells.push(_react2.default.createElement(
              'th',
              { colSpan: '1' },
              nextOption.text
            ));
          });
        }

        rows.push({
          html: nextOptionCells.map(function (o) {
            return o;
          }),
          length: nextOptionCells.length,
          optionsLength: nextHeaderOptions.length,
          title: nextHeaderKey,
          questionId: nextHeaderQuestionId
        });

        it++;
      };

      while (it < headerKeys.length - 1) {
        _loop();
      }

      this.setState({
        headersRows: rows
      }, function () {
        _this2.updateSpans();
      });
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps, prevState) {
      var _this3 = this;

      if (prevProps.data !== this.props.data || this.props.multiLevelMode !== prevProps.multiLevelMode && !this.props.multiLevelMode) {
        this.setState({
          headersRows: []
        });
      }

      if (prevProps.headers !== this.props.headers) {
        var it = 0;

        var rows = [].concat(_toConsumableArray(this.state.headersRows));
        var headerKeys = this.props.headers;
        var headerData = this.props.data;

        if (this.props.multiLevelMode && this.props.headers.length <= prevProps.headers.length && this.props.headers.length > 0) {
          this.refreshHeaders();
          return;
        }

        if (headerKeys.length === 1) {
          var currHeaderKey = headerKeys[it];
          var headerRecord = headerData.find(function (record) {
            return record[currHeaderKey] ? record : null;
          });
          var headerQuestionId = headerRecord.id;
          var headerOptions = headerRecord[currHeaderKey];

          rows.push({
            html: headerOptions.map(function (option) {
              return _react2.default.createElement(
                'th',
                null,
                option.text
              );
            }),
            length: headerOptions.length,
            optionsLength: headerOptions.length,
            title: currHeaderKey,
            questionId: headerQuestionId
          });
        } else {
          it = this.state.headersRows.length - 1;
        }

        var _loop2 = function _loop2() {
          var nextOptionCells = [];

          var nextHeaderKey = headerKeys[it + 1];
          var nextHeaderRecord = headerData.find(function (record) {
            return record[nextHeaderKey] ? record : null;
          });
          var nextHeaderQuestionId = nextHeaderRecord.id;
          var nextHeaderOptions = nextHeaderRecord[nextHeaderKey];
          if (_this3.state.headersRows[it]) {
            for (var j = 0; j < _this3.state.headersRows[it].length; j++) {
              nextHeaderOptions.forEach(function (nextOption) {
                nextOptionCells.push(_react2.default.createElement(
                  'th',
                  { colSpan: '1' },
                  nextOption.text
                ));
              });
            }

            rows.push({
              html: nextOptionCells.map(function (o) {
                return o;
              }),
              length: nextOptionCells.length,
              optionsLength: nextHeaderOptions.length,
              title: nextHeaderKey,
              questionId: nextHeaderQuestionId
            });
          }
          it++;
        };

        while (it < headerKeys.length - 1) {
          _loop2();
        }

        this.setState({
          headersRows: rows
        });
      }

      if (JSON.stringify(prevState.headersRows) !== JSON.stringify(this.state.headersRows) && this.props.headers.length > 1) {
        this.updateSpans();
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _this4 = this;

      var pivotData = new _Utilities.PivotData(this.props);

      var stubFilters = pivotData.props.stubValueFilter;
      var headerFilters = pivotData.props.headerValueFilter;

      var multiLevelMode = this.props.multiLevelMode;
      var multiFlatMode = !multiLevelMode;

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

      var headersRows = this.state.headersRows;

      var headerLastRowIndex = headersRows.length - 1;
      var headersSpanSize = headersRows.length > 0 ? headersRows[headerLastRowIndex].length : 1;

      var currKey = '';

      return _react2.default.createElement(
        'table',
        { className: 'pvtTable' },
        _react2.default.createElement(
          'thead',
          null,
          multiFlatMode && _react2.default.createElement(
            _react2.default.Fragment,
            null,
            _react2.default.createElement(
              'tr',
              null,
              _react2.default.createElement('td', { colSpan: '2' }),
              headerKeys.map(function (headerKey, i) {
                var headerEntries = headerData.find(function (record) {
                  return record[headerKey] ? record : null;
                })[headerKey];

                return _react2.default.createElement(
                  'th',
                  {
                    className: 'pvtColLabel',
                    key: 'headerKeyTitle' + i,
                    colSpan: headerEntries.length
                  },
                  headerKey
                );
              })
            ),
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
            )
          ),
          multiFlatMode && _react2.default.createElement(
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
                  _this4.getHeaderBase(headerOption, headerFullEntry.id)
                );
              });
            })
          )
        ),
        _react2.default.createElement(
          'tbody',
          null,
          multiLevelMode && _react2.default.createElement(
            _react2.default.Fragment,
            null,
            headersRows.map(function (row) {
              return _react2.default.createElement(
                'tr',
                null,
                _react2.default.createElement(
                  'th',
                  { colSpan: '2' },
                  row.title
                ),
                row.html
              );
            }),
            _react2.default.createElement(
              'tr',
              null,
              _react2.default.createElement(
                'th',
                { className: 'pvtRowLabel', colSpan: '2' },
                'Base'
              ),
              headersRows.length > 0 && [].concat(_toConsumableArray(Array(headersRows[headerLastRowIndex].length))).map(function (element, index) {
                return _react2.default.createElement(
                  'th',
                  {
                    className: 'pvtColLabel',
                    key: 'headerKey' + index,
                    colSpan: '1'
                  },
                  _this4.getMultiLevelHeaderBase(index, headersSpanSize)
                );
              })
            )
          ),
          stubKeys.map(function (stubKey, i) {
            var stubEntry = stubData.find(function (record) {
              return record[stubKey] ? record : null;
            });

            var sums = {};

            return stubEntry[stubKey].map(function (stubOption, j) {
              var showStubLabel = true;

              if (headerKeys.length > 0) if (j === 0) {
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
                  multiFlatMode && headerKeys.map(function (headerAttr) {
                    var headerEntry = headerData.find(function (record) {
                      return record[headerAttr] ? record : null;
                    });

                    return _this4.calculateCell(stubOption, stubEntry.id, headerEntry, headerAttr);
                  }),
                  multiLevelMode && headersRows.length > 0 && [].concat(_toConsumableArray(Array(headersRows[headerLastRowIndex].length))).map(function (_, index) {
                    return _this4.calculateMultiLevelCell(stubOption, stubEntry.id, index, headersSpanSize, sums);
                  })
                ),
                multiFlatMode && [true].map(function (_) {
                  var missingValues = _this4.calculateMissingValues(headerData, headerKeys, stubEntry.id);
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
                          _this4.props.settings.showPercentage && '%'
                        );
                      })
                    );
                  }

                  return null;
                }),
                multiLevelMode && [true].map(function (_) {
                  if (j === stubEntry[stubKey].length - 1) {
                    var missingValues = _this4.calculateMultiLevelMissingValue(headersSpanSize, sums);

                    if (missingValues.filter(function (value) {
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
                            _this4.props.settings.showPercentage && '%'
                          );
                        })
                      );
                    }
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

exports.default = TableRenderer;
module.exports = exports['default'];
//# sourceMappingURL=TableRenderers.js.map