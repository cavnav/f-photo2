import React, {useMemo} from 'react';
import {channel} from '../../channel';
import {getBackgroundImageStyle, getVarName} from '../../functions';
import { Dirs } from '../Dirs/Dirs';
import {File} from '../File/File';
import {Empty} from '../Empty/Empty';


export const BrowseBase = channel.addComp({
    name: 'BrowseBase',
    render,
});


function render(props) {
    const {
        browsePath,
        files,
        dirs,

        ...eventHandlers
    } = props;

    const {
        onChangeDir,
        onChangeSelections,
        onRequestFile,
    } = eventHandlers;

    const isEmpty = dirs.length === 0 && files.length === 0;

    const Files = useMemo(() => {
        const className = 'positionRel fitPreview file scrollwait';
		
        return (
            <>
                {files.map((file, ind) => {
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
                            onSelectFile={getVarName({onChangeSelections})}
                            onRequestFile={getVarName({onRequestFile})}
                        />
                    );
                })}
            </>
		);
    }, [browsePath, files]);

    const onClickItem = (event) => {
        const eventHandler = event.target.getAttribute('handler');
        eventHandlers[eventHandler]?.(event);
    };

    return (
        <div
			className={`browse-base layout`}
			onClick={onClickItem}
		>
			<Dirs
				dirs={dirs}
				onChangeDir={getVarName({onChangeDir})}
				onSelectDir={getVarName({onChangeSelections})}
			/>
			{Files}
            {isEmpty && <Empty/>}
		</div>
    );
}

