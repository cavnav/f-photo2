import './styles.css';

import React, { useEffect, useRef, } from 'react';
import { channel } from '../../channel';
import { useMutedReducer } from '../../mutedReducer';
import classnames from 'classnames';

export const Dialog = channel.addComp({
	name: 'Dialog',
	render,
	getAPI,
	getReqProps,
});

function render(props) {
	const Comp = this;
	const ref = useRef();
	const timerIdRef = useRef();
	const [state, _, setStateSilent] = useMutedReducer({
		setCompDeps: Comp.setCompDeps,
		initialState,
		props,
	});

	const rp = this.getReqProps();

	const onMouseEnter = () => {
		if (!ref.current) return;
		clearTimeout(timerIdRef.current);
		ref.current?.classList.remove(`Dialog__hide`);			
	};
	const onMouseLeave = () => {
		if (!ref.current || state.isHide === false) return;
		clearTimeout(timerIdRef.current);
		//ref.current?.classList.add(`Dialog__hide`);
		timerIdRef.current = setTimeout(() => {
			Comp.getAPI().close();
		}, DELAY.ms);
	}

	const onClickClose = (event) => {
		Comp.getAPI().close({promiseResult: event.target.dataset.type});
	}

	setStateSilent({
		_ref: ref,
		_timerIdRef: timerIdRef,
	});

	useEffect(() => {		
		if (timerIdRef.current !== undefined) { // для случая render = null.
			Comp.getAPI().close();
		} else {			
			onMouseLeave();
		}
	});

	return !state.isShow ||
		timerIdRef.current !== undefined  // чтобы диалог скрывался при действиях вне диалога.
		? null 
		: (
		<div
			key={Number(new Date())}
			className={classnames({
				[`Dialog__modalWrap`]: true,
				[`Dialog__modal`]: state.isModal,
			})}
		>
			<div
				ref={ref}		
				className={classnames({
					[`DialogWrap`]: true,
					[`Dialog__error`]: state.type === `error`,
					[`Dialog__warning`]: state.type === `warning`,
					[`Dialog__notify`]: state.type === `notification`,
					[`Dialog__confirmation`]: state.type === `confirmation`,
				})}
				style={{
					left: rp.mouse.x,
					top: rp.mouse.y,
					transitionProperty: `opacity`,
					transitionDuration: `${DELAY.s}s`,
				}}
				onMouseEnter={onMouseEnter}
				onMouseLeave={onMouseLeave}
			>
				{state.message && <div>{state.message}</div>}
				{state.render && state.render}
				{props.children}
				{state.confirmBtn && (
					<div 
						className='btn'	
						data-type="resolve"
						onClick={onClickClose}				
					>
						{state.confirmBtn.title}
					</div>
				)}
				{state.rejectBtn && (
					<div 
						className='btn'	
						data-type="reject"
						onClick={onClickClose}				
					>
						{state.rejectBtn.title}
					</div>
				)}
			</div>
		</div>
	);
}

function getReqProps({
	channel,
}) {
	// может сделать привязку события в этом компоненте ?
	const props = channel.crop({
		s: {
			mouse: 1,
		},
	});

	return {
		mouse: {
			x: props.mouse.x + 10,
			y: props.mouse.y + 10,
		},
	};
}

function getAPI({
	deps,
}) {
	return {
		show,
		close,
		showNotification,
		showConfirmation,
		showChoiceConfirmation,
	};

	async function close({promiseResult} = {}) {
		/**
		 * очень жестоко было с этим местом.
		 * если здесь менять какое - то значение стейт, то новое окно будет с примененным стилем __hide без учета transition. 
		 * есть библиотека специальная ReactCSSTransitionGroup.
		 * display: none не работает.
		 */
		if (deps.state._ref.current) {
			deps.state._ref.current.parentElement.classList.remove(`Dialog__modal`);
			deps.state._ref.current.parentElement.classList.add(`Dialog__none`);
		}
		if (deps.state._timerIdRef.current) {
			clearTimeout(deps.state._timerIdRef.current);
			deps.state._timerIdRef.current = undefined;
		}
		deps.setState({
			isShow: false,			
		});
		
		deps.state.confirmationPromise?.[promiseResult]();
	}

	async function show(props) {
		if (deps.state._ref.current) {
			deps.state._ref.current.parentElement.classList.remove(`Dialog__none`);
		}

		let promiseResolve;
		let promiseReject;
		const promise = new Promise((resolve, reject) => {
			promiseResolve = resolve;
			promiseReject = reject;
		});

		deps.setState({
			...initialState,
			...props,
			isShow: true,
			confirmationPromise: {
				resolve: promiseResolve,
				reject: promiseReject,
			},
		});

		return promise;
	}

	async function showNotification({
		message,
	}) {
		show({
			type: 'notification',
			isModal: true,
			isHide: false,
			message,
		});
	}

	async function showConfirmation({
		message,
		confirmBtn,
		rejectBtn,
	}) {
		return show({
			type: 'confirmation',
			isModal: true,
			isHide: false,
			confirmBtn: confirmBtn ?? {
				title: 'Понятно',
			},
			rejectBtn,
			message,
		});
	}

	async function showChoiceConfirmation({
		message,
	}) {
		return showConfirmation({
			message, 
			confirmBtn: {
				title: 'Да'
			},
			rejectBtn: {
				title: 'Нет'
			},
		});
	}
}

const initialState = {
	isShow: false,
	type: undefined,
	message: '',
	render: null,
	isHide: true, // признак - исчезает ли спустя время
	isModal: true, // признак - модальный ли диалог
	conrirmBtn: undefined,
	rejectBtn: undefined,
	confirmationPromise: undefined,
};

const DELAY = {
	s: 5,
};
DELAY.ms = DELAY.s * 1000;
