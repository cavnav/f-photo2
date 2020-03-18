import React from 'react';

import './styles.css';

export function Stepper(props) {

  const [state, setState] = React.useState({
    ...initState,
    steps: props.steps,
    stepsTotal: props.steps.length - 1,
  });

  return (
    <div className="Stepper">      
      { createStep() }
    </div>
  );

  // ------------------------------------------------------------------
  function onClickNextStep({stepNumDelta}) {
    setState({
      ...state,
      stepNum: state.stepNum + (stepNumDelta || state.stepNumDelta),
    });
  }

  function createStep() {
    const { steps, stepNum } = state;
    const step = steps[stepNum];
    const items = Object.keys(stepStruct); 
    let content;

    content = items.map((item, ind) => {
      return step[item] && stepStruct[item]({
        key: ind, 
        step, 
        state,
        setState: ({stepNum}) => setState({
          ...state,
          stepNum, 
        })
      });
    });

    // Добавить кнопку Дальше.
    if (step.isNextBtn !== false) {
      content = [
        ...content,
        <input 
          className="attention marginBottom10" 
          type="button" 
          onClick={() => onClickNextStep({stepNumDelta: step.stepNumDelta})} 
          value="Далее" 
        />
      ];
    }

    return (
      <div className="step">
        { content }
      </div>
    );
  }
}

const stepStruct = {
  desc: ({key, step}) => <div className="title" key={key}>{step.desc}</div>,
  photoSrc: ({key, step}) => <div className="imgBlock marginBottom10" key={key}>
      <img className="copyWizardImg" src={step.photoSrc} />
    </div>,
  toRender: ({key, step}) => step.toRender({key, step}),
  trigger: ({step, state, setState}) => {
    
    setTimeout(async () => {
      let result = await step.trigger();
      console.log(result);
      // const result = await step.trigger() ? 'Resolve' : 'Reject'; 
      result = result ? 'Resolve' : 'Reject'; 

      setState({
        stepNum: state.stepNum + (step[`triggerStepNumDeltaOn${result}`] || 1),
      });
    }, 1000);

    return null;
  },
};

const initState = {
  stepNum: 0,
  steps: [],
  stepsTotal: 0,
  stepNumDelta: +1,
};