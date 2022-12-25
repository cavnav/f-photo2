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

const initialState = {
  title: '',
  onClick: () => {},
};

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
  rp.NotificationAPI.forceUpdate({
    isConfirm: true,
    onConfirm: state.onClick,
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
    Notification,
    Label,
  } = channelComps;
  return {
    items: {
      Notification, 
    },
    toClone: {
      Btn: Label,
    },
  };
}