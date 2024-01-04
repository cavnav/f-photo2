import React, {useCallback} from 'react';
import { useMutedReducer } from '../../../mutedReducer';
import { File } from '../../File/File';
import { getOnClickItem, getVarName } from '../../../functions';

import '../styles.css';


export function Recipients(props) {
    const [state, setState] = useMutedReducer({
        initialState: {
            items: {}, // list of recipients.            
            
            recipients: "", // result.
            selection: {}, // selection recipients.            
        },
        props,
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
            selection[itemId] = {
                ...props.items[itemId],
                caption: 'test',
            }
        }
        
        const recipients =  Object.values(selection);
    
        setState({
            selection,
            recipients: recipients.map((item) => item.name).join(', '),
        });  
        
        props?.onChange({
            recipients,
        });
    }
}
