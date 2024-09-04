import React, {useEffect} from 'react';
import { BrowseBase, Stepper } from '../';

import styles from './styles.module.css';
import { channel } from '../../channel';
import { useMutedReducer } from '../../mutedReducer';
import { IS_DESKTOP } from '../../functions';
import { 
	BTN_BROWSE_UPLOADED, 
	BTN_SELECT_FILES, 
	BTN_UPLOAD_FILES 
} from '../../common/additionalActions/const';
import { File } from './File';

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

	useRenderAddPanel({Comp});

	const isUploadErrors = Object.keys(state.uploadErrors).length > 0;

	return (
		<div className={styles.Copy}>
			{IS_DESKTOP ?
			 	<Stepper
					steps={steps}
				/> 
			:	<>
				{isUploadErrors && <div className='error'>некоторые файлы не удалось загрузить:</div>}										
				<BrowseBase
					className="scroll"
				>					
					<div className={styles.filesList}>
						{state.files.map((file) => {
							const errors = state.uploadErrors[file.name]?.join('');
							return (
								<File key={file.name} 
									file={file} 
									errors={errors}
								/>
							);
						})}
					</div>
				</BrowseBase>
			</>}		
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
			BrowseUploaded: Label,
		},
		items: {
			App,
			Browse,
			Notification,
			AdditionalPanel,
		},
		custom: {
			SelectFiles,
		}
	};
}

function onSelectFiles({e, Comp}) {
	const {setState} = Comp.getDeps();

	setState({
		files: Array.from(e.target.files),
		isButtonBrowseUploaded: false,
		isButtonUpload: true,
		isUploadErrors: false,
	});
}

async function onUpload({files, Comp}) {		
	const uploadErrors = {};
	let batchSize;
	let batchFiles = [files[0]];
	let uploadDir;

    for (let index = 1; batchFiles.length > 0; index += batchSize) {  		
		const response = await batchUpload({files: batchFiles, uploadDir});

		batchSize = index === 1 ? 7 : response.batchSize ?? 1
		uploadDir = uploadDir ?? response.uploadDir;

		// if known errors.
		Object.assign(
			uploadErrors,
			response.errors
		)

		// if unknown errors.
		if (response.error) {
			Object.assign(
				uploadErrors,
				(response.files ?? batchFiles).reduce(
					(result, file) => {
						result[file.name] = []
						return result
					},
					{}
				)
			)
		}

		batchFiles = files.slice(index, index + batchSize);	
    }		

	const filesWithError = files.filter(({name}) => {
		return uploadErrors[name];
	});
	

	const {setState} = Comp.getDeps();

	if (filesWithError.length > 0) {
		setState({
			files: filesWithError, 
			uploadErrors, 
			isButtonUpload: false,
			uploadDir,
		});
		
		if (filesWithError.length < files.length) {
			setState({isButtonBrowseUploaded: true});
		}
	} 
	else {
		browsePath({Comp, path: uploadDir});
	}

	// ----------------------
	function batchUpload({files, uploadDir}) {
		const data = new FormData()

		for (const file of files) {
			data.append('files', file)
		}

		if (uploadDir) {
			data.append('uploadDir', uploadDir)
		}

		const rp = Comp.getReqProps()
		
		return  (
			rp.server.upload({
				data,
			}).catch((errors) => {
				return errors
			})
		)
	}
}

function browsePath({Comp, path}) {
	const {AppAPI, Browse, BrowseAPI} = Comp.getReqProps();

	BrowseAPI.setToResumeObj({val: {path}});

	AppAPI.setState({
		action: Browse.name,
	});
}

function useRenderAddPanel({Comp}) {	
	useEffect(() => {
		if (!IS_DESKTOP) {
			core();
		}

		function core() {
			const {state} = Comp.getDeps();
			const rp =  Comp.getReqProps();
			const actions = [
				rp.SelectFiles({Comp}),
				rp.UploadFiles,
				rp.BrowseUploaded,
			];

			rp.AdditionalPanelAPI.renderIt({
				actions,
			})
			.then(() => {		
				rp.UploadFilesAPI.forceUpdate({
					title: !(state.files.length && state.isButtonUpload) ? '' : `${BTN_UPLOAD_FILES} - ${state.files.length}`,
					onClick: () => {							
						onUpload({files: state.files, Comp});
					}
				});

				rp.BrowseUploadedAPI.forceUpdate({
					title: `${state.isButtonBrowseUploaded ? BTN_BROWSE_UPLOADED : ''}`,
					onClick: () => browsePath({Comp, path: state.uploadDir}),
				})
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
				<input type="file" id="files" className="hidden" multiple onChange={(e) => onSelectFiles({e, Comp})}/>			
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
	isButtonBrowseUploaded: false,
	isButtonUpload: false,
	files: [],
	uploadErrors: {},
	uploadDir: undefined,
};