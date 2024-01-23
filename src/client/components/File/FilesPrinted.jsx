import React from 'react';
import {File} from './File';


export function FilesPrinted({
    files,
    onRequestFile,
}) {
    return (
        files.map((file, ind) => (
            <File
                key={file} 
                className="positionRel fitPreview file"
                title={file}
                ind={ind}
                src={file}
                onRequestFile={onRequestFile}
            />
        ))
    );
}
