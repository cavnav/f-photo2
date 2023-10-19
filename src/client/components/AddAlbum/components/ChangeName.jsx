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
        let error;
        if (Boolean(newName.match("^[A-Za-zА-Яа-я0-9_-]*$")) === false) {
            error = 'название только из букв, цифр, "-" и "_"';
        }
        else if (newName === '') {
            error = 'имя не задано';
        }
        
        setState({
            newName: e.target.value,
            error,
        });
    }

    function onSubmit() {     
        state.onClose?.();
        state.onSubmit?.({
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
            <input className="close_btn" type="button" value="X" onClick={state?.onClose} />
            {state.error && <div className="rename-error">{state.error}</div>}
        </div>            
    );
}

const initialState  = {
    name: '',
    newName: '',
    error: true,
};