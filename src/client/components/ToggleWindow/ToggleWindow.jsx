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

    const [state] = useMutedReducer({
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
            await server.resetNavigation({
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
