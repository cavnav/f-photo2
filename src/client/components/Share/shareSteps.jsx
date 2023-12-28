import React, {useCallback} from 'react';
import { useMutedReducer } from '../../mutedReducer';
import { File } from '../File/File';
import { getVarName } from '../../functions';

const RECIPIENTS = [
	'Мамао',
	'Мама',
	'Любимая',
];


export function Recipients() {
    const [state, setState] = useMutedReducer({
        initialState: {
            recipients: "",
            selection: {},
        },
    });
    const onChangeSelection = useCallback(onThisChangeSelection({state, setState}), []);

    const eventHandlers = {
        onChangeSelection,
    };

    const onClickItem = (event) => {
        const eventHandler = event.target.getAttribute('handler');
        eventHandlers[eventHandler]?.(event);
    };
        

    return (
        <div 
            class="selector layout-items"
            onClick={onClickItem}
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
            <div>{state.recipients}</div>
        </div>
    );
}

function onThisChangeSelection(Comp) {
    return (event) => {
        const {state, setState} = Comp;

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
    }
}
