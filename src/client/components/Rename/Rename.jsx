import React from 'react';

import { channel } from '../../channel';
import { useMutedReducer } from '../../mutedReducer';
import { ChangeName } from '../AddAlbum/components/ChangeName';


channel.addComp({
    name: 'Rename',
    render,
    getComps,
    getAPI,
});

function render() {
    const Comp = this;
    const [state] = useMutedReducer({
        initialState,
        setCompDeps: Comp.bindSetCompDeps(),
    });

    function onClick() {
        const {
          DialogAPI,
        } = Comp.getComps();
    
        DialogAPI.show({
            render: <ChangeName onSubmit={state.onSubmit} onClose={DialogAPI.close} />,
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

function getAPI({
    deps,
}) {
    return {
        onSubmit(callback) {
            if (callback) {
              deps.setState({
                onSubmit: callback,
              });
            }
          },
    };
}

const initialState = {
    name: '',
    isShow: false,
    onSubmit: undefined,
};
