import React from 'react';
import { channel } from '../../channel';
import { getDefaultAPI, } from '../../functions';
import { useMutedReducer } from '../../mutedReducer';

export const CustomAction = channel.addComp({
  name: 'CustomAction',
  render,
  getAPI,
  getReqProps,
  getComps,
});


function render() {
  const Comp = this;
  const [state] = useMutedReducer({
    initialState,
    setCompDeps: Comp.bindSetCompDeps(),
  });

  const rp = Comp.getReqProps();
  const {
    Btn,
  } = rp;
  
  return (
    <Btn.r 
      title={state.title} 
      onClick={() => onClick({ Comp })}
    />
  );
}

function onClick({
  Comp,
}) {
  const rp = Comp.getReqProps();
  const { state } = Comp.getDeps();
  rp.DialogAPI.show({
    type: `notify`,
    render: (
      <rp.Notify.r 
        isEnabled
        onConfirm={() => {
          rp.DialogAPI.close();
          state.onClick();
        }}
        onCancel={() => rp.DialogAPI.close()}
      />
    ), 
  });
}

function getReqProps({
  channel,
  comps,
}) {
  const {
    server
  } = channel;
  return {
    server,
    ...comps,
  };
}

function getAPI(props) {  
  return {
    ...getDefaultAPI(props),
  };
}

function getComps({
  channelComps,
}) {
  const {
    Dialog,
    Notification,
    Label,
  } = channelComps;
  return {
    items: {
      Dialog, 
    },
    toClone: {
      Btn: Label,
      Notify: Notification,
    },
  };
}

const initialState = {
  title: '',
  onClick: () => {},
  onCancel: () => {},
};