export class AppServerAPI {
  constructor({ d, s }) {
    this.d = d;
    this.s = s;
  }

  getFullUrl({ url }) {
    return `/api/${url}`;
  }

  imgRotate(params) {
    const url = this.getUrlWithParams({ method: this.imgRotate, params });
    fetch(url)
    .then(res => res.json())
    .then(res => {});
  }

  imgDelete() {
    this.saveChanges({

    });
  }

  getUrlWithParams({
    method,
    params,
  }) {
    const url = this.getFullUrl({ url: method.name });
    const params = this.getParams({ params });
    return `${url}${params}`;
  }

  getParams({ params }) {
    const arr = [];
    Object.entries(params).map((name, val) => arr[`${name}=${val}`]);
    return `?${arr.join('&')}`;
  }

  backward = () => {
    this.navigate({ direction: this.backward.name });
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
      this.d.setPhotosState({
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