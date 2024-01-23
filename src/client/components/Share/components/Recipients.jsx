import React, {useRef} from 'react';
import { useMutedReducer } from '../../../mutedReducer';
import { File } from '../../File/File';
import {getVarName, useOnChangeSelections, useOnClickItem } from '../../../functions';

import '../styles.css';


export function Recipients(props) {
    // items,
    // selection,
    // onChange

    const {state, setState} = useMutedReducer({
        initialState: getInitialState(),
        props,
        reducer,
    });

    const Comp = useRef({state, setState}).current;

    const onChangeSelection = useOnChangeSelections({
        Comp,
        ident: 'ident',
        handler: onChangeSelection_,        
        deps: [],
    });

    const eventHandlers = {
        onChangeSelection,
    };

    const onClickItem = useOnClickItem({eventHandlers});
        

    return (
        <div 
            className="selector"
            onClick={onClickItem}
        >
            <div
                className="recipients-list"
            >
                кому: {state.recipients}
            </div>
            <div 
                className="recipients layout-items flexDirColumn"
            >
                {state.items.map(({name}, ind) => {
                    return <File
                        key={ind} 
                        className="positionRel fitPreview150"
                        title={name}
                        ident={ind} 
                        onSelectFile={getVarName({onChangeSelection})}
                    />;
                })}     
            </div>
        </div>
    );
}

function onChangeSelection_({
    Comp,
    ident,
}) {
    const {
        state,
        setState,
    } = Comp;

    const selection = state.selection;

    if (selection.hasOwnProperty(ident)) {
        delete selection[ident];
    }
    else {
        selection[ident] = state.items[ident];
    }
    
    setState({
        selection,
    });  
    
    state.onChange?.({
        recipients: selection,
    });
}

function reducer({
    state,
    stateUpd,
}) {
    const stateNew = {
        ...state,
        ...stateUpd,
    };

    if (stateUpd.hasOwnProperty('selection')) {

        stateNew.recipients = formatRecipients({items: stateNew.selection});        
    }
    
    return stateNew;
}

function formatRecipients({
    items,
}) {
    
    return Object.values(items).map((item) => item.name).join(', ');
}

function getInitialState(){
    return {
        items: {}, // list of all recipients.                    
        recipients: "", // result.
        selection: {}, // selection recipients.   
    };
}