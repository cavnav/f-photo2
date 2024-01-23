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

	const {state, setState} = useMutedReducer({
		initialState: {
			id: "",
			// ...statuses.
		},
		props,
		setCompDeps: Comp.setCompDeps,
	});

	React.useEffect(
		() => {
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
			

			setState(statusesUpd);
		},
		[props.id]
	);

	const statuses = getStatuses();

	return (statuses.length === 0) ? null : (
		<div className="PhotoStatusIcons">
			{statuses}
		</div>
	);


	// ----------------------------------
	function getStatuses() {
		const {
			id,
			...statuses
		} = state;

		return Object.entries(statuses).map(
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
		changeStatus: ({Comp}) => {
			const CompAPI = Comp.getAPI();
			const statusUpd = CompAPI.toggleStatus({
				src: deps.state.id,
			});

			deps.setState(statusUpd);
		},
	}
};


