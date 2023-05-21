import React from 'react';
import { getBackgroundImageStyle } from '../functions';


export function PrintItemsRender({
    Comp,
}) {
    const deps = Comp.getDeps();
    const { state } = deps;
    const onChangePhotoCount = (e) => onChangePhotoCountCore({ e, Comp });
    const onClickCancelPhotoPrint = (e) => onClickCancelPhotoPrintCore({ e, Comp });
    const addKeyDownListener = (e) => addKeyDownListenerCore({e, Comp });

    React.useEffect(addKeyDownListener, []);
    React.useEffect(() => {
		const input = getActiveInput({ Comp });
		input && input.focus();
	});

    return (
        <div className="PrintItems">
        {
            Object.entries(state.filesToPrint).map(([src, { cnt }]) => {
                const key = src;

                return <div
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
                        <input  type="button" className="marginRight10" onClick={onClickCancelPhotoPrint}
                                value="Отменить печать" 
                        />
                    </div>
                </div>
            })
        }
        </div>
    );
}

function getActiveInput({ Comp }) {
    const deps = Comp.getDeps();
    const { state } = deps;
    document.querySelector(`input[keyid=\'${state.activeInput}\']`);
}

function addKeyDownListenerCore({ Comp }) {
    const onKeyDown = (e) => onKeyDownCore({ e, Comp });
    document.addEventListener('keydown', onKeyDown);

    return () => {
        document.removeEventListener('keydown', onKeyDown);
    };
}

function onKeyDownCore({ e, Comp }) {
    const input = document.activeElement;

    if (input === document.body) return;

    const photoSrc = input.getAttribute('keyid');

    if (photoSrc === null) return;

    const cntSource = Number(input.value);
    const getCntUpd = {
        38: () => (cntSource + 1),
        40: () => (cntSource > 0 ? cntSource - 1 : cntSource),
    }[e.which] ?? (() => cntSource);

    const deps = Comp.getDeps();
    const { setState } = deps;

    setState({
        filesToPrint: updateFilesToPrint.update({
            photoSrc,
            val: {
                cnt: getCntUpd(),
            },
            Comp,
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

const updateFilesToPrint = {
	update(props) {
		const filesToPrint = this.getFilesToPrint(props);
		filesToPrint[props.photoSrc] = {
			...filesToPrint[props.photoSrc],
			cnt: props.val.cnt,
		};
		return filesToPrint;
	},
	add(props) {
		const filesToPrint = this.getFilesToPrint(props);
		filesToPrint[props.photoSrc] = {
			cnt: props.val.cnt,
		};
		return filesToPrint;

	},
	delete(props) {
		const filesToPrint = this.getFilesToPrint(props);
		delete filesToPrint[props.photoSrc];
		return filesToPrint;
	},
	getFilesToPrint(props) {
		const { deps } = props.Comp;
		return props.filesToPrint || deps.state.filesToPrint;
	}
}

