import React, {useRef} from 'react';
import { ItemSelector } from '../../ItemSelector/ItemSelector';
import { useMutedReducer } from '../../../mutedReducer';
import { getBackgroundImageStyle } from '../../../functions';

export function ShareItems(props) {
    const [state, setState] = useMutedReducer({
		initialState: {},
        props,
	});

    const Comp = useRef({state, setState}).current;
    const onCancelShareWrap = (event) => onCancelShare({event, Comp, onChangeItems});

    return (
        <div className="ShareItems layout-items">
        {
            Object.entries(state.sources).map(([src]) => {
                const key = src;

                return (
                    <div
                        className="rowData"
                        key={key}
                    >
                        <div
                            className='fitPreview file'
                            style={getBackgroundImageStyle({
                                file: src,
                            })}
                            src={src}
                        >
                            <ItemSelector 
                                src={src}
                            />
                        </div>
                        <div
                            className='controls btns'
                            photosrc={src}
                        >                            
                            <div  
                                className="marginRight10" 
                            >
                                Отменить
                            </div>
                        </div>
                    </div>
                );
            })
        }
        </div>
    );
}