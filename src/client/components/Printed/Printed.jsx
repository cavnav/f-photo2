import React, { useEffect } from 'react';
import { channel } from '../../channel';
import { getExistsProps, getSelectorSrc, getVarName, initRefreshWindowEvent, useOnChangeSelections, useOnClickItem } from '../../functions';
import { useMutedReducer } from '../../mutedReducer';
import { FilesOne } from '../File/FilesOne';
import { EVENT_NAMES } from '../../constants';
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
			eventName: EVENT_NAMES.refreshWindow,
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
    
    const FilesComp = <FilesOne
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
    const {
        serverAPI,
        deps,
    } = PrintedComp.getReqProps();

    serverAPI.towardPrinted({
        dir: requestFile,
    })
    .then(({
        files
    }) => {
        deps.setState({
            printedItems: files,
        });
    });
}

function getPrinted({PrintedComp}) {
    const {
        serverAPI,
        deps,
    } = PrintedComp.getReqProps();
    
    serverAPI.towardPrinted({resetTo: ''})
    .then(({ files }) => {
        deps.setState({
            printed: Object.keys(files),
        });
    });
}

function getComps({
    channelComps,
}) {
    const {
        Print,
    } = channelComps;

    return {
        toClone: {
            Printed: Print,
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
        scrollTo: getSelectorSrc({id: src}),
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