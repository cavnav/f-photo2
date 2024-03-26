import React from 'react';
import { BROWSE_ITEM_TYPES } from '../../constants';

export function Dirs({
	dirs,
	onChangeDir,
	onSelectDir,
}) {
	const dirClassNames = "positionRel fitPreview dir";
	const selectorClassNames = "itemSelector positionAbs";

	return (
		<>
			{dirs.map(dir => {
				return (
					<div
						className={dirClassNames}
						key={dir}
						src={dir}
						type={BROWSE_ITEM_TYPES.folder}
						handler={onChangeDir}
					>
						{dir}
						<input
							className={selectorClassNames}
							type="checkbox"
							src={dir}
							handler={onSelectDir}
						/>
					</div>
				);
			})}
		</>
	);
}