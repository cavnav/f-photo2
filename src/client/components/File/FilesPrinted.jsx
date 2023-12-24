import React from 'react';
import {File} from './File';


export function FilesPrinted({
    files,
    onRequestFile,
}) {
    return (
        <>
        {
            files.map((file, ind) => (
                <File
                    key={file} 
                    title={file}
                    ind={ind}
                    src={file}
                    className="positionRel fitPreview file"
                    onRequestFile={onRequestFile}
                />
            ))
        }
        </>
    );
}
