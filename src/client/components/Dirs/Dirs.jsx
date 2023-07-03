import React, {useMemo} from 'react';

export function Dirs({
	dirs,
	onChangeDir,
	onSelectDir,
}) {
	return useMemo(() => {
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
							handler={onChangeDir}
						>
							{dir.slice(1)}
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
	}, [dirs]);
}