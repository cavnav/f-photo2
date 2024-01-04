import './styles.css';

import React, { useEffect, useRef, } from 'react';
import { channel } from '../../channel';
import { useMutedReducer } from '../../mutedReducer';
import classnames from 'classnames';

export const DIALOG_TYPES = {
	confirmation: 'confirmation',
	error: 'error',
	warning: 'warning',
	notification: 'notification',
};

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

	const onClose = (event) => {
		const choice = event.target.dataset.isResolve;
		const onConfirm = choice === "true" ? state.confirmBtn?.onConfirm : undefined;
		Comp.getAPI().close({promiseResult: choice});
		onConfirm?.();
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

	const isRenderNull = !state.isShow
		|| timerIdRef.current !== undefined; // чтобы диалог скрывался при действиях вне диалога.

	return isRenderNull ? null : (
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
						data-is-resolve="true"
						onClick={onClose}				
					>
						{state.confirmBtn.title}
					</div>
				)}
				{state.rejectBtn && (
					<div 
						className='btn'	
						data-is-resolve="false"
						onClick={onClose}				
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
		update,
		show,
		close,
		showNotification,
		showConfirmation,
		showChoiceConfirmation,
	};

	function update(props) {
		// ошибку перекрыть может только ошибка.
		if (deps.state.type === DIALOG_TYPES.error && props.type !== undefined && props.type !== DIALOG_TYPES.error) {
			return;
		}
		deps.setState(props);
	}

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

		deps.state.confirmationResolver?.(promiseResult);
		
		deps.setState(initialState);				
	}

	async function show(props) {
		if (deps.state._ref.current) {
			deps.state._ref.current.parentElement.classList.remove(`Dialog__none`);
		}

		let promiseResolver;
		const promise = new Promise((resolve) => {
			promiseResolver = resolve;
		});

		update({
			...initialState,
			...props,
			isShow: true,
			confirmationResolver: promiseResolver,
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
		type,
		message,
		confirmBtn,
		rejectBtn,
	}) {
		return show({
			type: type ?? 'confirmation',
			isModal: true,
			isHide: false,
			confirmBtn: {
				title: 'понятно',
				...confirmBtn,
			},
			rejectBtn,
			message,
		});
	}

	async function showChoiceConfirmation({
		message,
		onConfirm,
	}) {
		return showConfirmation({
			message, 
			confirmBtn: {
				title: 'Да',
				onConfirm,
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
	confirmBtn: undefined,
	rejectBtn: undefined,
	confirmationResolver: undefined,
};

const DELAY = {
	s: 5,
};
DELAY.ms = DELAY.s * 1000;
