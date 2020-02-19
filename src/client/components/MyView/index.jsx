import React, { useState, useEffect } from 'react';
import { Views } from '../index';

export function MyView({ props }) {  
  render() {
    const Target = Views[this.props.target] || Views.default;
    return <Target changeState={props.changeState} appState={props.appState} />;
  }
}
