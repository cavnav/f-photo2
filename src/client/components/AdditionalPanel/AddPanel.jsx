import React from 'react';
import { channel } from '../../Channel';
import { useMyReducer } from '../../functions';

import './styles.css';

const Comp = channel.addComp({
  fn: AdditionalPanel,
  getReqProps,
  getAPI,
});

export function AdditionalPanel(
) {
  const [state] = useMyReducer({ 
    initialState: getInitialState(),
    setCompDeps: Comp.setCompDeps,
  });

  if (state.actions.length === 0) return null;

  return (
    <div 
      className='AdditionalPanel btns'       
    >
    {
      state.actions
      .map((
        Action,
      ) => {        
        return (
          <Action.comp 
            key={Action.compId}
          />        
        );
      })
    }
    </div>
  );

  // ----------------
}

function getReqProps({ channel }) { 
  return {};
}

function getAPI({
  deps,
}) {
  return {
    renderIt: (props) => {
      deps.setState({
        actions: props.actions,
      });
    },
  };
};

function getInitialState() {
  return {
    actions: [],
  };
};