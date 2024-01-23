import React from 'react';
import { useMutedReducer } from '../../mutedReducer';

import './styles.css';

const STEP_NUM_DELTA = +1;

export function Stepper(props) {

    const {state, setState:dispatch} = useMutedReducer({
        initialState,
        reducer: stateReducer,
        props, 
    });

    React.useEffect(fireTrigger, [state.stepNum]);

    return (
        <div className="Stepper">
            {state.stepJSX}
        </div>
    );

    // ------------------------------------------------------------------

    function fireTrigger() {
        const { step: { trigger = () => { } } } = state;
        trigger({ step: state.step, setStepNum });
    }

    function stateReducer({state, stateUpd}) {
        const stateNew = {
            ...state,
            ...stateUpd,
        };

        const step = stateNew.steps[stateNew.stepNum];
        stateNew.step = step;
        stateNew.stepJSX = createStepJSX({ step });
        stateNew.stepsTotal = stateNew.steps.length - 1;

        return stateNew;
    }

    function createStepJSX({ step }) {
        if (!step) return null;

        return (
            <div className="step">
                {getContent(step)}
            </div>
        );

        // -----------------------------------------------------------------
        function getContent(step) {
            const items = Object.keys(stepStruct);
            let content;
            const nextStepBtn = getNextBtn(step.stepNumDelta);

            let index;
            content = items.map((item, ind) => {
                index = ind + 1;
                return step[item] && stepStruct[item]({
                    key: ind,
                    step,
                    nextStepBtn,
                });
            });

            if (step.isNextBtn !== false) {
                content.push(<div key={index}>{nextStepBtn}</div>);
            }

            return content;
        }
    }

    function getNextBtn(stepNumDelta) {
        return <input
            className="attention marginBottom10"
            type="button"
            onClick={() => onClickNextStep({ stepNumDelta })}
            value="Далее"
        />;
    }

    function onClickNextStep({ stepNumDelta = STEP_NUM_DELTA }) {
        dispatch({
            stepNum: state.stepNum + stepNumDelta,
        });
    }

    function setStepNum({ val }) {
        dispatch({
            stepNum: state.stepNum + val,
        });
    }
}

const stepStruct = {
    desc: ({ key, step }) => <div className="title" key={key}>{step.desc}</div>,
    photoSrc: ({ key, step }) => <div className="imgBlock marginBottom10" key={key}>
        <img className="copyWizardImg" src={step.photoSrc} />
    </div>,
    toRender: ({ key, step, nextStepBtn }) => {
        return <div key={key}>{step.toRender({ step, nextStepBtn })}</div>;
    },
};

const initialState = {
    steps: [],
    stepsTotal: 0,
    step: {},
    stepJSX: null,
    stepNum: 0,
};