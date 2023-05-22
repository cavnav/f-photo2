import React, { useEffect } from 'react';
import { channel } from '../../channel';
import { myRequest } from '../../functions';
import { useMutedReducer } from '../../mutedReducer';
import { AppServerAPI } from '../../ServerApi';
import { FileItem } from '../File/FileItem';


export const Printed = channel.addComp({
    name: 'Printed',
    render,
    getComps,
    getReqProps,
});

function render() {
    const Comp = this;
    const onClickDispatcher = (event) => {
        const { target } = event;
        const onClickCb = target.getAttribute('clickcb');
        if (onClickCb && CLICK_DISPATCHER[onClickCb]) {
            CLICK_DISPATCHER[onClickCb]({
                event,
            });
        }
    };
    const onNavigate = ({ files }) => onNavigateCore({
        Comp,
        files,
    });

    const [state] = useMutedReducer({
        setCompDeps: Comp.bindSetCompDeps(),
        initialState: getInitialState(),
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
    
    return (
        <div className="printed" onClick={onClickDispatcher}>
        {
            state.files.map((file, ind) => (
                <FileItem
                    key={file} 
                    title={file.replace(".json", "")}
                    ind={ind}
                    src={file}
                    className="positionRel fitPreview file"
                    clickcb={"onClickFile"}
                    clickItemCb={"onSelectFile"}
                />
            ))
        }
        </div>
    );
}

const CLICK_DISPATCHER = {
    onClickFile,
    onSelectFile,
};

function onClickFile({
    event,
}) {


}

function onSelectFile({
    event,
}) {

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
    } = channelComps;

    return {
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