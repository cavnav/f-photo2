class PostObjTmp {
  constructor({ body = {} } = {}) {
    Object.assign(this, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify(body),
    });
  }  
};

export class AppServerAPI {
  constructor({ d, s }) {
    this.d = d;
    this.s = s;
  }

  getFullUrl({ url }) {
    return `/api/${url}`;
  }

  $saveFilesToFlash = (params) => {
    return fetch(this.getFullUrl({ url: 'saveFilesToFlash' }), new PostObjTmp({ body: params }))
    .then(res => res.json());
  };

  imgRotate(params) {
    const url = this.getUrlWithParams({ url: this.imgRotate.name, params });
    return fetch(url)
    .then(res => res.json());
  }

  imgRemove(params) {
    const url = this.getUrlWithParams({ url: this.imgRemove.name, params });
    return fetch(url)
    .then(res => res.json());
  }

  getUrlWithParams({
    url,
    params,
  }) {
    const urlUpd = this.getFullUrl({ url });
    const paramsUpd = this.getParams({ params });
    return `${urlUpd}${paramsUpd}`;
  }

  getParams({ params = {} }) {
    const arr = Object.entries(params)
      .filter(([name, val]) => val !== undefined)
      .map(([name, val]) => `${name}=${val}`);
    return `?${arr.join('&')}`;
  }

  backward = () => {
    this.navigate({ url: 'backward' });
    this.s.browseState.path = this.s.browseState.path.slice(0, -1);
  }

  toward = ({ subdir } = {}) => {
    this.navigate({ url: 'toward', params: { subdir } });
    this.s.browseState.path.push(subdir);
  }

  navigate = ({ url, params = {} }) => {
    fetch(this.getUrlWithParams({ url, params }))
    .then(res => res.json())
    .then((res) => {
      const { files, dirs } = res;
      this.d.setPhotosState({
        files,
        dirs,
      });    
    });
  }

  copyPhotos = () => {
    return fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify({ userDirName })
    }).then(res => res.json());
  }

  $getNewPhotos = () => {
    return fetch(this.getFullUrl({ url: 'getNewPhotos' })).then(res => res.json());
  }

  $checkCopyProgress = () => {
    return fetch(this.getFullUrl({ url: 'checkCopyProgress' })).then(res => res.json());
  }

  browsePhotos = () => {
    return fetch(fullUrl).then(res => res.json());
  }

  $getUsbDevices = (params = {}) => {
    const url = this.getUrlWithParams({ url: 'getUsbDevices', params });
    return fetch(url)
      .then(res => res.json()).then(res => { console.log('usbDevices', res); return res; });
  }
}