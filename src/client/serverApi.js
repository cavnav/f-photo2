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

  getAppData = () => {
    return fetch(
      this.getFullUrl({
        url: 'appData',
      })
    )
    .then(res => res.json());
  }

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

  backward = ({
    url = 'backward',
  } = {}) => {
    return this.navigate({ 
      url, 
    });
  }

  resetNavigation = ({
    curWindow,
  }) => {
    return fetch(
      this.getFullUrl({ url: 'resetNavigation' }),
      new PostObjTmp({
        body: {
          resetTo: '',
          curWindow,
        }
      })
    );
  }

  savePrinted = ({
    dest,
    files,
  }) => {
    return fetch(
      this.getFullUrl({
        url: 'savePrinted',
      }),
      new PostObjTmp({
        body: {
          dest,
          files,
        },
      }),
    ); 
  };

  towardPrinted = (props) => this.toward({
    ...props,
    url: 'towardPrinted',
  });

  backwardPrinted = (props) => this.toward({
    ...props,
    url: 'backwardPrinted',
  });

  toward = ({
    resetTo,
    dir,
    curWindow,
    url = 'toward',
   } = {}) => {
    return this.navigate({ 
      url, 
      params: { 
        dir,
        resetTo, 
        curWindow,
      } 
    });
  }

  navigate = ({ url, params = {} }) => {
    return fetch(
      this.getFullUrl({ url }),
      new PostObjTmp({
        body: {
          ...params,
          ...(!params.curWindow && { curWindow: window.name }),
        },
      })
    )
    .then(res => res.json())    
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

  removeItems = ({
    items = [],
  }) => {
    if (items.length === 0) return;
    return fetch(
      this.getFullUrl({
        url: 'removeItems'
      }),
      new PostObjTmp({
        body: {
          items,
          curWindow: window.name,
        },
      })
    )
    .then((res) => res.json());
  };

  moveToPath = ({
    items,
    destWindow,
  }) => {
    return fetch(
      this.getFullUrl({
        url: 'moveToPath',
      }), 
      new PostObjTmp({      
        body: {
          items,
          destWindow,
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

  $getUsbDevices = (params = {}) => {
    const url = this.getUrlWithParams({ url: 'getUsbDevices', params });
    return fetch(url)
      .then(res => res.json()).then(res => { console.log('usbDevices', res); return res; });
  }
}