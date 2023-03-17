import React, { useEffect } from 'react';
import { useMutedReducer } from '../../../mutedReducer';
import "./ChangeName.css";

export function ChangeName(props) {
    const [state, setState] = useMutedReducer({
        initialState,
        props,
    });

    function onChange(e) {
        const newName = e.target.value;
        setState({
            newName: e.target.value,
            error: newName === '' ? 'имя не задано' : undefined,
        });
    }

    function onSubmit() {     
        console.log("onSubmit")   
        props.onClose?.();
        props.onSubmit?.({
            name: state.name,
            newName: state.newName,
        });        
    }

    useEffect(() => {
        setState({
            newName: state.name,
        });
    }, []);

    return state.isEnabled === false ? null : (
        <div>
            Дай название
            <input 
                autoFocus
                type='text' 
                value={state.newName}
                onChange={onChange}
            />
            {!state.error && <input type="button" value="OK" onClick={onSubmit} />}
            <input className="close_btn" type="button" value="X" onClick={props?.onClose} />
            {state.error && <div className="rename-error">{state.error}</div>}
        </div>            
    );
}

const initialState  = {
    name: '',
    newName: '',
    error: undefined,
};