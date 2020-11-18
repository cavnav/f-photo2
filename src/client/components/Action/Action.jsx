import React, { useState, useEffect } from 'react';
import { Actions } from '..';
import './styles.css';

export function Action({
  action,
  channel,
}) {  
  const Component = Actions[action];
  return (
    <div className="Action">
      <Component 
        {...channel.essentials(Component)} 
      />
    </div>
  );
}

Action.getReqProps = function ({ channel }) {
  return channel.crop({
    s: { 
      appState: { 
        action: 1, 
      } 
    },
  });
};