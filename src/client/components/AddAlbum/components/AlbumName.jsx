import React from 'react';
import { useMutedReducer } from '../../../mutedReducer';
import "./AlbumName.css";

export function AlbumName(props) {
    const [state, setState] = useMutedReducer({
        initialState,
    });

    function onChangeAlbumName(e) {
        const albumName = e.target.value;
        setState({
            albumName,
        });
    }

    function onSubmit() {        
        props.onClose?.();
        props.onSubmit?.({
            albumName: state.albumName,
        });        
    }

    return state.isEnabled === false ? null : (
        <div className='albumNameBox'>
            Дай название
            <input 
                className='albumName'
                autoFocus
                type='text' 
                value={state.albumName}
                onChange={onChangeAlbumName}
            />
            <input type="button" value="OK" onClick={onSubmit} />
            <input className="close_btn" type="button" value="X" onClick={props?.onClose} />
        </div>            
    );
}

const initialState  = {
    albumName: '',
};