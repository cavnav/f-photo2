import React from 'react';
import {channel} from '../../channel';
import {getVarName} from '../../functions';
import {Empty} from '../Empty/Empty';


export const BrowseBase = channel.addComp({
    name: 'BrowseBase',
    render,
});


function render(props) {
    const {
        Files,
        Dirs,
        ...eventHandlers
    } = props;

    const isEmpty = Files === undefined && Dirs === undefined;

    const {
        onChangeDir,
        onChangeSelections,
        onRequestFile,
    } = eventHandlers;


    const onClickItem = (event) => {
        const eventHandler = event.target.getAttribute('handler');
        eventHandlers[eventHandler]?.(event);
    };

    return (
        <div
			className={`browse-base layout`}
			onClick={onClickItem}
		>
			{Dirs && <Dirs
                onChangeDir={getVarName({onChangeDir})}
                onSelectDir={getVarName({onChangeSelections})}
            />}
			{Files && <Files
                onSelectFile={getVarName({onChangeSelections})}
                onRequestFile={getVarName({onRequestFile})}
            />}
            {isEmpty && <Empty/>}
		</div>
    );
}

