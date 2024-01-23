import React, { useEffect } from 'react';
import { channel } from '../../channel';
import { getExistsProps, getSelector, getVarName, initRefreshWindowEvent, myRequest, useOnChangeSelections, useOnClickItem } from '../../functions';
import { useMutedReducer } from '../../mutedReducer';
import { FilesPrinted } from '../File/FilesPrinted';
import { eventNames } from '../../constants';
import { BrowseBase } from '../BrowseBase/BrowseBase';


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

    const {state} = useMutedReducer({
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
        <StateComp 
            key={state.forceUpdate} 
            PrintedComp={Comp}
        />
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

    const {state} = deps;

    const onRequestFile = useOnChangeSelections({
        Comp: PrintedComp,
        deps: [],
        handler: onRequestFileHandler,
    });
    
    const FilesComp = state.printed.length === 0 ? undefined : <FilesPrinted
        files={state.printed}
        onRequestFile={getVarName({onRequestFile})}
    />;

    const eventHandlers = {
        onRequestFile,
    };

    const onClickItem = useOnClickItem({eventHandlers});

    useEffect(() => {    
        getPrinted({PrintedComp});
    }, [state.forceUpdate]);

    return (
        <BrowseBase        
            scrollTo={state.scrollTo}
            onClick={onClickItem}
        >
            {FilesComp}
        </BrowseBase>
    );
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
        setState({
            actionName: BrowseBase.name, 
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
    } = channelComps;

    return {
        toClone: {
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

function onRequestFileHandler({
    Comp,
    ident:src
}) {
    const rp = Comp.getReqProps();
    const {deps} = rp;
    const actionName = rp.comps.Printed.name;

    deps.setState({
        actionName, 
        requestFile: src,
        scrollTo: getSelector({id: src}),
    });
}

function getInitialState({Comp}) {
    const actionBrowseName = BrowseBase.name;
    const resumeObj = Comp.getResumeObj().get();

    return {
        ...getDefaultState(),
        ...resumeObj,
        actionName: resumeObj.actionName ?? actionBrowseName,
    };
}