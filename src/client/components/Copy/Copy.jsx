import React from 'react';
import { Stepper } from '../';

import './styles.css';
import { channel } from '../../channel';
import { checkProgress } from '../../functions';
import { useMutedReducer } from '../../mutedReducer';

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

	return <div className="Copy">
		<Stepper
			steps={steps}
		/>
	</div>;

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
					const {AppAPI, Browse, BrowseAPI} = Comp.getReqProps();
					const {state} = Comp.getDeps();

					BrowseAPI.getForwardPath({path: state.destDir});

					AppAPI.setState({
						action: Browse.name,
					});
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

				return checkProgress({
					checkFunc: rp.server.checkProgress,
					notificationAPI: rp.NotificationAPI.forceUpdate,
				});
			})
			.then(() => {
				setState({
					isCopyCompleted: true,
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

const initialState = {
	destDir: '',
	copyProgress: 0,
	countNewPhotos: 0,
	isHelp: false,
	isCopyCompleted: false,
};