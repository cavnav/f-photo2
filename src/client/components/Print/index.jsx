import React from 'react';
import { serverApi } from '../../ServerApi';

import './styles.css';

export function Print(props) {

  const stateInit = {
    activeInput: undefined,
  };

  const {
    printState: propPrintState,
  } = props;

  const [state, setState] = React.useState(stateInit);

  const [ignored, forceUpdate] = React.useReducer(x => !x, false);

  React.useEffect(() => {
    const input = document.querySelector(`input[keyid='${state.activeInput}']`);
    input && input.focus();
  });

  return (
    <div className="Print">
      { renderPrintState() }
    </div>    
  );

  // --------------------------------------------------------------------
  function renderPrintState() {
    const toRender = Object.entries(propPrintState).map(([date, photo]) => {
      return <div className="dateForPrintPage">
        {date} <br/>
        <input type="button" value="Задать количество копий для всех фото" /><br/>
        <input type="button" value="Отменить печать всех фото за эту дату" /><br/>
        
        <button>Записать фото и их количество на флешку</button>

        {
          Object.entries(photo).map(([photoSrc, status]) => { 
            const key = getPhotoDataKey({date, photoSrc});         
            return <div 
              className="rowDataForPrint"
              key={key}
              date={date}
              photosrc={photoSrc}
            >
              <div
                className='fitPreview100 marginRight10'
                style={{ 'backgroundImage': `url(${photoSrc})` }}
              >
              </div>              
              <input 
                className="changePhotoCount marginRight10" 
                keyid={key}
                value={status.toPrint} 
                onChange={onChangePhotoCount} 
              />
              <input type="button" className="marginRight10" onClick={onClickErasePhotoCount} value="Стереть" />
            </div>
          })
        }

      </div>
    });

    return toRender;
  }

  function onClickErasePhotoCount(e) {
    const {date, photoSrc} = getDataPrint({e});

    propPrintState[date][photoSrc].toPrint = "";

    setState({
      ...state, 
      activeInput: getPhotoDataKey({date, photoSrc}),
    });
  }

  function onChangePhotoCount(e) {
    const input = e.target;
    const {date, photoSrc} = getDataPrint({e});

    propPrintState[date][photoSrc].toPrint = input.value; 

    forceUpdate();
  }

  function getDataPrint({e}) {
    const parentElement = e.target.parentElement;
    const date = parentElement.getAttribute('date');
    const photoSrc = parentElement.getAttribute('photosrc');

    return {
      date,
      photoSrc,
    };
  }

  function getPhotoDataKey({date, photoSrc}) {
    return `${date}-${photoSrc}`;
  }
}
