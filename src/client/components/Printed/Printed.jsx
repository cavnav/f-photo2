import React, { useCallback, useEffect } from 'react';
import { channel } from '../../channel';
import { myRequest } from '../../functions';
import { useMutedReducer } from '../../mutedReducer';
import { AppServerAPI } from '../../ServerApi';
import { FilesPrinted } from '../File/FilesPrinted';


const STATE_NAMES = {Browse: BrowseBaseWrap, Print: PrintWrap};

export const Printed = channel.addComp({
    name: 'Printed',
    render,
    getComps,
    getReqProps,
});

function render() {
    const Comp = this;

    const [state] = useMutedReducer({
        setCompDeps: Comp.bindSetCompDeps(),
        initialState: getInitialState({Comp}),
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

    const StateComp = STATE_NAMES[state.actionName];
    
    return (
        <div className="printed">
            {StateComp && <StateComp PrintedComp={Comp}/>}
        </div>
    );
}

function BrowseBaseWrap({PrintedComp}) {
    const deps = PrintedComp.getDeps();
    const rp = PrintedComp.getReqProps();
    const BrowseBase = rp.BrowseBase.r;

    const {state} = deps;
    const onRequestFileUpd = useCallback(onRequestFile, []);
    const FilesComp = state.files.length === 0 ? undefined : (props) => <FilesPrinted
        files={state.files}
        {...props}
        />;

    return (
        <BrowseBase
            Files={FilesComp}
            onRequestFile={onRequestFileUpd}
        />
    );


    function onRequestFile() {
        const deps = PrintedComp.getDeps();
        const {setState} = deps;
        const rp = PrintedComp.getReqProps();
        const actionName = rp.PrintClone.name;

        setState({actionName});
    }
}

function PrintWrap({PrintedComp}) {
    const deps = PrintedComp.getDeps();
    const {state} = deps;
    const rp = PrintedComp.getReqProps();
    const PrintClone = rp.PrintClone.r;

    return <PrintClone files={state.files}/>;
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
        Print,
        Dialog,
        BrowseBase,
    } = channelComps;

    return {
        toClone: {
            BrowseBase,
            PrintClone: Print,
        },
        items: {
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

function getInitialState({Comp}) {
    const rp = Comp.getReqProps();
    const actionName = rp.BrowseBase.name;
    return {
        files: [],
        actionName,
    };
}