import React from 'react';
import { channel } from '../../channel';
import { useMutedReducer } from '../../mutedReducer';

import './styles.css';

export const AdditionalPanel = channel.addComp({
  name: 'AdditionalPanel',
  render,
  getReqProps,
  getAPI,
});

function render(
) {
  const [state] = useMutedReducer({ 
    initialState: getInitialState(),
    setCompDeps: this.bindSetCompDeps(),
  });

  React.useEffect(() => state.resolve(), [state.resolve]);

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
          <Action.r 
            key={Action.name}
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
      console.log('addPanelRenderIt', props.actions)
            
      return new Promise((resolve) => {
        setTimeout(() => {
          deps.setState({
            actions: props.actions,
            resolve,
          });
        });
      });
    },
  };
};

function getInitialState() {
  return {
    actions: [],
    resolve: () => {},
  };
};