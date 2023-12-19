import React, { useEffect } from 'react';
import { channel } from '../../channel';
import { getExistsProps, getSelector, initRefreshWindowEvent, myRequest } from '../../functions';
import { useMutedReducer } from '../../mutedReducer';
import { FilesPrinted } from '../File/FilesPrinted';
import { getFileSrc } from '../File/FileUtils';
import { eventNames } from '../../constants';


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
			state,
		}) => {
            const val =  getSavedState({state});
            resumeObj.save({
                val,
            });
		}
    });    

    const StateComp = STATE_NAMES[state.actionName];

    React.useEffect(
		() => initRefreshWindowEvent({ 
			eventName: eventNames.refreshWindow,
			callback: () => onRefreshWindow({ Comp }),
		}),
		[]
	);
    
    return (
        StateComp && <StateComp key={state.forceUpdate} PrintedComp={Comp}/>
    );
}

function onRefreshWindow({
    Comp,
}) {
    const {state} = Comp.getDeps();
    Comp.getDeps().setState({forceUpdate: !state.forceUpdate});   
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
    }, [state.forceUpdate]);

    return (
        <BrowseBase
            Files={FilesComp}
            scrollTo={state.scrollTo}
            onRequestFile={onRequestFile}
        />
    );


    // ------------------------------------------------

    function onRequestFile(event) {
        const rp = PrintedComp.getReqProps();
        const {deps} = rp;
        const {setState} = deps;
        const actionName = rp.comps.Printed.name;

        const requestFile = getFileSrc({event});

        setState({
            actionName, 
            requestFile,
            scrollTo: getSelector({id: requestFile}),
        });
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
        forceUpdate: false,
        scrollTo: "",
    };
}

function getSavedState({state}) {
    return getExistsProps({
		obj: state,
		rp: {
            actionName: 1,
            requestFile: 1,
            scrollTo: 1,
        },
    });
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