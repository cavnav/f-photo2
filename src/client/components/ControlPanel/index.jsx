import React from 'react';

import './styles.css';

export class ControlPanel extends React.Component {
  state = {
    changeState: null,
    ...this.props
  };

  onClick = e => {
    const actionId = e.target.getAttribute('data-id');
    this.state.changeState({
      key: 'view',
      val: actionId
    });
  };

  render() {
    const { actions } = this.state;
    return (
      <div className="ControlPanel flex" onClick={this.onClick}>
        {Object.entries(actions)
          .filter(([action, props]) => props.isActive)
          .map(([action, props]) => (
            <div key={action} className="action" data-id={action}>
              {props.title}
            </div>
          ))}
      </div>
    );
  }
}
