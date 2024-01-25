import React from 'react';
import {File} from './File';


export function FilesOne({
    files,
    onRequestFile,
}) {
    return files.length === 0 ? null : (
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
