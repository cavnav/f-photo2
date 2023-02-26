import React from 'react';
import { useMutedReducer } from '../../../mutedReducer';
import "./ChangeName.css";

export function ChangeName(props) {
    const [state, setState] = useMutedReducer({
        initialState,
        props,
    });

    function onChange(e) {
        setState({
            name: e.target.value,
        });
    }

    function onSubmit() {        
        props.onClose?.();
        props.onSubmit?.({
            name: state.name,
        });        
    }

    return state.isEnabled === false ? null : (
        <div>
            Дай название
            <input 
                autoFocus
                type='text' 
                value={state.name}
                onChange={onChange}
            />
            <input type="button" value="OK" onClick={onSubmit} />
            <input className="close_btn" type="button" value="X" onClick={props?.onClose} />
        </div>            
    );
}

const initialState  = {
    name: '',
};