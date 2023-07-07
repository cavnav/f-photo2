import React from 'react';
import { getBackgroundImageStyle } from '../functions';


export function PrintItemsRender({
    items,
}) {
	const [state, setState] = useMutedReducer({
		initialState: getStateInit(),
		setCompDeps: Comp.bindSetCompDeps(),
		fn: ({
			stateUpd,
		}) => {
			resumeObj.save({
				val: {
					filesToPrint: stateUpd.filesToPrint,
				},
			});
		}
	});

    const onChangePhotoCount = (e) => {};
    const onClickCancelPhotoPrint = (e) => {};
    const addKeyDownListener = (e) => {};

    // React.useEffect(addKeyDownListener, []);
    // React.useEffect(setInputFocus);

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
                                onChange={onChangePhotoCount}
                            />
                            <input  
                                type="button" 
                                className="marginRight10" 
                                value="Отменить печать" 
                                onClick={onClickCancelPhotoPrint}
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
    const deps = Comp.getDeps();
    const { state } = deps;
    const input = document.querySelector(`input[keyid=\'${state.activeInput}\']`);
    input && input.focus();
}

function addKeyDownListenerCore({ Comp }) {
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

    const deps = Comp.getDeps();
    const { state, setState } = deps;

    setState({
        filesToPrint: updateFilesToPrint.update({
            filesToPrint: state.files,
            photoSrc,
            val: {
                cnt: getCntUpd(),
            },
        }),
    });
}

function onChangePhotoCountCore({ e, Comp }) {
    const input = e.target;

    // allowed only numbers.
    const numbers = /^[0-9]+$/;
    if (input.value.match(numbers) === null) {
        e.preventDefault();
        return;
    }

    const { photoSrc } = input.parentElement.getAttribute('photosrc');

    const deps = Comp.getDeps();
    const { setState } = deps;

    setState({
        filesToPrint: updateFilesToPrint.update({
            photoSrc,
            val: {
                cnt: input.value,
            },
            Comp,
        }),
        activeInput: photoSrc,
    });
}

function onClickCancelPhotoPrintCore({ e, Comp }) {
    const { photoSrc } =  e.target.parentElement.getAttribute('photosrc');
    const deps = Comp.getDeps();
    const { state, setState } = deps;
    setState({
        filesToPrint: delete state.filesToPrint[photoSrc] && state.filesToPrint,
        activeInput: undefined,
    });
}


