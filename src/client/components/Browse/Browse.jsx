import React, { useEffect, useReducer } from 'react';
import { 
  Help, 
  Actions,
  Dialog 
} from '../';
import { 
  Spin,
  Progress,
} from 'antd';

import './styles.css';

// const resumeObj = new ResumeObj({
//   compName: OnePhoto.name,
// });

export function Browse({
  appState,
  browseState, 
  files,
  dirs,

  setAppState,
  setBrowseState,
  server,
  tempReducer,
}) {
  const [state, setState] = useReducer(tempReducer, stateInit);

  Browse.state = state;
  Browse.setState = setState;

  const onDialogCancel = React.useCallback(() => {
    setState({
      isDialogEnabled: false,
      dialogTitle: '',
    });
  }, []);

  useEffect(onFirstRender, []);
  useEffect(boostPerfImgRender, [files]);

  return getRender();

  // --------------------------------------------------------------------
  function getRender() {
    return (
      <div 
          className={`${Browse.name}`}
        >
        { state.loading && <Spin size="large" /> }
        { state.copyProgress < 100 && (
          <Progress 
            type="circle" 
            percent={state.copyProgress}             
          />    
        )}

        {state.isDialogEnabled && (
          <Dialog       
            onCancel={onDialogCancel}    
          >
            <div>{state.dialogTitle}</div>
          </Dialog>
        )}

        { getDirsToRender() }
        { getFilesToRender() }   

        <Help
          toRender={toRenderHelp()}
          {...{ doNeedHelp: appState.doNeedHelp }}
        />
      </div>
    );
  }

  function onFirstRender() {
    setState({
      loading: true,
    });
    server.toward({
      resetTo: browseState.path,
    })
    .then(() => setState({
      loading: false,
    }));

    const curPhotoEl = document.querySelector(`.${Browse.name} .file[ind='${browseState.curPhotoInd}']`);
    if (curPhotoEl) {
      curPhotoEl.scrollIntoView();
      curPhotoEl.classList.add('curFile');
    }
  }

  function toRenderHelp() {
    return <div className="flexCenter marginBottom10">
      Открыть альбом<br></br>
      Закрыть альбом<br></br>
      Рассмотреть фото<br></br>
      Вернуть фото в альбом.<br></br>

    </div>
  }

  function getDirsToRender() {
    return dirs.map(dir => {
      return (
        <div 
          key={dir}
          name={dir}
          className="fitPreview100 dir"
          onClick={onClickDir}
        >{dir}</div>
      );
    });
  }

  function onClickDir(e) {
    setState({
      loading: true,
    });
    const subdir = e.target.getAttribute('name');
    server.toward({ subdir })
    .then(() => 
      setState({
        loading: false,
      })
    );
  }

  function onClickFile(e) {
    setBrowseState({      
      curPhotoInd: +e.target.getAttribute('ind'),
    });

    setAppState({
      action: Actions.OnePhoto.name,
    })
  }

  function getFilesToRender() {
    return files.map((file, ind) => {
      return (
        <div 
          key={file}
          className='fitPreview100 file scrollwait'
          style={{ 'backgroundImage': `url(${file})` }}
          ind={ind} 
          src={file}
          onClick={onClickFile}
        >
        </div>
      );
    });
  }  
}

function boostPerfImgRender() {
  const observer = new IntersectionObserver(cb, { threshold: 1 });
  const elements = [...(document.querySelectorAll(`.${Browse.name} .scrollwait`) || [])];
  const observe = observer.observe.bind(observer);
  elements.map(observe);

  return () => { observer.disconnect(); }

  // ------
  function cb(entries) {
    const unobserve = observer.unobserve.bind(observer);
    entries.map(e => {
      e.target.classList.remove('scrollwait');
      unobserve(e.target);
    });
  }
}

// -------------------------------------------------------

Browse.getReqProps = ({ channel }) => {
  return channel.crop({
    s: { 
      appState: 1,
      photosState: { 
        files: 1,
        dirs: 1,
      },
      browseState: 1,
    },
    d: {
      setAppState: 1,
      setBrowseState: 1,
    },
    API: {
      comps: {
        server: 1, 
      },
    },
  });
};

Browse.state = {};
Browse.setState = () => {};

Browse.getAPI = ({
  channel,
}) => {
  const props = channel.crop({
    API: {
      comps: {
        server: 1,
      }
    }
  });

  return {
    toggleRightWindow() {            
      const states = {
        0: 1,
        1: 2,
        2: 1,
      };
      
      const storageItem = 'browserCount';
      const count = sessionStorage.getItem(storageItem) || '0';
      const countUpd = states[count];
      sessionStorage.setItem(storageItem, countUpd);  
      if (count > 0) {
        window.location.reload();
      }
    },
    moveItems() {
      const {
        items,
      } = Browse.state;

      props.server.moveToPath({
        items,
      });

      Browse.setState({
        copyProgress: 0, 
      });

      checkCopyProgressWrap();

      // ---------------------------------------
      function checkCopyProgressWrap({
      } = {}) {
        props.server.$checkCopyProgress()
          .then(({
            copyProgress
          }) => {
            setTimeout(() => (copyProgress === 100 ? null : checkCopyProgressWrap()), 500);
            Browse.setState({
              copyProgress,
            });
          });
      };
    },
    async addAlbum({
      albumName
    }) {
      const res = await props.server.addAlbum({
        albumName,
      });

      if (!res) {
        Browse.setState({
          isDialogEnabled: true,
          dialogTitle: `Альбом ${albumName} уже есть!`,
        }); 
        return;               
      }

      Browse.setState({
        loading: true,
      });
      props.server.toward()
      .then(() => 
        Browse.setState({
          loading: false,
        })
      );
    },
  };
};

const stateInit = {
  copyProgress: 100,
  loading: true,
  previewWidth: 100,
  previewHeight: 100,
  isDialogEnabled: false,
  dialogTitle: '',
  forceUpdate: false,
};
