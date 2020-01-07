import React from 'react';
import { Views } from '../index';

export class View extends React.Component {
  props = {
    target: '',
    ...this.props
  };

  render() {
    const Target = Views[this.props.target] || Views.default;
    return <Target />;
  }
}
