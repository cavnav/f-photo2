import React from 'react';
import { Progress } from 'antd';
import { Select } from '../../Dialog/';
import { useMutedReducer } from '../../../mutedReducer';

const MAX_FILES_COUNT = 2;

export const Copying = React.memo(function ({
  filesToPrint,
  onCopyCompleted = () => {},
  onCopyCanceled = () => {},
  checkProgress,
  $saveFilesToFlash,  
}) {
  const [state, setState] = useMutedReducer({
    initialState: getStateInit(),
  });

  React.useEffect(() => { 
    if (state.isCopyCompleted === true) onCopyCompleted({
      destDir: state.destDir,
    }); 
  }, [state.isCopyCompleted]);

  return (
    <div className="flexCenter flexDirColumn">
      { (state.copyProgress === 0 && state.isDialogEraseFlash) && (
        <Select
          type={Select.name}
          title='Внимание! Флешка будет очищена перед копированием. Продолжить'
          onAgree={onAgree}
          onCancel={onCopyCanceled}
        />
      )}
      <Progress className="copyProgress" type="circle" percent={state.copyProgress} />  
      { (state.isCopyCompleted) && <div>Все файлы успешно скопированы</div> }    
    </div>
  );

  function onAgree() {
    setState({
      isDialogEraseFlash: false,
    });
    
    $saveFilesToFlash({
      files: filesToPrint,
      folderNameField: 'cnt',
      maxFilesCount: MAX_FILES_COUNT,
    })
    .then(({
      destDir,
    }) => {
      destDir && setState({
        destDir,
        forceUpdate: false,
      });
      checkCopyProgress();
    });

    function checkCopyProgress() {
      checkProgress()
      .then((res) => {
        const isCopyCompleted = res.progress === 100;
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
    destDir: undefined,
    copyProgress: 0,
    isCopyCompleted: false,
    isDialogEraseFlash: true,
  };
}