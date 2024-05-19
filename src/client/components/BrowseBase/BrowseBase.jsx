import React from 'react';
import {Empty} from '../Empty/Empty';
import { LAST_ELEMENT } from '../../constants';

export function BrowseBase(props) {
    const {
        isEmpty,
        
        onClick,
    } = props;  

    return (
        <div
			className={`browse-base layout`}
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
