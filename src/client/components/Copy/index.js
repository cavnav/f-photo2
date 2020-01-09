import React, { useState, useEffect } from 'react';
import { Progress } from 'antd';
import { serverApi } from '../../serverApi';

import './styles.css';

export function Copy({ props }) {
  const stateInit = {
    isCopied: false,
    progress: 0,
    countNewPhotos: 0,
  };

  const [state, setState] = useState(stateInit);

  serverApi({
    props: {
      url: 'getNewPhotos'
    }
  })
    .then(res => res.json())
    .then((res) => {
      setState({
        ...state,
        countNewPhotos: res.countNewPhotos,
      });
    });

  const onCopy = () => {
    !state.isCopied && serverApi({
      props: {
        url: 'copyPhotos',
        userDirName: 'The quick brown fox jumps over the lazy dog'
          .replace(' ', '')
          .slice(Math.random() * 15, Math.random() * 15) || 'one'
      }
    }).then((res) => {
      setState({
        ...state,
        isCopied: true,
      });
    });
  };

  return (
    <div className="copy">
      Количество новых фото:
      { state.countNewPhotos }
      <div onClick={onCopy}>Копировать</div>
      <Progress percent={state.progress} status="active" />
    </div>
  );
}
