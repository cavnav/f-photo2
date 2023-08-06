import React, { useEffect } from 'react';
import { useMutedReducer } from '../../../mutedReducer';


export const Copying = React.memo(function ({
	saveFilesToFlash,
	nextStepBtn,
}) {
	const [state, setState] = useMutedReducer({
		initialState,
	});

	useEffect(() => {
		saveFilesToFlash()
		.then(() => {
			setState({isCopyCompleted: true});
		});
	}, []);

	return (
		<div className="flexCenter flexDirColumn">
			{state.isCopyCompleted && (
				<>
					<div>Все файлы успешно скопированы</div>
					{nextStepBtn}
				</>
			)}
		</div>
	);
});

const initialState = {
	isCopyCompleted: false,
}
