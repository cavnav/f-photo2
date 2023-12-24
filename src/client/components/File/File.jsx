import React from 'react';
import { ItemSelector } from '../ItemSelector/ItemSelector';

export function File({
    style,
    className,
    ind,
    src,
    onSelectFile,
    onRequestFile,
    title,
}) {
    return (
        <div
            key={src}
            className={className}
            style={style}
            ind={ind}
            src={src}
            handler={onRequestFile}
        >
            {title}
            {onSelectFile && <ItemSelector
                src={src}
                handler={onSelectFile}
            />}
        </div>
    );
}