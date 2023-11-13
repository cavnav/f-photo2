import React, { useEffect } from 'react';
import { channel } from '../../channel';
import { myRequest } from '../../functions';
import { useMutedReducer } from '../../mutedReducer';
import { FilesPrinted } from '../File/FilesPrinted';
import { getFileSrc } from '../File/FileUtils';


const STATE_NAMES = {BrowseBase: BrowseBaseWrap, Printed: PrintWrap};

export const PrintedComp = channel.addComp({
    name: 'PrintedComp',
    render,
    getComps,
    getResumeObj,
});

function render() {
    const Comp = this;
    const resumeObj = Comp.getResumeObj();

    const [state] = useMutedReducer({
        setCompDeps: Comp.setCompDeps,
        initialState: getInitialState({Comp}),
        fn: ({
			stateUpd,
		}) => {
			if (stateUpd.hasOwnProperty('requestFile')) {
                resumeObj.save({
                    val: {
                        actionName: stateUpd.actionName, 
                        requestFile: stateUpd.requestFile,
                    }
			    });
            }
		}
    });    

    const StateComp = STATE_NAMES[state.actionName];
    
    return (
        StateComp && <StateComp PrintedComp={Comp}/>
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
        const actionName = rp.comps.Printed.name;

        setState({actionName, requestFile: getFileSrc({event})});
    }
}

function PrintWrap({PrintedComp}) {
    const rp = PrintedComp.getReqProps();
    const Printed = rp.comps.Printed.r;
    const {deps} = rp;
    const {state, setState} = deps;
     
    useEffect(() => {
        getPrintedItems({PrintedComp, requestFile: state.requestFile});
    }, []);

    const onBackToPrinted = () => {
        const actionName = rp.comps.BrowseBase.name;
        setState({
            actionName,  
            requestFile: undefined,      
        });
    }

    return <Printed
        files={state.printedItems} 
        printed={state.requestFile}
        onBackToPrinted={onBackToPrinted}
    />;
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
                printed: Object.keys(files),
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
            Printed: Print,
        },
        items: {
            Dialog,
        },
    };
}

function getResumeObj({name}) {
    return {
        selector: [name],
        val: {},
    }

}

function getDefaultState() {
    return {
        actionName: undefined,
        printed: [],
        requestFile: undefined,
        printedItems: {},
    };
}

function getInitialState({Comp}) {
    const rp = Comp.getReqProps();
    const actionBrowseName = rp.comps.BrowseBase.name;
    const resumeObj = Comp.getResumeObj().get();

    return {
        ...getDefaultState(),
        ...resumeObj,
        actionName: resumeObj.actionName ?? actionBrowseName,
    };
}