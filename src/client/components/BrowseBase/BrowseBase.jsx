import React, {useEffect} from 'react';
import {scrollToSelector} from '../../functions';
import {Empty} from '../Empty/Empty';
import { LAST_ELEMENT } from '../../constants';

export function BrowseBase(props) {
    const {
        refHandler,
        scrollTo,
        isEmpty,

        onClick,
    } = props;    

    useEffect(
		() => {	            
            scrollToSelector({selector: scrollTo});
		},
        // i need wait while items will be rendered.           		 
	);

    return (
        <div
            ref={refHandler}
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
