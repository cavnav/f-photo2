import React from 'react';
import { Select } from '../../Dialog/';
import { useMutedReducer } from '../../../mutedReducer';

const MAX_FILES_COUNT = 2;

export const Copying = React.memo(function ({
	filesToPrint,
	onCopyCompleted = () => { },
	onCopyCanceled = () => { },
	checkProgress,
	$saveFilesToFlash,
}) {
	const [state, setState] = useMutedReducer({
		initialState: getStateInit(),
	});

	React.useEffect(() => {
		if (state.isCopyCompleted === true) onCopyCompleted({
			destDir: state.destDir,
		});
	}, [state.isCopyCompleted]);

	return (
		<div className="flexCenter flexDirColumn">
			{(state.isDialogEraseFlash) && (
				<Select
					type={Select.name}
					title='Внимание! Флешка будет очищена перед копированием. Продолжить'
					onAgree={onAgree}
					onCancel={onCopyCanceled}
				/>
			)}

			{(state.isCopyCompleted) && <div>Все файлы успешно скопированы</div>}
		</div>
	);

	function onAgree() {
		setState({
			isDialogEraseFlash: false,
		});

		$saveFilesToFlash({
			files: filesToPrint,
			folderNameField: 'cnt',
			maxFilesCount: MAX_FILES_COUNT,
		})
			.then(({
				destDir,
			}) => {
				destDir && setState({
					destDir,
					forceUpdate: false,
				});
			})
			.then(() => {
				return checkProgress();
			})
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
		destDir: undefined,
		isCopyCompleted: false,
		isDialogEraseFlash: true,
	};
}