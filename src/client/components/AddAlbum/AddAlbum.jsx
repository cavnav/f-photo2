import React, {useRef} from 'react';
import { channel } from '../../channel';
import { useMutedReducer } from '../../mutedReducer';

import './styles.css';

export const AddAlbum = channel.addComp({
  name: 'AddAlbum',
  render,
  getAPI,
  getComps,
});

function render() {
  const Comp = this;
  const title = `Добавить альбом`;

  const [state, setState] = useMutedReducer({
    setCompDeps: Comp.bindSetCompDeps(),
    initialState: stateInit,
  });

  const albumNameBox = useRef();

  const onChangeAlbumName = React.useCallback(changeAlbumName, []);
  const onInputAlbumNameClick = React.useCallback((e) => e.stopPropagation(), []);

  const NameBox = (      
    <div className='albumNameBox' ref={albumNameBox}>
      Дай название
      <input 
        className='albumName'
        autoFocus
        type='text' 
        value={state.albumName}
        onClick={onInputAlbumNameClick}
        onChange={onChangeAlbumName}
      />
    </div>            
  );

  return (
    <div 
      className='AddAlbum' 
      onClick={onClick}      
    >
        <div className='title'>{title}</div>
    </div>
  );

  // -----------------------------------------------------------------------
  function onClick() {
    const {
      DialogAPI,
    } = Comp.getComps();

    DialogAPI.show({
      render: NameBox,
      isHide: false,
    });

    return;
    state.onClick({
      albumName: state.albumName,
    });
    setState({
      albumName: '',
    });
  };

  function changeAlbumName(e) {
    const albumName = e.target.value;
    setState({
      albumName,
    });
  }
}

function getAPI({
  deps,
}) {
  return {
    forceUpdate: (props) => {
      deps.setState(props);
    },
  };
}

function getComps({
  channelComps,
}) {
  return {
    items: {
      Dialog: channelComps.Dialog,
    },
  };
}

const stateInit = {
  albumName: '',
  target: undefined,
  onClick: () => {},
};

