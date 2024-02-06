import React, { useEffect } from 'react';
import { ChannelComp, channel } from "../../channel";
import { getSelector, getVarName, useOnChangeSelections, useOnClickItem } from '../../functions';
import { useMutedReducer } from '../../mutedReducer';
import { FilesOne } from '../File/FilesOne';
import { BrowseBase } from '../BrowseBase/BrowseBase';

export const Shared = channel.addComp({
    name: 'SharedComp',
    getComps,
    render,
});

const BrowseWrap = new ChannelComp({
    name: 'BrowseWrap',
    render: browseWrapRender,
});

function render() {
    const Comp = this;

    const {
        state,
        setState,
    } = useMutedReducer({
        initialState: getInitialState({Comp}),  
        setCompDeps: Comp.setCompDeps,
        fn: onChangeState({Comp}),
    });    

    const comps = Comp.getComps();
    const SharedRender = comps.Shared.r;

    const onCloseShared = () => {
        setState({
            activeComp: BrowseWrap.name,
            sharedItems: {},
            recipients: [],
            shared: '',
        });
    };     

    useEffectGetSharedItems({
        Comp,
        deps: [],
    });

    return (
        <>
            {state.activeComp === BrowseWrap.name && (
                <BrowseWrap.r 
                    MainComp={Comp}
                    files={state.files}
                    scrollTo={state.scrollTo}
                />
            )}
            {state.activeComp === comps.Shared.name && (
                <SharedRender            
                    files={state.sharedItems}
                    recipients={state.recipients}
                    shared={state.shared}    
                    onClose={onCloseShared}
                />
            )}            
        </>        
    );
}


function browseWrapRender({
    MainComp,
    files,
    scrollTo,
}){
    const onRequestFile = useOnChangeSelections({
        Comp: MainComp,
        deps: [],
        handler: onRequestFileHandler,
    });

    const eventHandlers = {
        onRequestFile,
    };

    const onClickItem = useOnClickItem({
        eventHandlers,
    });

    useEffectGetShared({
        Comp: MainComp,
        deps: []
    });


    return (
        <BrowseBase
            scrollTo={scrollTo}
            onClick={onClickItem}
        >
            <FilesOne
                files={files}
                onRequestFile={getVarName({onRequestFile})}
            />
        </BrowseBase>
    );
}

function getComps({
    channelComps
}) {
    const {
        Share,
    } = channelComps;

    return {
        toClone: {
            Shared: Share,
        },
    };
}

function onRequestFileHandler({
    Comp,
    ident:src
}) {
    const {
        serverAPI,
        comps,
        deps,
    } = Comp.getReqProps();

    serverAPI.towardSharedItems({
        dir: src,
    })
    .then(
        (response) => {                       
            const {
                recipients,
                files,
            } = response;

            let filesUpd = {};
            files.forEach((file) => {
                filesUpd[file] = {};
            });

            let recipientsUpd = {};
            recipients.forEach(
                (item, ind) => {
                    recipientsUpd[ind] = item;
                }
            );

            deps.setState({
                activeComp: comps.Shared.name,
                sharedItems: filesUpd,
                recipients: recipientsUpd,
                shared: src,       
                scrollTo: getSelector({id: src}),                
            });
        }
    );    
}

function useEffectGetShared({
    Comp,
    deps,
}) {
    useEffect(
        () => {
            const {
                serverAPI,
                deps: compDeps,
            } = Comp.getReqProps();
        
            
            serverAPI.towardShared()
            .then(
                (props) => {
                    compDeps.setState(props);
                }
            );            
        },
        deps
    );
}

function onChangeState({
    Comp,
}) {
    return ({
        stateUpd,
    }) => {
        const {
            resumeObj,
        } = Comp.getReqProps();

        const value = {};

        if (stateUpd.hasOwnProperty('scrollTo')) {
            value.scrollTo = stateUpd.scrollTo;
        }
        if (stateUpd.hasOwnProperty('activeComp')) {
            value.activeComp = stateUpd.activeComp;
        }
        if (stateUpd.hasOwnProperty('shared')) {
            value.shared = stateUpd.shared;
        }

        resumeObj.save({
            val: value,
        });
    };
}

function useEffectGetSharedItems({
    Comp,
    deps,
}) {
    useEffect(
        () => {
            const {
                deps,
                comps,
            } = Comp.getReqProps();

            if (deps.state.activeComp === comps.Shared.name) {
                onRequestFileHandler({
                    Comp,
                    ident: deps.state.shared,
                });
            }            
        },
        deps
    );    
}

function getInitialState({Comp}) {
    const resumed = Comp.getResumeObj().get();

    return {
        activeComp: BrowseWrap.name,
        files: [],
        scrollTo: '',

        sharedItems: {},
        recipients: {},
        shared: '',

        ...resumed,
    };
}