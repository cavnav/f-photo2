import React from 'react';
import {channel} from '../../channel';
import { getOppositeWindow } from '../../functions';
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
            browserCount: resumeObj.get(),
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

        const resume = resumeObj.state;
        const browserCountUpd = toggle[state.browserCount];
        const oppositeWindowName = getOppositeWindow()?.name;

        // Чтобы сбросить путь с другой стороны и в следующий раз открывалось с начала.
        if (browserCountUpd === 1) {            
            resumeObj.saveMerge({
                val: {
                    browserCount: browserCountUpd,
                    rightWindow: undefined,
                    ...(window.name === "rightWindow" && { leftWindow: resume.rightWindow }),
                }
            })
        } else {
            resumeObj.saveMerge({
                val: {
                    browserCount: browserCountUpd,
                },
            });           
        } 
    
        oppositeWindowName && await server.resetNavigation({
            curWindow: oppositeWindowName,
        });
        
        window.top.location.reload();
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
