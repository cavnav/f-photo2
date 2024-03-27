import React, {useRef, useEffect} from 'react';
import { ItemSelector } from '../../ItemSelector/ItemSelector';
import { getBackgroundImageStyle, getChannelComps, updateFiles} from '../../../functions';
import { useMutedReducer } from '../../../mutedReducer';

const KEY_ZERO = 48;
const KEY_NINE = 57;
const COUNT_MAX = 100;


export function PrintItemsRender({
    items,
    onChangeItems,
    onChangeSelectionsName,
    onRequiredItemName,
}) {
	const {state, setState} = useMutedReducer({
		initialState: getInitialState(),
        props: {
            items,
        },
	});

    const Comp = useRef({state, setState}).current;
    const onChangePhotoCountWrap = (event) => onChangePhotoCount({event, Comp, onChangeItems});
    const onCancelPrintWrap = (event) => onCancelPrint({event, Comp, onChangeItems});
    
    useEffect(() => keyDownListener({Comp}), []);

    return (
        <div className="PrintItems layout-items">
        {
            Object.entries(items).map(([src, { cnt }]) => {
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
                            handler={onRequiredItemName}
                        >
                            {onChangeSelectionsName && (
                                <ItemSelector 
                                    src={src}
                                    handler={onChangeSelectionsName}
                                />
                            )}
                        </div>
                        <div
                            className='controls btns'
                            photosrc={src}
                        >
                            <input
                                className="changePhotoCount"
                                keyid={key}
                                value={cnt}
                                onKeyUp={onChangePhotoCountWrap}
                            />
                            <div  
                                className="marginRight10" 
                                onClick={onCancelPrintWrap}
                            >
                                Отменить печать
                            </div>
                        </div>
                    </div>
                );
            })
        }
        </div>
    );
}

function keyDownListener({ Comp }) {
    const onKeyDownWrap = (event) => onKeyDown({ event, Comp });
    document.addEventListener('keydown', onKeyDownWrap);

    return () => {
        document.removeEventListener('keydown', onKeyDownWrap);
    };
}

function onKeyDown({ event, Comp }) {
    const input = document.activeElement;

    if (input === document.body) return;

    const photoSrc = input.getAttribute('keyid');

    if (photoSrc === null) return;

    let count = Number(input.value);

    const key = event.which;

    if (key >= KEY_ZERO && key <= KEY_NINE && count < COUNT_MAX) {
        const keyNumber = String.fromCharCode(key);

        if (key === KEY_ZERO) {
            count = keyNumber;
        }
        else {
            const countUpd = Number(`${count}${keyNumber}`);
            if (countUpd < COUNT_MAX) {
                count = countUpd;
            }
        }
    }

    const { state, setState } = Comp;

    setState({
        items: updateFiles.update({
            files: state.items,
            id: photoSrc,
            item: {
                cnt: count,
            },
        }),
    });
}

function onChangePhotoCount({ event, Comp, onChangeItems, }) {
    const input = event.target;

    const photoSrc = input.parentElement.getAttribute('photosrc');

    const { state, setState } = Comp;

    const items = updateFiles.update({
        files: state.items,
        id: photoSrc,
        item: {
            cnt: input.value,
        },
    });

    setState({
        items,
    });

    onChangeItems?.({items});
}

async function onCancelPrint({ event, Comp, onChangeItems }) {
    const photoSrc =  event.target.parentElement.getAttribute('photosrc');
    const {DialogAPI} = getChannelComps({
        callback: ({Dialog}) => ({items: {Dialog}})
    });
    const isResolve = await DialogAPI.showChoiceConfirmation({
        message: 'Убрать фото из этого списка ?',
    });

    if (isResolve === 'false') {
        return;
    }
    
    const { state, setState } = Comp;
    const items = delete state.items[photoSrc] && state.items;

    setState({
        items,
    });

    onChangeItems?.({items});
}

function getInitialState() {
    return {
        items: {},
    };
}



