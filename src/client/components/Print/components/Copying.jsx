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
					title='Для печати выбрано большое количество фото, так что нельзя записать все файлы на флешку за один раз. 
						Если в этот раз требуются конкретные фото, отметь их галочкой или нажми продолжить, чтобы записать произвольную часть фотографий.'
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
