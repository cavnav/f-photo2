import React, { useEffect, useMemo } from 'react';
import { ChannelComp, channel } from "../../channel";
import { getSelector, getVarName, useOnChangeSelections, useOnClickItem } from '../../functions';
import { useMutedReducer } from '../../mutedReducer';
import { FilesOne } from '../File/FilesOne';
import { BrowseBase } from '../BrowseBase/BrowseBase';

export const Shared = channel.addComp({
    name: 'Shared',
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
    } = useMutedReducer({
        setCompDeps: Comp.setCompDeps,
        initialState: getInitialState(),
    });    

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
                    MainComp={Comp}
                    {...state.sharedProps}
                />
            )}            
        </>        
    );
}


function browseWrapRender({
    MainComp,
}){
    const Comp = this;

    const {
        state,
    } = useMutedReducer({
        initialState: getBrowseInitialState(),
        setCompDeps: Comp.setCompDeps,
    });

    const onRequestFile = useOnChangeSelections({
        Comp: {
            BrowseComp: Comp,
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
        BrowseComp,
        MainComp,
    } = Comp;   
    
    const {
        deps: browseDeps,
        serverAPI,
    } = BrowseComp.getReqProps();

    serverAPI.towardSharedItems({
        dir: src,
    })
    .then(
        (response) => {
            browseDeps.setState({                 
                scrollTo: getSelector({id: src}),
            });

            const {
                comps,
                deps: mainDeps,
            } = MainComp.getReqProps();

            const {
                recipients
            } = response;

            let recipientsUpd = {};
            recipients.forEach(
                (item, ind) => {
                    recipientsUpd[ind] = item;
                }
            );

            mainDeps.setState({
                activeComp: comps.Shared.name,
                sharedProps: {
                    ...response,
                    recipients: recipientsUpd,
                    shared: src,
                    onClose: () => {
                        mainDeps.setState({
                            activeComp: BrowseWrap.name,
                        });
                    }
                },
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
            getShared({
                Comp,
            });
        },
        deps
    );
}

function getInitialState() {
    return {
        activeComp: BrowseWrap.name,
        sharedProps: {},
        browseProps: {},
    };
}