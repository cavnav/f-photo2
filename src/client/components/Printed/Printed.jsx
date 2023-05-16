import React from 'react';
import { channel } from channel;


export const Printed = channel.addComp({
    name: 'Printed',
    render,
});

function render(props) {
    Comp = this;

    return <div>it's working</div>;
}