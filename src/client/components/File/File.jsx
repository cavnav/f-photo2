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
            handler={onRequestFile}
        >
            {title}
            {onSelectFile && <input
                className="itemSelector positionAbs"
                type="checkbox"
                src={src}
                handler={onSelectFile}
            />}
        </div>
    );
}