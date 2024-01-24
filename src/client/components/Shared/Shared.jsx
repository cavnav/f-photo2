import React, { useEffect } from 'react';
import { ChannelComp, channel } from "../../channel";
import { getSelector, getVarName, useOnChangeSelections, useOnClickItem } from '../../functions';
import { useMutedReducer } from '../../mutedReducer';
import { FilesOne } from '../File/FilesOne';

export const Shared = channel.addComp({
    name: 'Shared',
    getComps,
    render,
});

const Components = {
    BrowseBase: BrowseBaseWrap,
    Shared: SharedWrap,
};


function render() {
    const Comp = this;

    const {
        state
    } = useMutedReducer({
        setCompDeps: Comp.setCompDeps,
        initialState: getInitialState(),
    });    

    const ActiveComp = Components[state.activeComp];

    return (
        <ActiveComp
            MainComp={Comp}
        />
    );
}

function SharedWrap({
    Comp,
}) {
    const {
        comps,
    } = Comp.getReqProps();

    const Share = comps.Share.r;

    return (
        <Share
            files={state.files}
            recipients={state.recipients}
        />
    );
}

const BrowseBaseWrap = new ChannelComp({
    name: 'BrowseBase',
    render: browseRender,
});

function browseRender({
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
        Comp,
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

    useEffectSetActiveComponent({
        Comp: MainComp,
        deps: [state.requestFile],
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
        files: {},
        recipients: {},
        requiredFile: undefined,
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

    
    serverAPI.towardShared({
        resetTo: ''
    })
    .then((
        props
    ) => {
        deps.setState(props);
    });
}

function getSharedItems({
    Comp, 
    requestFile,
}) {
    const {
        serverAPI,
        deps,
    } = Comp.getReqProps();

    serverAPI.towardPrinted({
        dir: requestFile
    })
    .then((
        props,
    ) => {
        deps.setState(props);
    });
}

function onRequestFileHandler({
    Comp,
    ident:src
}) {
    const {
        deps,
    } = Comp.getReqProps();    

    deps.setState({ 
        requestFile: src,
        scrollTo: getSelector({id: src}),
    });
}

function useEffectSetActiveComponent({
    Comp,
    deps,
}) {
    useEffect(
        () => {
            const {
                deps,
                comps,
            } = Comp.getReqProps();

            deps.setState({
                activeComp: comps.Shared.name,
            });
        },
        deps,
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
        activeComp: BrowseBase.name,
    };
}