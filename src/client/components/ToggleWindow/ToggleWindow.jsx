import React from 'react';
import {channel} from '../../channel';
import { useMutedReducer } from '../../mutedReducer';


export const ToggleWindow = channel.addComp({
    name: 'ToggleWindow',
    getResumeObj,    
    render,
    getComps,
});

function render() {
    const Comp = this;
    const rp = Comp.getReqProps();
    const {Label} = rp.comps;
    const {
        resumeObj,
        serverAPI,
    } = rp;

    const [state] = useMutedReducer({
        initialState: {
            browserCount: resumeObj.get(),
            title: 'Доп. окно',
        },
        setCompDeps: Comp.setCompDeps,
    });

    const onClick = async () => {            
        const toggle = {
            1: 2,
            2: 1,
        };

        const browserCountUpd = toggle[state.browserCount];
        const resumeState = resumeObj.state;
        if (browserCountUpd === 1) {
            if (window.name === 'rightWindow') {
                resumeObj.saveMerge({
                    val: {
                        browserCount: browserCountUpd,
                        leftWindow: resumeState.rightWindow,
                    },
                });   
            } else {
                resumeObj.saveMerge({
                    val: {
                        browserCount: browserCountUpd,
                    },
                });
            }
            await serverAPI.resetNavigation({
                curWindow: 'rightWindow',
            });
        } else {
            resumeObj.saveMerge({
                val: {
                    browserCount: browserCountUpd,
                },
            });   
        }
        
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
    return {
        toClone: {
            Label: channelComps.Label,
        },
    };
}

function getResumeObj() {
    return {
        selector: [
            "browserCount",
        ],
    };
}