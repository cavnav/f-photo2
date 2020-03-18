export const serverApi = ({ props }) => {
  const { url, userDirName } = props;
  const fullUrl = `/api/${url}`;

  switch (url) {
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

    default: return undefined;
  }
};
