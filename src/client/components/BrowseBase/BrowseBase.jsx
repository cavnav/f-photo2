import React, {useEffect} from 'react';
import {getSelector, scrollToSelector} from '../../functions';
import {Empty} from '../Empty/Empty';
import { useMutedReducer } from '../../mutedReducer';

const LAST_ELEMENT = 'last-element';

export function BrowseBase(props) {
    const {
        refHandler,
        scrollTo,

        onClick,
    } = props;

    const isEmpty = Boolean(props.children) === false;

    const {state, setStateSilent} = useMutedReducer({
        initialState: {
            isScrolled: false,
        },
        setCompDeps,
    });


    useEffect(
		() => {	
            // i need wait while items will be rendered.           		 
			if (state.isScrolled === false) {
                let selector;

                if (!scrollTo) {
                    selector = getSelector({id: LAST_ELEMENT});
                } 
                else {
                    selector = scrollTo;
                }

                const isScrolled = scrollToSelector({selector});

                setStateSilent({
                    isScrolled,
                });			
            }
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
                style={{width: "100%"}} 
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
