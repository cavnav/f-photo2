import React from 'react';
import { channel } from "../../channel";

export const Shared = channel.addComp({
    name: 'Shared',
    render,
});


function render() {
    return (
        'Shared'
    );
}