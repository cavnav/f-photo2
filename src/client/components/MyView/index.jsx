import React, { useState, useEffect } from 'react';

import './styles.css';

export function MyView({
  View,
}) {  
  return (
    <div className="MyView">
      <View 
        {...channel.essentials(View)} 
      />
    </div>
  );
}

MyView.getReqProps = ({ 
  s: { appState: { view: View } }
}) => ({
  View,
});