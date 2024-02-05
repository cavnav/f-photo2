import React, { useEffect } from 'react';
import { ChannelComp, channel } from "../../channel";
import { getSelector, getVarName, useOnChangeSelections, useOnClickItem } from '../../functions';
import { useMutedReducer } from '../../mutedReducer';
import { FilesOne } from '../File/FilesOne';
import { BrowseBase } from '../BrowseBase/BrowseBase';

export const Shared = channel.addComp({
    name: 'SharedComp',
    getComps,
    getResumeObj,
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
    } = useMutedReducer({
        setCompDeps: Comp.setCompDeps,
        initialState: getInitialState({Comp}),        
        fn: onChangeState({Comp}),
    });    

    const onSharedClose = ({shared}) => {
        const deps = Comp.getDeps();
        
        deps.setState({
            activeComp: BrowseWrap.name,
            browseProps: {
                scrollTo: getSelector({id: shared}),  
            }
        });
    }

    const comps = Comp.getComps();
    const SharedRender = comps.Shared.r;

    return (
        <>
            {state.activeComp === BrowseWrap.name && (
                <BrowseWrap.r 
                    MainComp={Comp}
                    {...state.browseProps}
                />
            )}
            {state.activeComp === comps.Shared.name && (
                <SharedRender    
                    onClose={onSharedClose}                
                    {...state.sharedProps}
                />
            )}            
        </>        
    );
}


function browseWrapRender({
    MainComp,
    ...props
}){
    const Comp = this;
    
    const {
        state,
    } = useMutedReducer({
        initialState: getBrowseInitialState({Comp: MainComp}),
        props,
        setCompDeps: Comp.setCompDeps,
    });

    const onRequestFile = useOnChangeSelections({
        Comp: {
            MainComp,
        },
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
        Comp,
        deps: []
    });


    return (
        <BrowseBase
            scrollTo={state.scrollTo}
            onClick={onClickItem}
        >
            <FilesOne
                files={state.files}
                onRequestFile={getVarName({onRequestFile})}
            />
        </BrowseBase>
    );
}

function getBrowseInitialState() {
    return {
        files: [],
        scrollTo: "",
    };
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

function getShared({
    Comp,
}) {
    const {
        serverAPI,
        deps,
    } = Comp.getReqProps();

    
    serverAPI.towardShared()
    .then(
        (props) => {
            deps.setState(props);
        }
    );
}

function onRequestFileHandler({
    Comp,
    ident:src
}) {
    const {
        MainComp,
    } = Comp;   
    
    const {
        serverAPI,
    } = MainComp.getReqProps();

    serverAPI.towardSharedItems({
        dir: src,
    })
    .then(
        (response) => {            
            const {
                comps,
                deps: mainDeps,
            } = MainComp.getReqProps();

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

            mainDeps.setState({
                activeComp: comps.Shared.name,
                sharedProps: {                                      
                    files: filesUpd,
                    recipients: recipientsUpd,
                    shared: src,                    
                },
            });
        }
    );    
}

function getResumeObj({
    name,
}) {
    return {
        selector: [name],
    }
}

function onChangeState({
    Comp
}) {
    return ({
        stateUpd,
    }) => {
        const resumeObj = Comp.getResumeObj();

        resumeObj.save({
            val: {
                activeComp: stateUpd.activeComp,
            },
        });
    };
}

function useEffectGetShared({
    Comp,
    deps,
}) {
    useEffect(
        () => {
            getShared({
                Comp,
            });
        },
        deps
    );
}

function getInitialState({Comp}) {
    const resumed = Comp.getResumeObj().get();

    return {
        activeComp: BrowseWrap.name,
        sharedProps: {},
        browseProps: {},
        
        ...resumed,
    };
}