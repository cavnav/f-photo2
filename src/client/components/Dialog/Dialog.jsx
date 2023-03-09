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
	const [state, setState] = useMutedReducer({
		setCompDeps: Comp.bindSetCompDeps(),
		initialState,
	});

	const rp = this.getReqProps();

	const onHover = (isHover) => {
		if (!ref.current || state.isHide === false) return;
		clearTimeout(timerIdRef.current);
		if (isHover) {
			ref.current?.classList.remove(`Dialog__hide`);			
		}
		else {
			ref.current?.classList.add(`Dialog__hide`);
			timerIdRef.current = setTimeout(() => {
				Comp.getAPI().close();
			}, DELAY.ms);
		}
		return () => clearTimeout(timerIdRef.current);
	};

	setState({
		_ref: ref,
		_timerIdRef: timerIdRef,
		forceUpdate: false,
	});

	useEffect(() => {		
		if (timerIdRef.current !== undefined) { // для случая render = null.
			clearTimeout(timerIdRef.current);
			timerIdRef.current = undefined;	
			Comp.getAPI().close();
		}
		return onHover(false);
	});


	return !state.isShow ||
		timerIdRef.current !== undefined  // чтобы диалог скрывался при действиях вне диалога.
		? null 
		: (
		<div
			className={classnames({
				[`Dialog__modalWrap`]: true,
				[`Dialog__modal`]: state.isModal,
			})}
		>
			<div
				ref={ref}
				key={Number(new Date())}
				className={classnames({
					[`DialogWrap`]: true,
					[`Dialog__error`]: state.type === `error`,
					[`Dialog__warning`]: state.type === `warning`,
					[`Dialog__notify`]: state.type === `notify`,
				})}
				style={{
					left: rp.mouse.x,
					top: rp.mouse.y,
					transitionProperty: `opacity`,
					transitionDuration: `${DELAY.s}s`,
				}}
				onMouseEnter={() => onHover(true)}
				onMouseLeave={() => onHover(false)}
			>
				{state.message && <div>{state.message}</div>}
				{state.render && state.render}
				{props.children}
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
	};

	function close() {
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
			deps.state._timerIdRef.current = undefined;
		}
		deps.setState({
			isShow: false,
			forceUpdate: false,
		});
	}

	function show(props) {
		if (deps.state._ref.current) {
			deps.state._ref.current.parentElement.classList.remove(`Dialog__none`);
		}
		deps.setState({
			...initialState,
			...props,
			isShow: true,
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
};

const DELAY = {
	s: 15,
};
DELAY.ms = DELAY.s * 1000;
