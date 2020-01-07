import React from 'react';

import './styles.css';

export class ControlPanel extends React.Component {
  props = {
    changeState: null,
    ...this.props
  };

  onClick = (e) => {
    const actionId = e.target.getAttribute('data-id');
    this.props.changeState({
      key: 'view',
      val: actionId
    });
  };

  render() {
    return (
      <div className="ControlPanel flex" onClick={this.onClick}>
        <div className="action" data-id="Tune">
          Настроить
        </div>
        <div className="action" data-id="Copy">
          Копировать
        </div>
        <div className="action" data-id="View">
          Смотреть
        </div>
        <div className="action">Печатать</div>
        <div className="action">Отправить</div>
      </div>
    );
  }
}
