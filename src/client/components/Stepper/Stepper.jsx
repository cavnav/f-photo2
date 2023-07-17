import React from 'react';

import './styles.css';

const STEP_NUM_DELTA = +1;

export function Stepper(props) {

    const [state, dispatch] = React.useReducer(
        stateReducer,
        initState,
        stateReducer
    );

    let stateFinal = state;
    if (state.steps.length === 0) {
        stateFinal = stateReducer(state, { steps: props.steps });
    };

    React.useEffect(fireTrigger, [stateFinal.stepNum]);

    return (
        <div className="Stepper">
            {stateFinal.stepJSX}
        </div>
    );

    // ------------------------------------------------------------------

    function fireTrigger() {
        const { step: { trigger = () => { } } } = stateFinal;
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
            const NextStepBtn = getNextBtn(step.stepNumDelta);

            content = items.map((item, ind) => {
                return step[item] && stepStruct[item]({
                    key: ind,
                    step,
                    NextStepBtn: () => getNextBtn(step.stepNumDelta),
                });
            });

            if (step.isNextBtn !== false) {
                content.push(NextStepBtn);
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
            stepNum: stateFinal.stepNum + stepNumDelta,
        });
    }

    function setStepNum({ val }) {
        dispatch({
            stepNum: stateFinal.stepNum + val,
        });
    }
}

const stepStruct = {
    desc: ({ key, step }) => <div className="title" key={key}>{step.desc}</div>,
    photoSrc: ({ key, step }) => <div className="imgBlock marginBottom10" key={key}>
        <img className="copyWizardImg" src={step.photoSrc} />
    </div>,
    toRender: ({ key, step, NextStepBtn }) => step.toRender({ key, step, NextStepBtn }),
};

const initState = {
    steps: [],
    stepsTotal: 0,
    step: {},
    stepJSX: null,
    stepNum: 0,
};