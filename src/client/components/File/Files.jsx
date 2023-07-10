import React from 'react';
import { getBackgroundImageStyle } from '../../functions';
import {File} from './File';


export function Files({
    browsePath,
    files,
    onSelectFile,
    onRequestFile,
}) {
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
                        onSelectFile={onSelectFile}
                        onRequestFile={onRequestFile}
                    />
                );
            })}
        </>
    );
}