import React, { useState, useEffect } from 'react';
import { serverApi } from '../../serverApi';
import './styles.css';

export function Copy({ props }) {
  const [isCopied, setIsCopied] = useState(false);

  serverApi({
    props: {
      url: 'copyPhotos',
      userDirName: 'The quick brown fox jumps over the lazy dog'
        .replace(' ', '')
        .slice(Math.random() * 15, Math.random() * 15)
    }
  }).then((res) => {
    setIsCopied(true);
  });
  return null;
}
