import React, {useEffect} from 'react';
import {getSelector, scrollToSelector} from '../../functions';
import {Empty} from '../Empty/Empty';

const LAST_ELEMENT = 'last-element';

export function BrowseBase(props) {
    const {
        refHandler,
        scrollTo,
        isEmpty,

        onClick,
    } = props;    

    useEffect(
        () => {
            if (!scrollTo) {
                scrollToSelector({selector: getSelector({id: LAST_ELEMENT})});
            }

            return () => console.log("unmount");
        },
        []
    );



    useEffect(
		() => {	
            // i need wait while items will be rendered.           		 
            scrollToSelector({selector: scrollTo});
		},
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
