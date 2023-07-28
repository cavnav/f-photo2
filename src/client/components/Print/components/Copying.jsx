import React from 'react';
import { Select } from '../../Dialog/';
import { useMutedReducer } from '../../../mutedReducer';


export const Copying = React.memo(function ({
	saveFilesToFlash,
	nextStepBtn,
	onCopyCanceled = () => { },
}) {
	const [state, setState] = useMutedReducer({
		initialState: getStateInit(),
	});

	return (
		<div className="flexCenter flexDirColumn">
			{(state.isDialogEraseFlash) && (
				<Select
					type={Select.name}
					title='Внимание! Флешка будет очищена перед копированием. Продолжить ?'
					onAgree={onAgree}
					onCancel={onCopyCanceled}
				/>
			)}

			{state.isCopyCompleted && (
				<>
					<div>Все файлы успешно скопированы</div>
					{nextStepBtn}
				</>
			)}
		</div>
	);

	function onAgree() {
		setState({
			isDialogEraseFlash: false,
		});
		saveFilesToFlash()
		.then(() => {
			setState({
				isDialogEraseFlash: false,
				isCopyCompleted: true,
			});
		});
	}
});

function getStateInit() {
	return {
		isCopyCompleted: false,
		isDialogEraseFlash: true,
	};
}
