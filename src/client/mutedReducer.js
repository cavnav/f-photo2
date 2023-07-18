import React, { useState, useCallback, useReducer } from 'react';

export function useMutedReducer({
	initialState = {},
	reducer,
	props, // props will inject to state.
	setCompDeps,
	fn = () => { },
	init = () => {
		return reducer ? reducer({
			state: initialState,
			updateState: {},
		}) : {
			...initialState,
		};
	},
}) {
	const [_, forceUpdate] = useReducer((x) => !x, false);
	const [state] = useState(init());
	const [dispatchContext] = useState({
		state, 		
		reducer,
		forceUpdate, 
		fn, 
	});
	const dispatchWrap = useCallback(dispatch(dispatchContext), []);

	props && React.useMemo(
		() => {
			const stateUpd = {
				...props,
				forceUpdate: false,
			};
			dispatchWrap(stateUpd);
		},
		Object.values(props),
	);

	setCompDeps && setCompDeps({
		deps: {
			initialState,
			state,
			setState: dispatchWrap,
		},
	});

	return [state, dispatchWrap, forceUpdate];
}

function dispatch(context) {
	return function (stateUpd) {
		updateState({
			state: context.state,
			stateUpd,
			reducer: context.reducer,
		});

		context.fn({
			state: context.state,
			stateUpd,
		});

		// console.log('zz', JSON.stringify(stateUpd));
		stateUpd.forceUpdate === undefined &&
			context.forceUpdate();
	}
}

function updateState({
	state,
	stateUpd,
	reducer,
}) {
	const stateReduced = reducer ?
		reducer({
			state,
			stateUpd
		}) :
		undefined;

	Object.assign(
		state,
		stateReduced || stateUpd,
	);
}