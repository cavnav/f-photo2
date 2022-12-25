import React from 'react';
import {channel} from '../../channel';
import { useMutedReducer } from '../../mutedReducer';


export const ToggleWindow = channel.addComp({
    name: 'ToggleWindow',
    resumeObj: {
        selector: [
            "browserCount",
        ],
    },
    render,
    getComps,
});

function render() {
    const Comp = this;
    const {
        comps: {
            Label,
        },
        resumeObj,
    } = Comp.get({
        comps: 1,
        resumeObj: 1,
    });

    const [state, setState] = useMutedReducer({
        initialState: {
            browserCount: resumeObj.get(), // browserCount
            title: 'Доп. окно',
        },
        setCompDeps: Comp.bindSetCompDeps(),
    });

    const onClick = async () => {        
        const {
            deps: {
                state,
                setState,
            },
            resumeObj,
            server,
        } = Comp.get({
            deps: 1,
            resumeObj: 1,
            server: 1,
        });

        const toggle = {
            1: 2,
            2: 1,
        };

        const browserCountUpd = toggle[state.browserCount];
    
        // Чтобы сбросить путь с другой стороны и в следующий раз открывалось с начала.
        resumeObj.saveMerge({
            val: {
                browserCount: browserCountUpd,
                ...(window.oppositeWindow && {[window.oppositeWindow]: {} }),
            },
        });
        
        await server.resetNavigation({
            curWindow: window.oppositeWindow,
        });
    
        window.parent.location.reload();
    };

    return (
        <Label.r 
            title={state.title}
            onClick={onClick}
        />
    );
}

function getComps({
    channelComps,
}) {
    const {
        Label,
    } = channelComps;

    return {
        toClone: {
            Label,
        },
    };
}
