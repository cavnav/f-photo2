import React from 'react';
import { Stepper } from '../';

import './styles.css';
import { channel } from '../../channel';
import { useMutedReducer } from '../../mutedReducer';
import { IS_DESKTOP } from '../../functions';

export const Copy = channel.addComp({
	name: 'Copy',
	render,
	getReqProps,
	getComps,
})

function render() {
	const Comp = this;
	const {state, setState} = useMutedReducer({
		initialState,
		setCompDeps: Comp.setCompDeps,
	});

	const steps = createSteps();

	return (
		<div className="Copy">
			{IS_DESKTOP 
			? 	<Stepper
					steps={steps}
				/> 
			: 	<div>
					<label htmlFor="files" className="btn">
						выбрать файлы
					</label>
					<input type="file" id="files" multiple onChange={(e) => onSelectFiles({e, Comp})}/>			
					количество файлов: {state.files.length}
					<div className="filesList">
						{state.files.map((file) => {
							const url = URL.createObjectURL(file.blob);
							return (
								<div className="file" key={url}>
									<img
										src={url}
										onLoad={() => URL.revokeObjectURL(file.blob)}
									/>
									<div>{file.name}</div>
									<div className='progressContainer'>
										<div className='progress'>{file.progress}%</div>
									</div>
								</div>
							);
						})}
					</div>
					<button onClick={onUpload}>загрузить файлы</button>			
				</div>
			}		
		</div>
	);

	// -------------------------------
	function createSteps() {
		return [
			{
				photoSrc: '001_getOutMemCard.jpg',
				desc: 'нажми пальцем на синюю карту памяти, и, вдавив внутрь, отпусти.',
			}, {
				photoSrc: '002_insertIntoCardReader.jpg',
				desc: 'Вставь карту памяти в ноутбук, как показано ниже:',
			}, {
				desc: 'Ищу карту памяти...',
				trigger: ({ setStepNum }) => {
					setTimeout(async () => {
						let stepNum = await $waitUSBconnectWrap() ? +2 : +1;

						setStepNum({
							val: stepNum,
						});
					}, 1000);
				},
				isNextBtn: false,
			}, {
				type: 'reject',
				desc: 'Что-то пошло не так... Попробуй еще раз',
				stepNumDelta: -2,
			},
			{
				toRender: getCopyingContent,
				trigger: $getNewPhotosWrap,
				isNextBtn: state.countNewPhotos > 0,
			},
			{
				toRender: () => {
					return (<>
						{state.isCopyCompleted && <div>Все фотографии успешно скопированы!</div>}
					</>);
				},
				trigger: $onCopyWrap,
				isNextBtn: state.isCopyCompleted,
			},
			{
				desc: 'Вытащи карту памяти из ноутбука',
			},
			{
				desc: 'Проверяю, что карта памяти извлечена...',
				trigger: ({ setStepNum }) => {
					setTimeout(async () => {
						let stepNum = await $waitUSBconnectWrap() ? +1 : +2;

						setStepNum({
							val: stepNum,
						});
					}, 1000);
				},
				isNextBtn: false,
			}, {
				type: 'reject',
				desc: 'Что-то пошло не так... Попробуй еще раз',
				stepNumDelta: -2,
			}, {
				trigger: () => {
					const {state} = Comp.getDeps();
					browsePath({Comp, path: state.destDir});
				}
			}
		];
	}

	function getCopyingContent({ key }) {
		return <div className="flex flexDirColumn" key={key}>
			Количество новых фото: {state.countNewPhotos}
			<div>* Внимание! После копирования карта памяти будет очищена.</div>
		</div>;
	}

	function $waitUSBconnectWrap() {
		const rp = Comp.getReqProps();
		return rp.server.$getUsbDevices()
			.then(res => res.driveLetter);
	}

	function $getNewPhotosWrap() {
		const rp = Comp.getReqProps();
		return rp.server.$getNewPhotos()
			.then((res) => {
				setState({
					countNewPhotos: res.countNewPhotos,
				});
			});
	}

	function $onCopyWrap() {
		const rp = Comp.getReqProps();
		return (
			rp.server.$copyPhotos({
				userDirName: '',
			})
			.then(({
				destDir,
			}) => {
				const {setStateSilent} = Comp.getDeps();
				
				setStateSilent({destDir});

				rp.server.checkProgress()
				.then(() => {
					setState({
						isCopyCompleted: true,
					});
				});
			})
		);
	}
}

function getReqProps({
	comps,
	channel,
}) {
	return {
		server: channel.server,
		Browse: comps.Browse,
		...comps,
	};
}

function getComps({
	channelComps,
}) {
	const {
		App,
		Browse,
		Notification,
	} = channelComps;

	return {
		items: {
			App,
			Browse,
			Notification,
		},
	};
}

function onSelectFiles({e, Comp}) {
	const selectedFiles = e.target.files;
	const files = [];
	for (const file of selectedFiles) {
		files.push({blob: file});
	}
	const {setState} = Comp.getDeps();

	setState({
		files,
	});
}

function onUpload({e, Comp}) {	
	const data = new FormData();

	for (const file of files) {
		data.append('files', file);
	}

	const rp = Comp.getReqProps();
	rp.server.upload({
		data,
	})
	.then((path) => {
		browsePath({Comp, path});
	});
}

function browsePath({Comp, path}) {
	const {AppAPI, Browse, BrowseAPI} = Comp.getReqProps();

	BrowseAPI.getForwardPath({path});

	AppAPI.setState({
		action: Browse.name,
	});
}

const initialState = {
	destDir: '',
	copyProgress: 0,
	countNewPhotos: 0,
	isHelp: false,
	isCopyCompleted: false,
	files: [],
};