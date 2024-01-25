import React, {useEffect} from 'react';
import {scrollToSelector} from '../../functions';
import {Empty} from '../Empty/Empty';
import { useMutedReducer } from '../../mutedReducer';


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
			if (state.isScrolled === false) {
                const isScrolled = scrollToSelector({selector: scrollTo});

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
            {isEmpty && <Empty/>}
		</div>
    );
}

function setCompDeps({
    deps,
}) {
    return deps;
}
