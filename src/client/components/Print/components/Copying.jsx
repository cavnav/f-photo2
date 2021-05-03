import React from 'react';
import { useMyReducer } from "../../../functions";
import { Progress } from 'antd';

export const Copying = React.memo(function ({
  filesToPrint,
  onCopyCompleted = () => {},
  onCopyCanceled = () => {},
  $checkCopyProgress,
  $saveFilesToFlash,  
}) {
  const [state, setState] = useMyReducer({
    initialState: getStateInit(),
  });

  const onAcceptCb = React.useCallback(() => onAccept(), [state.timer]);
  
  React.useEffect(() => timer(state.timer), [state.timer]);
  React.useEffect(() => { if (state.isCopyCompleted === true) onCopyCompleted() }, [state.isCopyCompleted]);

  return (
    <div className="flexCenter flexDirColumn">
      { (state.copyProgress === 0) && (
          <>
            <div>Внимание! Флешка будет очищена перед копированием, <span style={{fontSize: '30px'}}>{state.timer}</span></div> 
            <input className="acceptBtn" type="button" value="ok" onClick={onAcceptCb}/>
          </>
        )
      }
      <Progress className="copyProgress" type="circle" percent={state.copyProgress} />  
      { (state.isCopyCompleted) && <div>Все файлы успешно скопированы</div> }    
    </div>
  );  

  function timer(val) { 
    if (val === 0) {
      onCopyCanceled();
      return;
    }

    if (state.clearTimerId) return;
    const timerId = setTimeout(() => setState({ timer: val - 1 }), 1000);
    
    setState({
      timerId,
    });
  }

  function getDataForCopyFiles({
    filesToPrint,
  }) {
    return {
      files: Object.entries(filesToPrint)
      .filter(([_i, statuses]) => statuses.toPrint > 0)
      .reduce((res, [fileSrc, cntCopies]) => { 
          res[fileSrc] = cntCopies.toPrint;
          return res; 
        }, 
        {}
      ),
    };
  };

  function onAccept() {
    setState({
      clearTimerId: state.timerId
    });
    
    $saveFilesToFlash(
      getDataForCopyFiles({
        filesToPrint,
      })    
    )
    .then(checkCopyProgress);

    function checkCopyProgress() {
      $checkCopyProgress()
      .then((res) => {
        const isCopyCompleted = res.copyProgress === 100;
        if (isCopyCompleted === false) {
          setTimeout(() => checkCopyProgress(), 500);
        }
        setState({
          copyProgress: res.copyProgress,
          isCopyCompleted,
        });
      });
    }
  }
});
  
function getStateInit() {
  return {
    copyProgress: 0,
    isCopyCompleted: false,
    timer: 10,
    timerId: 0,
    clearTimerId: 0,
  };
}