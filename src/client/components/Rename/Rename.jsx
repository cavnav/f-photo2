import React from 'react';

import { channel } from '../../channel';
import { useMutedReducer } from '../../mutedReducer';


channel.addComp({
    name: 'Rename',
    render,
});

function render() {
    const Comp = this;
    const [state] = useMutedReducer({
        initialState,
        setCompDeps: Comp.bindSetCompDeps(),
    })
    return state.isShow === false ? null : (
        <div>Назвать</div>
    );
}

const initialState = {
    isShow: false,
};
