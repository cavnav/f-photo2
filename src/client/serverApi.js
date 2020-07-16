export class AppServerAPI {
  constructor({ d, s }) {
    this.d = d;
    this.s = s;
  }

  getFullUrl({ url }) {
    return `/api/${url}`;
  }

  savePhotosToFlash = (params) => {
    const url = this.getUrlWithParams({ url: this.savePhotosToFlash.name, params });
    return fetch(url)
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

  getParams({ params }) {
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

  getUsbDevices = (params) => {
    const url = this.getUrlWithParams({ url: this.getUsbDevices.name, params });
    return fetch(url)
      .then(res => res.json());
  }
}