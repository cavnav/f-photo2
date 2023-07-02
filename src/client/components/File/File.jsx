import React from 'react';

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
            event={onRequestFile}
        >
            {title}
            <input
                className="itemSelector positionAbs"
                type="checkbox"
                src={src}
                event={onSelectFile}
            />
        </div>
    );
}