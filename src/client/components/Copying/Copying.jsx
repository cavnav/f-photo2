
import React from 'react';

export function Copying({ 
  count,
  warn,
  onStartCopy,
  checkCopyProgress,
}) {
  const copying = (
    <div className="flex flexDirColumn">
      { warn && <div>{`* Внимание! ${warn}.`}</div> } 
      Количество объектов для копирования: { count }
      <div><input type="button" onClick={onStartCopy} value="Копировать" /></div>
      <Progress type="circle" percent={copyProgress} />      
    </div> 
  );
  const finished = <div>Все фотографии успешно скопированы!</div>;

  return isCopyCompleted ? finished : copying;

  function $checkCopyProgressWrap() {
    $checkCopyProgress()
      .then((res) => {
        const isCopyCompleted = res.copyProgress === 100;
        setTimeout(() => (isCopyCompleted ? null : checkCopyProgress()), 500);
        setState({
          ...state,
          copyProgress: res.copyProgress,
          isCopyCompleted,
        });
      });
  }
}