import React from 'react';

import './styles.css';

export function Stepper(props) {

  const [state, dispatch] = React.useReducer(
    stateReducer, 
    initState,
    stateReducer
  );

  let stateFinal = state;
  if  (state.steps.length === 0) {
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
        { getContent(step) }
      </div>
    );

    // -----------------------------------------------------------------
    function getContent(step) {
      const items = Object.keys(stepStruct); 
      let content;
  
      content = items.map((item, ind) => {
        return step[item] && stepStruct[item]({
          key: ind, 
          step, 
        });
      });

      content.push(...getAdditionalContent(step));
      
      return content;

      // -----------------------------------------

      function getAdditionalContent(step) {
        const additionalContent = {
          isNextBtn: getNextBtn,
          dialog: getDialogBtns,
        };
  
        const proxyAdditionalContent = new Proxy(step, getHandler());

        return Object.keys(proxyAdditionalContent).map(item => {
          return proxyAdditionalContent[item];
        });

        function getHandler() {
          return {
            get: (target, prop) => {
              if (target[prop] || target[prop] === undefined) {
                return additionalContent[prop]();
              }
            },
          };
        }
      }

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
        const dialog = step.dialog;
        const confirmDesc = dialog.confirmDesc || 'Ок';
        const cancelDesc = dialog.cancelDesc || 'Отменить';
        const nextOnConfirm = dialog.nextOnConfirm || +1;
        const nextOnCancel = dialog.nextOnCancel || +2

        return <div>          
          <input 
            className="marginBottom10" 
            type="button" 
            onClick={() => onClickNextStep({ stepNumDelta: nextOnConfirm })} 
            value={confirmDesc} 
          />;
          <input 
            className="marginBottom10" 
            type="button" 
            onClick={() => onClickNextStep({ stepNumDelta: nextOnCancel })} 
            value={cancelDesc}
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
};

const initState = {
  steps: [],
  stepsTotal: 0,
  step: {},
  stepJSX: null,
  stepNum: 0,
  stepNumDelta: +1,
};