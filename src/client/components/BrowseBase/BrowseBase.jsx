import React, {useEffect} from 'react';
import {getSelector, scrollToSelector} from '../../functions';
import {Empty} from '../Empty/Empty';

const LAST_ELEMENT = 'last-element';

export function BrowseBase(props) {
    const {
        refHandler,
        scrollTo,

        onClick,
    } = props;

    const isEmpty = Boolean(props.children) === false;

    useEffect(
		() => {	
            // i need wait while items will be rendered.           		 
			
                let selector;

                if (!scrollTo) {
                    selector = getSelector({id: LAST_ELEMENT});
                } 
                else {
                    selector = scrollTo;
                }

                scrollToSelector({selector});
		},
        [props.children, scrollTo]
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

function setCompDeps({
    deps,
}) {
    return deps;
}
