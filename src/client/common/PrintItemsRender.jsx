import React, {useRef} from 'react';
import { ItemSelector } from '../components/ItemSelector/ItemSelector';
import { updateFilesToPrint } from '../components/Print/PrintUtils';
import { getBackgroundImageStyle, getComps} from '../functions';
import { useMutedReducer } from '../mutedReducer';


export function PrintItemsRender({
    items,
    onChangeItems,
    onChangeSelectionsName,
}) {
	const [state, setState] = useMutedReducer({
		initialState: getInitialState(),
        props: {
            items,
        },
	});

    const Comp = useRef({state, setState}).current;
    const onChangePhotoCountWrap = (event) => onChangePhotoCount({event, Comp, onChangeItems});
    const onCancelPrintWrap = (event) => onCancelPrint({event, Comp, onChangeItems});
    
    React.useEffect(() => {
        keyDownListener({Comp});
    }, []);
    React.useEffect(() => {
        setInputFocus({Comp});
    });

    return (
        <div className="PrintItems">
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

function setInputFocus({Comp}) {
    const { state } = Comp;
    const input = document.querySelector(`input[keyid=\'${state.activeInput}\']`);
    input && input.focus();
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

    const cntSource = Number(input.value);
    const getCntUpd = {
        38: () => (cntSource + 1),
        40: () => (cntSource > 0 ? cntSource - 1 : cntSource),
    }[event.which] ?? (() => cntSource);

    const { state, setState } = Comp;

    setState({
        items: updateFilesToPrint.update({
            filesToPrint: state.items,
            photoSrc,
            cnt: getCntUpd(),
        }),
    });
}

function onChangePhotoCount({ event, Comp, onChangeItems, }) {
    const input = event.target;

    // allowed only numbers.
    const numbers = /^[0-9]+$/;
    if (input.value.match(numbers) === null) {
        event.preventDefault();
        return;
    }

    const photoSrc = input.parentElement.getAttribute('photosrc');

    const { state, setState } = Comp;

    const items = updateFilesToPrint.update({
        filesToPrint: state.items,
        photoSrc,
        cnt: input.value,
    });

    setState({
        items,
        activeInput: photoSrc,
    });

    onChangeItems?.({items});
}

async function onCancelPrint({ event, Comp, onChangeItems }) {
    const photoSrc =  event.target.parentElement.getAttribute('photosrc');
    const {DialogAPI} = getComps({
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
        activeInput: undefined,
    });

    onChangeItems?.({items});
}

function getInitialState() {
    return {
        activeInput: undefined,
        items: {},
    };
}



