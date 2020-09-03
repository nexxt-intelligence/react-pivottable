import React from 'react';
import Draggable from 'react-draggable';
/* eslint-disable  */

const optionsMap = {
  showPercentage: 'Show Percentage',
  multiHeaderMode: 'Multi-Header Mode',
};

function OptionsList(props) {
  const menuItems = Object.entries(props.options);

  return (
    <Draggable handle=".pvtDragHandle">
      <div
        className="pvtFilterBox"
        style={{
          display: 'block',
          cursor: 'initial',
        }}
      >
        <a
          onClick={() => {
            props.closeList();
          }}
          className="pvtCloseX"
        >
          ×
        </a>
        <h4>Options</h4>

        <div className="pvtCheckContainer">
          {menuItems.map(item => {
            const itemLabel = item[0];
            const itemValue = item[1];
            return (
              <p
                key={itemLabel}
                onClick={() => {
                  props.toggleValue(itemLabel);
                }}
                className={itemValue ? 'selected' : ''}
              >
                {optionsMap[itemLabel]}
              </p>
            );
          })}
        </div>
      </div>
    </Draggable>
  );
}

class OptionsMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {open: false};
  }

  toggleOptionsList() {
    this.setState(prevState => ({
      open: !prevState.open,
    }));

    this.props.moveFilterBoxToTop('Options');
  }

  openOptionsList() {
    this.setState({open: true});
  }

  closeOptionsList() {
    this.setState({open: false});
  }

  render() {
    return (
      <li
        data-id={'options'}
        className="settings-conrol"
        onClick={() => {
          if (!this.state.open) this.setState({open: true});
        }}
      >
        <span className={'pvtAttr'}>
          Options
          <span className="pvtTriangle">▾</span>
        </span>

        {this.state.open ? (
          <OptionsList
            options={this.props.options}
            toggleValue={this.props.toggleValue}
            closeList={this.closeOptionsList.bind(this)}
          />
        ) : null}
      </li>
    );
  }
}

export default OptionsMenu;
