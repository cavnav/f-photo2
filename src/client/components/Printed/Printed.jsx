import React, { useEffect } from 'react';
import { channel } from '../../channel';
import { useMutedReducer } from '../../mutedReducer';
import { AppServerAPI } from '../../ServerApi';


export const Printed = channel.addComp({
    name: 'Printed',
    render,
});

function render(props) {
    const Comp = this;

    useMutedReducer({
        setCompDeps: Comp.bindSetCompDeps(),
        initialState: getInitialState(),
    });

    
    
    return (
        <div>

        </div>
    );
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
        printedByDate: [],
    };
}