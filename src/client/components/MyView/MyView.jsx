import React, { useState, useEffect } from 'react';
import { Views } from '../';
import './styles.css';

export function MyView({
  view,
  channel,
}) {  
  const View = Views[view];
  return (
    <div className="MyView">
      <View 
        {...channel.essentials(View)} 
      />
    </div>
  );
}

MyView.getReqProps = function ({ channel }) {
  return channel.crop({
    s: { 
      appState: { 
        view: 1, 
      } 
    },
  });
};