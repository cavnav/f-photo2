import React, { useCallback, useEffect } from 'react';
import { channel } from '../../channel';
import { myRequest } from '../../functions';
import { useMutedReducer } from '../../mutedReducer';
import { AppServerAPI } from '../../ServerApi';
import { FilesPrinted } from '../File/FilesPrinted';


export const Printed = channel.addComp({
    name: 'Printed',
    render,
    getComps,
    getReqProps,
});

function render() {
    const Comp = this;
    const rp = Comp.getReqProps();
    const BrowseBase = rp.BrowseBase.r;

    const [state] = useMutedReducer({
        setCompDeps: Comp.bindSetCompDeps(),
        initialState: getInitialState(),
    });    

    const onNavigate = ({ files }) => onNavigateCore({
        Comp,
        files,
    });

    useEffect(() => {    
        const rp = Comp.getReqProps();
        myRequest({
            request: () => rp.serverAPI.toward({
                resetTo: '\\x',
            }),
            onResponse: onNavigate,
        });
    }, []);

    const onRequestFileUpd = useCallback(onRequestFile({Comp}, []));
    const FilesComp = state.files.length === 0 ? null : (props) => <FilesPrinted
        files={state.files}
        {...props}
        />;
    
    return (
        <div className="printed">
            <BrowseBase 
                Files={FilesComp}
                onRequestFile={onRequestFileUpd}
            />
        </div>
    );
}

function onRequestFile({
    Comp,
}) {
    return (event) => {

        console.log("onRequestFile");
    };
}

function getReqProps({
    comps,
    channel,
}) {
    return {
        serverAPI: channel.server,
        ...comps,
    };
}

function onNavigateCore({
    Comp,
    files,
}) {
    const deps = Comp.getDeps();
    deps.setState({
        files,
    });
}

function getComps({
    channelComps,
}) {
    const {
        App,
        Browse,
        Dialog,
        BrowseBase,
    } = channelComps;

    return {
        toClone: {
            BrowseBase,
        },
        items: {
            App,
            Browse,
            Dialog,
        },
    };
}

function navigate({
    Comp,
}) {
    const deps = Comp.getDeps();
    AppServerAPI.toward({
        resetTo: path,
    })
    .then(({
        printedByDate,
    }) => {
        deps.setState({
            printedByDate,
        });
    });
}

function getInitialState() {
    return {
        files: [],
    };
}