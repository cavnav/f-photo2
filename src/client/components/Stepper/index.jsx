import React from 'react';

import './styles.css';

export function Stepper(props) {
  const initState = {
    stepNum: 0,
    steps: props.steps,
  };
  const [state, setState] = React.useState(initState);

  const step = createStep();

  return (
    <div className="stepper">      
      { step }
      { (state.stepNum + 1 < props.steps.length) && <input className="marginBottom10" type="button" onClick={onClickNextStep} value="Следующий шаг" /> }
    </div>
  );

  // ------------------------------------------------------------------
  function onClickNextStep() {
    setState({
      ...state,
      stepNum: state.stepNum + 1,
    });
  }

  function createStep() {
    const { steps, stepNum } = state;
    const step = steps[stepNum];
    const items = Object.keys(stepStruct); 
    let content;

    content = items.map((item, ind) => {
      return step[item] && stepStruct[item]({key: ind, step});
    });

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
};