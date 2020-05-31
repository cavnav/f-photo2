import React, { useState, useEffect } from 'react';

import './styles.css';

export function MyView({
  View,
  channel,
}) {  
  return (
    <div className="MyView">
      <View 
        {...channel.essentials(View)} 
      />
    </div>
  );
}

MyView.getReqProps = function (channel) {
  return channel.crop({
    path: {
      s: { appState: { view: 'View' } },
    }
  });
};