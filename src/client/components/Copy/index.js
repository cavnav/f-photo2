import React, { useState, useEffect } from 'react';
import { Progress } from 'antd';
import { serverApi } from '../../serverApi';

import './styles.css';

export function Copy({ props }) {
  const stateInit = {
    isCountGetted: false,
    copyProgress: 0,
    countNewPhotos: 0,
  };

  const [state, setState] = useState(stateInit);

  !state.isCountGetted && serverApi({
    props: {
      url: 'getNewPhotos'
    }
  })
    .then(res => res.json())
    .then((res) => {
      setState({
        ...state,
        countNewPhotos: res.countNewPhotos,
        isCountGetted: true,
      });
    });

  function onCopy() {
    serverApi({
      props: {
        url: 'copyPhotos',
        userDirName: 'The quick brown fox jumps over the lazy dog'
          .replace(' ', '')
          .slice(Math.random() * 15, Math.random() * 15) || 'one'
      }
    }).then((res) => {
      checkCopyProgress();
    });
  }

  function checkCopyProgress() {
    serverApi({
      props: {
        url: 'checkCopyProgress',
      }
    })
      .then(res => res.json())
      .then((res) => {
        setTimeout(() => (res.copyProgress === 100 ? null : checkCopyProgress()), 500);
        console.log(333, res.copyProgress);
        setState({
          ...state,
          copyProgress: res.copyProgress,
        });
      });
  }

  return (
    <div className="copy">
      Количество новых фото:
      { state.countNewPhotos }
      <div onClick={onCopy}>Копировать</div>
      <Progress percent={state.copyProgress} status="active" />
      <button onClick={() => console.log(Math.floor(Math.random() * 100))}>push me!</button>
    </div>
  );
}
