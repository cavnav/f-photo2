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
  const Comp = this;
  const {state} = useMutedReducer({ 
    initialState: getInitialState(),
    setCompDeps: Comp.setCompDeps,
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
        // Нужно для переключения между действиями (Смотреть все, смотреть одну). Иначе кнопки не соответствуют.
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