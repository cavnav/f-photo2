import React, { useEffect } from 'react';
import { channel } from '../../channel';
import { myRequest } from '../../functions';
import { useMutedReducer } from '../../mutedReducer';
import { FilesPrinted } from '../File/FilesPrinted';
import { getFileSrc } from '../File/FileUtils';


const STATE_NAMES = {BrowseBase: BrowseBaseWrap, PrintClone: PrintWrap};

export const Printed = channel.addComp({
    name: 'Printed',
    render,
    getComps,
});

function render() {
    const Comp = this;

    const [state] = useMutedReducer({
        setCompDeps: Comp.bindSetCompDeps(),
        initialState: getInitialState({Comp}),
    });    

    const StateComp = STATE_NAMES[state.actionName];
    
    return (
        <div className="printed">
            {StateComp && <StateComp PrintedComp={Comp}/>}
        </div>
    );
}

function BrowseBaseWrap({PrintedComp}) {
    const rp = PrintedComp.getReqProps();
    const {deps} = rp;
    const BrowseBase = rp.comps.BrowseBase.r;

    const {state} = deps;
    const FilesComp = state.printed.length === 0 ? undefined : (props) => <FilesPrinted
        files={state.printed}
        {...props}
        />;

    useEffect(() => {    
        getPrinted({PrintedComp});
    }, []);

    return (
        <BrowseBase
            Files={FilesComp}
            onRequestFile={onRequestFile}
        />
    );


    // ------------------------------------------------

    function onRequestFile(event) {
        const rp = PrintedComp.getReqProps();
        const {deps} = rp;
        const {setState} = deps;
        const actionName = rp.comps.PrintClone.name;

        setState({actionName, requestFile: getFileSrc({event})});
    }
}

function PrintWrap({PrintedComp}) {
    const rp = PrintedComp.getReqProps();
    const PrintClone = rp.comps.PrintClone.r;
    const {deps} = rp;
    const {state} = deps;
     
    useEffect(() => {
        getPrintedItems({PrintedComp, requestFile: state.requestFile});
    }, []);

    return <PrintClone files={state.printedItems}/>;
}

function getPrintedItems({PrintedComp, requestFile}) {
    const rp = PrintedComp.getReqProps();
    myRequest({
        request: () => rp.serverAPI.towardPrinted({dir: requestFile}),
        onResponse: ({files}) => {
            rp.deps.setState({
                printedItems: files,
            });
        },
    });
}

function getPrinted({PrintedComp}) {
    const rp = PrintedComp.getReqProps();
    myRequest({
        request: () => rp.serverAPI.towardPrinted({resetTo: ''}),
        onResponse: ({ files }) => {
            rp.deps.setState({
                printed: files,
            });
        },
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

function getInitialState({Comp}) {
    const rp = Comp.getReqProps();
    const actionName = rp.comps.BrowseBase.name;
    return {
        actionName,
        printed: [],
        requestFile: undefined,
        printedItems: {},
    };
}