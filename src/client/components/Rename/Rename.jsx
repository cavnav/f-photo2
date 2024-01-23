import React from 'react';

import { channel } from '../../channel';
import { useMutedReducer } from '../../mutedReducer';
import { ChangeName } from '../AddAlbum/components/ChangeName';

export const Rename = channel.addComp({
    name: 'Rename',
    render,
    getComps,
});

function render() {
    const Comp = this;
    const {state} = useMutedReducer({
        initialState,
        setCompDeps: Comp.setCompDeps,
    });

    function onClick() {
        const {
          DialogAPI,
        } = Comp.getComps();

        DialogAPI.show({
            render: <ChangeName 
                name={state.name}
                onSubmit={state.onSubmit} 
                onClose={DialogAPI.close} 
            />,
            isHide: false,
        });
      };

    return state.isShow === false ? null : (
        <div 
          onClick={onClick}      
        >
          Переименовать
        </div>
    );     
}

function getComps({
    channelComps,
}) {
    return {
        items: {
            Dialog: channelComps.Dialog,
        },
    };
}

const initialState = {
    name: '',
    isShow: false,
    onSubmit: undefined,
};
