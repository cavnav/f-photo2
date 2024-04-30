import './styles.css';
import React from 'react';
import { channel } from '../../channel';
import { useMutedReducer } from '../../mutedReducer';



export const PhotoStatuses = channel.addComp({
	name: 'PhotoStatuses',
	render,
	getAPI,
	getComps,
	getReqProps,	
});


function render(
	props,
) {
	const Comp = this;

	useMutedReducer({
		initialState: {
			id: "",
		},
		props,
		setCompDeps: Comp.setCompDeps,
	});

	const statuses = getStatuses();

	return (statuses.length === 0) ? null : (
		<div className="PhotoStatusIcons">
			{statuses}
		</div>
	);


	// ----------------------------------
	function getStatuses() {		
		const statusesUpd = {};			
		const rp = Comp.getReqProps();

		rp.statusesAPI.forEach((statusAPI) => {
			const status = statusAPI.getStatus({
				src: props.id,
			});

			Object.assign(
				statusesUpd,
				status,
			);					
		});

		return Object.entries(statusesUpd).map(
				([status, value]) => {
					return value === false ? null : (
						<img key={status} src={`${status}.png`} />
					);
				}
			)
			.filter((status) => status);
	}
}

function getReqProps({
	comps,
}) {
	return {
		statusesAPI: [
			comps.PrintAPI, 
			comps.ShareAPI
		],
	};
}

function getComps({
	channelComps,
}) {
	const {
		Print,
		Share,
	} = channelComps;

	return {
		items: {
			Print,
			Share,
		},
	};
}

function getAPI({
	Comp,
}) {
	const deps = Comp.getDeps();	

	return {
		changeStatus: ({callback}) => {		
			deps.setState({});
				
			callback({
				src: deps.state.id,
			});
		},
	}
};


