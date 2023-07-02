import React, {useMemo} from 'react';
import {channel} from '../../channel';
import {getBackgroundImageStyle} from '../../functions';
import { Dirs } from '../Dirs/Dirs';
import {File} from '../File/File';


export const BrowseBase = channel.addComp({
    name: 'BrowseBase',
    render,
});


function render(props) {
    const {
        browsePath,
        files,
        dirs,
        onChangeDir,
        onChangeSelections,
        onRequestFile,
    } = props;

    const eventHandlers = {
        onChangeDir,
        onChangeSelections,
        onRequestFile,
    };

    const Files = useMemo(() => {
        const className = 'positionRel fitPreview file scrollwait';
		
        return files.map((file, ind) => {
			const style = getBackgroundImageStyle({
				file: `${browsePath}${file}`,
			});

			return (
				<File
					key={file} 
					className={className}
					style={style}
					ind={ind}
					src={file}
					onSelectFile={onChangeSelections.name}
                    onRequestFile={onRequestFile.name}
				/>
			);
		});
    }, [browsePath, files]);

    const isEmpty = dirs.length === 0 && files.length === 0;

    const onClickItem = (event) => {
        const eventHandler = event.target.getAttribute('eventHandler');
        eventHandlers?.[eventHandler]?.(event);
    };

    return (
        <div
			className={`browse-base layout`}
			onClick={onClickItem}
		>
			<Dirs
				dirs={dirs}
				onChangeDir={onClickDir.name}
				onSelectDir={onSelectItem.name}
			/>
			<Files />
            {isEmpty && <Empty/>}
		</div>
    );
}

