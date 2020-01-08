export const serverApi = ({ props }) => {
  const { url } = props;
  switch (url) {
    case 'copyPhotos':
      return fetch('/api/CopyPhotos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({})
      });
  }
};
