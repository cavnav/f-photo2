import React from 'react';

export function FileItem({
    style,
    className,
    ind,
    src,
    clickcb,
    clickItemCb,
    title,
}) {
    return (
        <div
            key={src}
            className={className}
            style={style}
            ind={ind}
            src={src}
            clickcb={clickcb}
        >
            {title}
            <input
                className="itemSelector positionAbs"
                type="checkbox"
                src={src}
                clickcb={clickItemCb}
            />
        </div>
    );
}