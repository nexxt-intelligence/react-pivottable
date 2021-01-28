import React from 'react';
import FadeIn from 'react-fade-in';

/* eslint-disable react/prop-types */
// eslint can't see inherited propTypes!

class QuestionDropdown extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      selections: [],
    };

    this.toggleSelection = this.toggleSelection.bind(this);
    this.toggleQuestionList = this.toggleQuestionList.bind(this);
  }

  toggleSelection(headerName) {
    const currentSelections = this.state.selections;

    const index = currentSelections.indexOf(headerName);

    if (index > -1) {
      currentSelections.splice(index, 1);
    } else {
      currentSelections.push(headerName);
    }

    this.setState({selections: currentSelections}, () => {
      this.props.updateHeaders(this.state.selections);
    });
  }

  getQuestionList() {
    const values = this.props.questions;

    return (
      <FadeIn className="question-dropdown-wrapper">
        <div
          className="question-dropdown"
          style={{
            cursor: 'initial',
          }}
        >
          <a onClick={() => this.setState({open: false})} className="pvtCloseX">
            ×
          </a>
          <h4>{this.props.name}</h4>

          {this.state.open && (
            <div className="pvtCheckContainer">
              {values.map(headerName => {
                return (
                  <div
                    key={headerName}
                    className={`pvtCheckWrapper ${this.state.selections.includes(
                      headerName
                    ) && 'selected'}`}
                    onClick={e => {
                      e.preventDefault();
                      this.toggleSelection(headerName);
                    }}
                  >
                    <label className="pvtCheckItem">
                      <input
                        type="checkbox"
                        defaultChecked={true}
                        checked={false}
                      />
                      {headerName}
                    </label>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </FadeIn>
    );
  }

  toggleQuestionList() {
    this.setState({open: !this.state.open});
  }

  render() {
    return (
      <React.Fragment>
        <div
          className="question-dropdown-btn"
          onClick={this.toggleQuestionList}
        >
          <span>{this.props.name}</span>
          <span className="pvtPlus"></span>
        </div>
        {this.state.open ? this.getQuestionList() : null}
      </React.Fragment>
    );
  }
}

export default QuestionDropdown;
