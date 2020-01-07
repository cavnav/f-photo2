import React from 'react';
import { Radio } from 'antd';

import './styles.css';

export class Tune extends React.Component {
  state = {
    driveLetters: [],
    driveLetterSelected: undefined
  };

  componentDidMount() {
    fetch('/api/getUsbDevices')
      .then(res => res.json())
      .then(list => this.setState({ driveLetters: list.driveLetters }));
  }

  onSelectFlashDrive = (e) => {
    const driveLetter = e.target.value;

    this.setState({
      driveLetterSelected: driveLetter
    });

    fetch('/api/saveSettings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify({
        driveLetter
      })
    });
  };

  render() {
    const { driveLetters, driveLetterSelected } = this.state;
    return (
      <div className="tune">
        <div>Запомнить флешку с фото.</div>
        <div>
          <div>Выбери из списка нужное устройство:</div>
          <Radio.Group
            onChange={this.onSelectFlashDrive}
            value={driveLetterSelected}
          >
            {driveLetters.map(letter => (
              <Radio key={letter} value={letter}>
                {letter}
              </Radio>
            ))}
          </Radio.Group>
        </div>
      </div>
    );
  }
}
