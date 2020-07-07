import React from 'react';

import './styles.css';

export function Stepper(props) {

  const [state, dispatch] = React.useReducer(
    stateReducer, 
    initState,
    stateReducer
  );

  let stateFinal = state;
  if  (state.steps !== props.steps) {
    stateFinal = stateReducer(state, {steps: props.steps});
  };

  React.useEffect(fireTrigger, [stateFinal.stepNum]);

  return (
    <div className="Stepper">      
      { stateFinal.stepJSX }
    </div>
  );

  // ------------------------------------------------------------------

  function fireTrigger() {
    const { step: { trigger = () => {} }} = stateFinal;
    trigger({ step: stateFinal.step, setStepNum });
  }

  function stateReducer(prevState, delta,) {
    const stateUpd = {
      ...prevState,
      ...delta,
    };

    const step = stateUpd.steps[stateUpd.stepNum];
    stateUpd.step = step;
    stateUpd.stepJSX = createStepJSX({ step });
    stateUpd.stepsTotal = stateUpd.steps.length - 1;

    return stateUpd;

    // ----------------------------------------------    
  }

  function onClickNextStep({stepNumDelta}) {
    dispatch({
      stepNum: stateFinal.stepNum + (stepNumDelta || stateFinal.stepNumDelta),
    });
  }

  function createStepJSX({ step }) {  
    if (!step) return null;
     
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
        });
      });

      const additionalContent = {
        isNextBtn: getNextBtn,
        isDialog: getDialogBtns,
      };

      const handler = {
        get: (target, prop) => {
          return target[prop] || (() => []);
        },
      }
      const proxyAdditionalContent = new Proxy(additionalContent, handler);

      content.push(...Object.keys(proxyAdditionalContent).map(item => proxyAdditionalContent[step[item]]()));
      
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

      function getDialogBtns({
        
      }) {
        return <div>
          <input 
            className="marginBottom10" 
            type="button" 
            onClick={() => onClickNextStep({stepNumDelta: step.stepNumDelta})} 
            value="confirmDesc" 
          />;
          <input 
            className="marginBottom10" 
            type="button" 
            onClick={() => onClickNextStep({stepNumDelta: step.stepNumDelta})} 
            value="cancelDesc" 
          />;
        </div>
      }
    }
  }

  function setStepNum({ val }) {
    dispatch({
      stepNum: stateFinal.stepNum + val,
    });
  }
}

const stepStruct = {
  desc: ({key, step}) => <div className="title" key={key}>{step.desc}</div>,
  photoSrc: ({key, step}) => <div className="imgBlock marginBottom10" key={key}>
      <img className="copyWizardImg" src={step.photoSrc} />
    </div>,
  toRender:  ({key, step}) => step.toRender({key, step}),
  isDialog
};

const initState = {
  steps: [],
  stepsTotal: 0,
  step: {},
  stepJSX: null,
  stepNum: 0,
  stepNumDelta: +1,
};