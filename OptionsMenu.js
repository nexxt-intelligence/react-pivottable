'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDraggable = require('react-draggable');

var _reactDraggable2 = _interopRequireDefault(_reactDraggable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/* eslint-disable  */

var optionsMap = {
  showPercentage: 'Show Percentage',
  multiLevelMode: 'Multi-Level Mode'
};

function OptionsList(props) {
  var menuItems = Object.entries(props.options);

  return _react2.default.createElement(
    _reactDraggable2.default,
    { handle: '.pvtDragHandle' },
    _react2.default.createElement(
      'div',
      {
        className: 'pvtFilterBox',
        style: {
          display: 'block',
          cursor: 'initial'
        }
      },
      _react2.default.createElement(
        'a',
        {
          onClick: function onClick() {
            props.closeList();
          },
          className: 'pvtCloseX'
        },
        '\xD7'
      ),
      _react2.default.createElement(
        'h4',
        null,
        'Options'
      ),
      _react2.default.createElement(
        'div',
        { className: 'pvtCheckContainer' },
        menuItems.map(function (item) {
          var itemLabel = item[0];
          var itemValue = item[1];
          return _react2.default.createElement(
            'p',
            {
              key: itemLabel,
              onClick: function onClick() {
                props.toggleValue(itemLabel);
              },
              className: itemValue ? 'selected' : ''
            },
            optionsMap[itemLabel]
          );
        })
      )
    )
  );
}

var OptionsMenu = function (_React$Component) {
  _inherits(OptionsMenu, _React$Component);

  function OptionsMenu(props) {
    _classCallCheck(this, OptionsMenu);

    var _this = _possibleConstructorReturn(this, (OptionsMenu.__proto__ || Object.getPrototypeOf(OptionsMenu)).call(this, props));

    _this.state = { open: false };
    return _this;
  }

  _createClass(OptionsMenu, [{
    key: 'toggleOptionsList',
    value: function toggleOptionsList() {
      this.setState(function (prevState) {
        return {
          open: !prevState.open
        };
      });

      this.props.moveFilterBoxToTop('Options');
    }
  }, {
    key: 'openOptionsList',
    value: function openOptionsList() {
      this.setState({ open: true });
    }
  }, {
    key: 'closeOptionsList',
    value: function closeOptionsList() {
      this.setState({ open: false });
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      return _react2.default.createElement(
        'li',
        {
          'data-id': 'options',
          className: 'settings-conrol',
          onClick: function onClick() {
            if (!_this2.state.open) _this2.setState({ open: true });
          }
        },
        _react2.default.createElement(
          'span',
          { className: 'pvtAttr' },
          'Options',
          _react2.default.createElement(
            'span',
            { className: 'pvtTriangle' },
            '\u25BE'
          )
        ),
        this.state.open ? _react2.default.createElement(OptionsList, {
          options: this.props.options,
          toggleValue: this.props.toggleValue,
          closeList: this.closeOptionsList.bind(this)
        }) : null
      );
    }
  }]);

  return OptionsMenu;
}(_react2.default.Component);

exports.default = OptionsMenu;
module.exports = exports['default'];
//# sourceMappingURL=OptionsMenu.js.map