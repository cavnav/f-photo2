import React from 'react';

import './styles.css';

export function Print({
  printState,
}) {

  const stateInit = {
    activeInput: undefined,
  };

  const [state, setState] = React.useState(stateInit);

  const [ignored, forceUpdate] = React.useReducer(x => !x, false);

  React.useEffect(addKeyDownListener);
  React.useEffect(() => {
    const input = getActiveInput();
    input && input.focus();
  });

  return (
    <div className="Print">
      { renderPrintState() }
    </div>    
  );

  // --------------------------------------------------------------------
  function getActiveInput() {
    document.querySelector(`input[keyid='${state.activeInput}']`);
  }
  
  function addKeyDownListener() {
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };    
  }

  function onKeyDown(e) {
    const incre = state.curPhotoInd > 0 ? state.curPhotoInd - 1 : 0;
    const down = state.curPhotoInd < files.length - 1 ? (state.curPhotoInd + 1) : (files.length - 1);

    switch (e.which) {
      case 38: // +1
        onChangePhotoCount();
        break;

      case 40: // -1
        onChangePhotoCount();
        break;
    }
  }  

  function renderPrintState() {
    const toRender = Object.entries(printState).map(([date, photo]) => {
      return <div className="dateForPrintPage">
        {date} <br/>
        
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
                className='fitPreview100 file marginRight10'
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

    printState[date][photoSrc].toPrint = "";

    setState({
      ...state, 
      activeInput: getPhotoDataKey({date, photoSrc}),
    });
  }

  function onChangePhotoCount(e) {
    const input = e.target;
    const {date, photoSrc} = getDataPrint({ e });

    printState[date][photoSrc].toPrint = input.value; 

    setState({
      ...state, 
      activeInput: getPhotoDataKey({date, photoSrc}),
    });
  }

  function getDataPrint({ e }) {
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

Print.getReqProps = ({ channel }) => {
  return channel.crop({
    s: { 
      printState: 1,
    }
  });
};