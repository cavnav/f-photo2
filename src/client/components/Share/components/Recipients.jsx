import React, {useCallback} from 'react';
import { useMutedReducer } from '../../../mutedReducer';
import { File } from '../../File/File';
import { getOnClickItem, getVarName } from '../../../functions';

import '../styles.css';

const RECIPIENTS = [
	'Мамао',
	'Мама',
	'Любимая',
];


export function Recipients(props) {
    const [state, setState] = useMutedReducer({
        initialState: {
            recipients: "",
            selection: {},
        },
    });
    const onChangeSelection = useCallback(onThisChangeSelection({state, setState, props}), []);

    const eventHandlers = {
        onChangeSelection,
    };

    const onClickItem = getOnClickItem({eventHandlers});
        

    return (
        <div 
            class="selector"
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
                {RECIPIENTS.map((recepient, ind) => {
                    return <File
                        key={ind} 
                        className="positionRel fitPreview150"
                        title={recepient}
                        ident={ind} 
                        onSelectFile={getVarName({onChangeSelection})}
                    />;
                })}     
            </div>
        </div>
    );
}

function onThisChangeSelection({
    state,
    setState,

    props
}) {
    return (event) => {
        const selection = state.selection;
        const itemId = event.target.getAttribute("ident");

        if (selection.hasOwnProperty(itemId)) {
            delete selection[itemId];
        }
        else {
            selection[itemId] = RECIPIENTS[itemId];
        }
        
        const recipients =  Object.values(selection).join(','); 
    
        setState({
            selection,
            recipients,
        });  
        
        props?.onChange({
            items: selection,
        });
    }
}
