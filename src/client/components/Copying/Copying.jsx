
import React from 'react';

export function Copying({ 
  key,
  countPhotos,
  copyProgress,
  warn,
  onCopy,
  isCopyCompleted,
}) {
  const copying = (
    <div className="flex flexDirColumn" key={key}>
      { warn && <div>{`* Внимание! ${warn}.`}</div> } 
      Количество фото для копирования:
      { countPhotos }
      <div><input type="button" onClick={onCopy} value="Копировать" /></div>
      <Progress type="circle" percent={copyProgress} />      
    </div> 
  );
  const finished = <div>Все фотографии успешно скопированы!</div>;

  return isCopyCompleted ? finished : copying;
}