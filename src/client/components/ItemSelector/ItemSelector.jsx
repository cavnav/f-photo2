import React from 'react';

export function ItemSelector(
    atrs
) {
    return (
        <input
            className="itemSelector positionAbs"
            type="checkbox"
            {...atrs}
        />
    );
}