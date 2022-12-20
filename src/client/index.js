import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './App.jsx';


if (window.self !== window.top) {
    ReactDOM.render(<App.r />, document.getElementById("explorer"));
}