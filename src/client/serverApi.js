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

  // нельзя использовать function - declaration. В channel.addAPI контекст теряется.
  $share = (params) => {
    return fetch(
      this.getFullUrl({ url: 'share' }),
      new PostObjTmp({
        body: params,
      }),
    );
  }

  $saveFilesToFlash = (params) => {
    return fetch(
      this.getFullUrl({ url: 'saveFilesToFlash' }), 
      new PostObjTmp({ body: params }))
    .then(res => res.json());
  };

  imgRotate(params) {
    const url = this.getUrlWithParams({ url: this.imgRotate.name, params });
    return fetch(url)
    .then(res => res.json());
  }

  $remove = (params) => {
    const url = this.getUrlWithParams({ url: 'remove', params: {
      ...params,
      curWindow: window.name,
    }});
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
    this.navigate({ 
      url: 'backward', 
    });
  }

  toward = ({
    resetTo,
    subdir,
   } = {}) => {
    return this.navigate({ 
      url: 'toward', 
      params: { 
        subdir,
        resetTo, 
      } 
    });
  }

  navigate = ({ url, params = {} }) => {
    return fetch(
      this.getFullUrl({ url }),
      new PostObjTmp({
        body: {
          ...params,
          curWindow: window.name,
        }
      })
    )
    .then(res => res.json())
    .then((res) => {
      const { files, dirs, path } = res;
      this.d.setPhotosState({
        files,
        dirs,
      });   
      path && this.d.setBrowseState({
        path,
      }); 
    });
  }

  addAlbum = ({
    albumName,
  }) => {
    if (!albumName) return;
    return fetch(
      this.getFullUrl({
        url: 'addAlbum'
      }),
      new PostObjTmp({
        body: {
          albumName,
          curWindow: window.name,
        },
      })
    )
    .then((res) => res.json());
  };

  $moveToPath = ({
    items,
    path,
  }) => {
    return fetch(
      this.getFullUrl({
        url: 'copyToPath',
      }), 
      new PostObjTmp({      
        body: {
          items,
          path,
          curWindow: window.name,
        }
      })
    )
    .then(res => res.json());
  }

  $copyPhotos = () => {
    return fetch(this.getFullUrl({
      url: 'copyPhotos',
    }), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify({
        curWindow: window.name,
      })
    }).then(res => res.json());
  }

  $getNewPhotos = () => {
    return fetch(this.getFullUrl({ url: 'getNewPhotos' })).then(res => res.json());
  }

  $checkCopyProgress = () => {
    return fetch(
      this.getFullUrl({ 
        url: 'checkCopyProgress' 
      }))
      .then(res => res.json());
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