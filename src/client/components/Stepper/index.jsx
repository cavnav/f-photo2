import React from 'react';

const stepStruct = {
  desc: ({key, step}) => <div className="title" key={key}>{step.desc}</div>,
  photoSrc: ({key, step}) => <div className="imgBlock marginBottom10" key={key}>
      <img className="copyWizardImg" src={step.photoSrc} />
    </div>,
  toRender: ({key, step}) => render.constructor === Function ? render({key, step}) : null,
};

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
      <input className="marginBottom10" type="button" onClick={onClickNextStep} value="Следующий шаг" /> 
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
    const step = steps[state.stepNum];
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