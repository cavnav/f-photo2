import React from 'react';
import { Select } from '../../Dialog/';
import { useMutedReducer } from '../../../mutedReducer';


export const Copying = React.memo(function ({
	isFilesExcess,
	saveFilesToFlash,
	nextStepBtn,
	onCopyCanceled = () => { },
}) {
	const [state, setState] = useMutedReducer({
		initialState,
	});

	return (
		<div className="flexCenter flexDirColumn">
			{(state.isDialogEraseFlash) && (
				<Select
					type={Select.name}
					title='Внимание! Флешка будет очищена перед копированием. Продолжить ?'
					onAgree={onAgreeErase}
					onCancel={onCopyCanceled}
				/>
			)}
			{state.isDialogFilesExcees && (
				<Select
					type={Select.name}
					title='Внимание! Нельзя записать все фотографии на флешку за один раз. Выбери конкретные фото, отметив галочкой.'
					agreeTitle='Вернуться и отметить фото'
					cancelTitle='Продолжить'
					onAgree={onCopyCanceled}					
					onCancel={onAgreeCopy}
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

	function onAgreeErase() {
		setState({
			isDialogEraseFlash: false,
			isDialogFilesExcees: isFilesExcess,
		});
		if (!isFilesExcess) {
			onAgreeCopy();
		}
	}

	function onAgreeCopy() {
		saveFilesToFlash()
		.then(() => {
			setState({isDialogFilesExcees: false, isCopyCompleted: true});
		});
	}
});

const initialState = {
	isDialogEraseFlash: true,
	isCopyCompleted: false,
	isDialogFilesExcees: false,
}
