import './styles.css';
import React from 'react';
import { get as _get } from 'lodash';
import { channel } from '../../channel';
import cn from 'classnames';
import { useMutedReducer } from '../../mutedReducer';

export const ControlPanel = channel.addComp({
	name: 'ControlPanel',
	render,
	getComps,
});

function render() {
	const Comp = this;
	useMutedReducer({
		initialState: stateInit,
		setCompDeps: Comp.setCompDeps,
	});

	const {AppAPI} = Comp.getComps();

	return (
		<div
			className="controlPanel flex"
			onClick={onClickAction}
		>{
			AppAPI.state.actions
				.filter((action) => action.isEnabled !== false)
				.map((props) => {
					const classNames = cn({
						action: true,
						btn: true,
						active: props.id === AppAPI.state.action,
					});
					return (
						<div key={props.id} className={classNames} data-id={props.id}>
							{props.title}
						</div>
					);
				})
			}		
		</div>
	);

	// -----------------------------------------------------------------------
	function onClickAction(e) {
		const actionId = e.target.getAttribute('data-id');

		if (actionId !== null) {
			AppAPI.setState({
				action: actionId,
			});
		}
	};
}

function getComps({
	channelComps,
}) {
	const {
		App,
		Print,
		Notification,
	} = channelComps;
	return {
		items: {
			App,
			Print,
			Notification,
		},
	};
}

const stateInit = {
	isDialogPrint: false,
};