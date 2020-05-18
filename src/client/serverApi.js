export class AppServerAPI {
  constructor({ dispatch, states }) {
    this.dispatch = dispatch;
    this.states = states;

    this.saveChanges.imgRotate = '';
    this.saveChanges.imgDelete = '';
  }

  getFullUrl({ url }) {
    return `/api/${url}`;
  }

  saveChanges = ({ action }) => {
    const { params } = props;
    const route = getRouter();
    return fetch(`${fullUrl}?${params}`);

    serverApi({
      props: {
        url: route,
        params,
      }
    })
    .then(res => res.json())
    .then((res) => {});


    //--------------------------
    function getRouter() {

      
      return {
        
      }
    }
  }
  backward = () => {
    this.navigate({ direction: 'backward' });
    this.states.browseState.path = this.states.browseState.path.slice(0, -1);
  }
  toward = ({ subdir } = {}) => {
    this.navigate({ direction: 'toward', params: { subdir } });
    this.states.browseState.path.push(subdir);
  }
  navigate = ({ direction, params = {} }) => {
    serverApi({
      props: {
        url: direction,
        params,
      }
    })
    .then(res => res.json())
    .then((res) => {
      const { files, dirs } = res;
      this.dispatch.setPhotosState({
        files,
        dirs,
      });    
    });
  }
  toward = () => { 
    let { subdir } = props.params;
    subdir = subdir ? `?subdir=${subdir}` : '';
    return fetch(`${fullUrl}${subdir}`);
  }
  backward = () => {
    return fetch(fullUrl);
  }
  copyPhotos = () => {
    return fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify({ userDirName })
    });
  }
  getNewPhotos = () => {
    return fetch(fullUrl);
  }
  checkCopyProgress = () => {
    return fetch(fullUrl);
  }
  browsePhotos = () => {
    return fetch(fullUrl);
  }
  getUsbDevices = () => {
    return fetch(fullUrl);
  }
}