import React from 'react';
import { useMutedReducer } from '../../../mutedReducer';

export function AlbumName({
    onSubmit,
}) {
    const [state, setState] = useMutedReducer({
        initialState,
    });

    function onChangeAlbumName(e) {
        const albumName = e.target.value;
        setState({
            albumName,
        });
    }

    function onSubmitName() {
        setState({
            isHide: true,
        });
        onSubmit?.({
            albumName: state.albumName,
        });
    }

    function onClose() {
        setState({
            isHide: true,
        });
    }

    return state.isHide ? null : (
        <div className='albumNameBox'>
            Дай название
            <input 
                className='albumName'
                autoFocus
                type='text' 
                value={state.albumName}
                onChange={onChangeAlbumName}
            />
            <input type="button" value="OK" onClick={onSubmitName} />
            <input type="button" value="X" onClick={onClose} />
        </div>            
    );
}

const initialState  = {
    albumName: '',
    isHide: false,
};