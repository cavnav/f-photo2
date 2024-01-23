import React, { useState, useCallback, useReducer, useMemo } from 'react';

export function useMutedReducer({
	initialState = {},
	reducer,
	props, // props will inject to state.
	setCompDeps, // rename with less details.
	fn = () => { },	
}) {
	const [_, forceUpdate] = useReducer((x) => !x, false);
	const init = useMemo(
		() => {
			return reducer 
				? 	reducer({
						state: initialState,
						stateUpd: {},
					}) 
				: 	{
						// important! to create new state for every instance.
						...initialState
					};
		},
		[]
	);
	const [state] = useState(init);
	const [context] = useState({
		state, 		
		reducer,
		forceUpdate, 
		fn, 
	});
	const setStateWrap = useCallback(setState(context), []);
	const setStateSilentWrap = useCallback(setState(context, false), []);
	
	if (props) {
		React.useMemo(
			() => setStateSilentWrap(props),
			Object.values(props),
		);
	}

	setCompDeps && setCompDeps({
		deps: {
			initialState,
			state,
			setState: setStateWrap,
			setStateSilent: setStateSilentWrap,
		},
	});

	return {
		state, 
		setState: setStateWrap, 
		setStateSilent: setStateSilentWrap,
	};
}

function setState(context, isForceUpdate = true) {
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
		if (isForceUpdate) {
			context.forceUpdate();
		}
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