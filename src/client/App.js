import React, { Component } from 'react';
import { ControlPanel, MyView } from './components';
import './app.css';

export default class App extends Component {
  state = {
    view: '',
    actions: {
      Tune: {
        title: 'Настроить',
        isActive: true
      },
      Copy: {
        title: 'Копировать',
        isActive: true
      }
    }
  };

  componentDidMount() {}

  changeState = ({ key, val }) => {
    this.setState({ [key]: val });
  };

  render() {
    const { view, actions } = this.state;
    return (
      <div className="f-photo flex flexDirColumn">
        <ControlPanel changeState={this.changeState} actions={actions} />
        <MyView target={view} changeState={this.changeState} />
      </div>
    );
  }
}
