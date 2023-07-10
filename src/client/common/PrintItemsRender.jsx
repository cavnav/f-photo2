import React, {useRef} from 'react';
import { updateFilesToPrint } from '../components/Print/PrintUtils';
import { getBackgroundImageStyle } from '../functions';
import { useMutedReducer } from '../mutedReducer';


export function PrintItemsRender({
    items,
}) {
	const [state, setState] = useMutedReducer({
		initialState: getInitialState(),
        props: {
            items,
        },
	});

    const Comp = useRef({state, setState}).current;
    const onChangePhotoCountWrap = (event) => onChangePhotoCount({event, Comp});
    const onCancelPrintWrap = (event) => onCancelPrint({event, Comp});
    
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
                        </div>
                        <div
                            className='controls'
                            photosrc={src}
                        >
                            <input
                                className="changePhotoCount"
                                keyid={key}
                                value={cnt}
                                onChange={onChangePhotoCountWrap}
                            />
                            <input  
                                type="button" 
                                className="marginRight10" 
                                value="Отменить печать" 
                                onClick={onCancelPrintWrap}
                            />
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
            val: {
                cnt: getCntUpd(),
            },
        }),
    });
}

function onChangePhotoCount({ event, Comp }) {
    const input = e.target;

    // allowed only numbers.
    const numbers = /^[0-9]+$/;
    if (input.value.match(numbers) === null) {
        event.preventDefault();
        return;
    }

    const { photoSrc } = input.parentElement.getAttribute('photosrc');

    const { setState } = Comp;

    setState({
        items: updateFilesToPrint.update({
            photoSrc,
            val: {
                cnt: input.value,
            },
        }),
        activeInput: photoSrc,
    });
}

function onCancelPrint({ event, Comp }) {
    const photoSrc =  event.target.parentElement.getAttribute('photosrc');
    const { state, setState } = Comp;
    setState({
        items: delete state.items[photoSrc] && state.items,
        activeInput: undefined,
    });
}

function getInitialState() {
    return {
        activeInput: undefined,
        items: {},
    };
}

