import React from 'react';
import {Empty} from '../Empty/Empty';
import { LAST_ELEMENT } from '../../constants';
import classNames from 'classnames';

export function BrowseBase(props) {
    const {
        isEmpty,
        className = 'layout',
        onClick,
    } = props;  

    return (
        <div
			className={classNames('browse-base', className)}
            onClick={onClick}
		>
			{props.children}

            <div 
                src={LAST_ELEMENT}  
                style={{
                    position: "relative",
                    width: "100%",
                    overflow: "hidden",
                }} 
            />

            {isEmpty && <Empty/>}
		</div>
    );
}
