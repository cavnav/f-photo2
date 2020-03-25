import React from 'react';

import './styles.css';

export function Stepper(props) {

  const [state, dispatch] = React.useReducer(
    stateReducer, 
    {
      ...initState,
      steps: props.steps,
      stepsTotal: props.steps.length - 1,
    }, 
    stateReducer
  );

  React.useEffect(onRender);

  return (
    <div className="Stepper">      
      { state.stepJSX }
    </div>
  );

  // ------------------------------------------------------------------
  function onRender() {
    const { step: { trigger = () => {} } } = state;
    console.log('state.stepNum', state.stepNum);
    trigger({ state, dispatch });
  }

  function stateReducer(prevState, newState) {
    const stateUpd = {
      ...prevState,
      ...newState,
    };

    const step = stateUpd.steps[stateUpd.stepNum];

    stateUpd.step = step;
    stateUpd.stepJSX =  createStepJSX({ step });
    
    return stateUpd;

    // ----------------------------------------------    
  }

  function onClickNextStep({stepNumDelta}) {
    dispatch({
      stepNum: state.stepNum + (stepNumDelta || state.stepNumDelta),
    });
  }

  function createStepJSX({ step }) {   
    return (
      <div className="step">
        { getContent() }
      </div>
    );

    // -----------------------------------------------------------------
    function getContent() {
      const items = Object.keys(stepStruct); 
      let content;
  
      content = items.map((item, ind) => {
        return step[item] && stepStruct[item]({
          key: ind, 
          step, 
          state,
          dispatch,
        });
      });
  
      // Добавить кнопку Дальше.
      if (step.isNextBtn !== false) {
        content = [
          ...content,
          getNextBtn(),
        ];
      }
      
      return content;

      // -----------------------------------------
      function getNextBtn() {
        return <input 
          className="attention marginBottom10" 
          type="button" 
          onClick={() => onClickNextStep({stepNumDelta: step.stepNumDelta})} 
          value="Далее" 
        />;
      }
    }
  }
}

const stepStruct = {
  desc: ({key, step}) => <div className="title" key={key}>{step.desc}</div>,
  photoSrc: ({key, step}) => <div className="imgBlock marginBottom10" key={key}>
      <img className="copyWizardImg" src={step.photoSrc} />
    </div>,
  toRender:  ({key, step}) => step.toRender({key, step}),
};

const initState = {
  steps: [],
  stepsTotal: 0,
  step: {},
  stepJSX: null,
  stepNum: 0,
  stepNumDelta: +1,
};