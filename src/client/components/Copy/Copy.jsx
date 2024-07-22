import React, {useEffect} from 'react';
import { BrowseBase, Stepper } from '../';

import './styles.css';
import { channel } from '../../channel';
import { useMutedReducer } from '../../mutedReducer';
import { IS_DESKTOP } from '../../functions';
import { BTN_SELECT_FILES, BTN_UPLOAD_FILES } from '../../common/additionalActions/const';

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

	useRederAddPanel({Comp});

	return (
		<div className="Copy">
			{IS_DESKTOP 
			? 	<Stepper
					steps={steps}
				/> 
			: 	<BrowseBase
					className="scroll"
				>															
					<div className="filesList">
						{state.files.map((file) => {
							const url = URL.createObjectURL(file);
							return (
								<div className="file" key={url}>
									<img
										src={url}
										onLoad={() => URL.revokeObjectURL(file)}
									/>
									<div>{file.name}</div>
									<div className='progressContainer'>
										<div className='progress'>{}%</div>
									</div>
								</div>
							);
						})}
					</div>
				</BrowseBase>
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
		Label,
		AdditionalPanel,
	} = channelComps;

	return {
		toClone:{
			UploadFiles: Label,
		},
		items: {
			App,
			Browse,
			Notification,
			AdditionalPanel,
		},
	};
}

function onSelectFiles({e, Comp}) {
	const selectedFiles = e.target.files;
	const files = [];
	for (const file of selectedFiles) {
		files.push(file);
	}
	const {setState} = Comp.getDeps();

	setState({
		files,
	});
}

async function onUpload({files, Comp}) {	
	const filesCount = files.length;
	let response = await batchUpload({files, index: 0, end: 1});
	const batchSize = response.batchSize;
	let uploadDir = response.uploadDir;
	let isUploadSuccess = true;

    for (let index = 1; index < filesCount; index += batchSize) {  	
		response = await batchUpload({uploadDir, files, index, end: index + batchSize});
		if (response.errors?.length) {
			isUploadSuccess = false;
		}

		console.log('loop batchUpload', index)
    }	

	if (isUploadSuccess) {
		await rp.server.uploadEnd();
		browsePath({Comp, path: uploadDir});
	};


	// ----------------------
	async function batchUpload({uploadDir, files, index, end}) {
		const data = new FormData();
	
		while (index < end) {
			data.append('files', files[index]);
			index++;
		}

		if (uploadDir) {
			data.append('uploadDir', uploadDir);
		}
	
		const rp = Comp.getReqProps();
		try {
			return await rp.server.upload({
				data,
				uploadDir
			});	
		}
		catch (error) {
			// ошибки уже обработаны в ServerAPI.fetchWithLoad.
			return error;
		}
	}
}

function browsePath({Comp, path}) {
	const {AppAPI, Browse, BrowseAPI} = Comp.getReqProps();

	BrowseAPI.getForwardPath({path});

	AppAPI.setState({
		action: Browse.name,
	});
}

function useRederAddPanel({Comp}) {	
	useEffect(() => {
		if (!IS_DESKTOP) {
			core();
		}

		function core() {
			const {state} = Comp.getDeps();
			const rp =  Comp.getReqProps();
			const actions = [
				SelectFiles({Comp}),
				rp.UploadFiles,
			];

			rp.AdditionalPanelAPI.renderIt({
				actions,
			})
			.then(() => {		
				if (state.files.length) {
					rp.UploadFilesAPI.forceUpdate({
						title: `${BTN_UPLOAD_FILES} - ${state.files.length}`,
						onClick: () => onUpload({files: state.files, Comp}),
					});
				}
			});

			return () => {
				rp.AdditionalPanelAPI.renderIt({actions: []});
			};
		}
	});	
}

function SelectFiles({Comp}) {
	return {
		name: SelectFiles.name,
		render: () => (
			<>
				<label htmlFor="files" className="btn">
					{BTN_SELECT_FILES}
				</label>
				<input type="file" id="files" multiple onChange={(e) => onSelectFiles({e, Comp})}/>			
			</>
		),
	}
}

const initialState = {
	destDir: '',
	copyProgress: 0,
	countNewPhotos: 0,
	isHelp: false,
	isCopyCompleted: false,
	files: [],
};