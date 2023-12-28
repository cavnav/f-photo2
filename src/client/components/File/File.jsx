import React from 'react';
import { ItemSelector } from '../ItemSelector/ItemSelector';


// File rename to SelectionItem.
export function File({
    style,
    className,
    onSelectFile,
    onRequestFile,
    title,
    src,
    ident,
    ...attrs
}) {
    return (
        <div
            key={src}
            className={className}
            style={style}
            src={src}
            {...attrs}
            handler={onRequestFile}
        >
            {title}
            {onSelectFile && <ItemSelector
                src={src}
                ident={ident}
                handler={onSelectFile}
            />}
        </div>
    );
}