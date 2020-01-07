import React, { Component } from 'react';
import './app.css';
import ReactImage from './react.png';
import { ControlPanel, View } from './components';

export default class App extends Component {
  state = {
    username: null,
    devices: '',
    view: ''
  };

  componentDidMount() {}

  changeState = ({ key, val }) => {
    this.setState({ [key]: val });
  };

  render() {
    const { username, devices, view } = this.state;
    return (
      <div className="f-photo flex flexDirColumn">
        <ControlPanel changeState={this.changeState} />
        <View target={view} changeState={this.changeState} />
      </div>
    );
  }
}
