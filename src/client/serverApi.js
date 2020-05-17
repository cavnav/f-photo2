export const serverApi = ({ props }) => {
  const { url, userDirName } = props;
  const fullUrl = `/api/${url}`;

  switch (url) {
    case 'toward': 
      let { subdir } = props.params;
      subdir = subdir ? `?subdir=${subdir}` : '';
      return fetch(`${fullUrl}${subdir}`);
    case 'backward':
      return fetch(fullUrl);
    case 'copyPhotos':
      return fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({ userDirName })
      });

    case 'getNewPhotos':
      return fetch(fullUrl);

    case 'checkCopyProgress':
      return fetch(fullUrl);

    case 'browsePhotos':
      return fetch(fullUrl);

    case 'getUsbDevices':
      return fetch(fullUrl);

    case 'imgRotate':
      const { params } = props;
      return fetch(`${fullUrl}?${params}`);

    default: return undefined;
  }
};
