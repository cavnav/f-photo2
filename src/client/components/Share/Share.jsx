import React from 'react';
import { getFileDateSrcKey, tempReducer } from '../../functions';
import { Selector } from '../';

const ADDRESSEES = [
  'Мамао', 
  'Мама', 
  'Минаев', 
  'Феликс',
  'Любимая',
  'ГорячеваЛариса',
  'Вика',
  'Женя',
  'Эля',
  'Польза',
];

export function Share({
  PhotoStatusesAPI,
}) {
  const [state, setState] = React.useReducer(tempReducer, getInitState({
    filesWithStatuses: PhotoStatusesAPI.getFilesWithStatuses(),
  }));

  Object.assign(
    Share,
    getFilesSrc,
    getFilesTitle,
    getAdresses,
  );

  const onCancelShare = React.useCallback((e) => {
    const fileElement = e.target;
    const fileSrc = fileElement.getAttribute('keyid');
    const file = state.files[fileSrc];
    file.setToShare({
      flag: false,
    });
    setState({
      forceUpdate: !state.forceUpdate,
    });
  }, []);

  const onChangeFilesTitle = React.useCallback((e) => {
    setState({
      filesTitle: e.target.value,
    });
  }, []);

  const onChangeAddresses = React.useCallback(({
    selectedItems,
  }) => {
    setState({
      addresses: selectedItems,
    });
  }, []);

  return (
    <div className="Share">
      <div>2020-10-11</div>
      <div>Кому</div>
      <Selector
        onChange={onChangeAddresses}
        options={ADDRESSEES}
      ></Selector>
      <div>Сообщение</div>
      <div>
        <input 
          placeholder="подпиши фото"
          allowClear
          onChange={onChangeFilesTitle}
          value={state.filesTitle}
        />
      </div>
      { renderItems() }
    </div>
  );

  function renderItems() {
    return (
      <div className="PrintItems">
        {
          Object.entries(state.files)
          .map(([fileSrc, { toShare }]) => {
            return (          
              <div 
                className="rowData"
                key={fileSrc}
                photosrc={fileSrc}
              >
                <div
                  className='fitPreview100 file marginRight10'
                  style={{ 
                    'backgroundImage': `url(${fileSrc})`,
                    'opactity': toShare === true ? 1 : 0.3, 
                  }}
                >
                </div>              
                <input 
                  type="button" 
                  keyid={fileSrc}
                  className="marginRight10" 
                  onClick={onRemoveFile} 
                  value={toShare === true ? "Отменить" : "Подтвердить"} />
              </div>
            )
          })
        }
      </div>
    );
  }

  function getFilesSrc() {
    return Object.keys(state.filesWithStatuses);
  } 
  function getFilesTitle() {
    return state.filesTitle;
  }
  function getAdresses() {
    return state.addresses;
  }
}

Share.getReqProps = (
) => {
  return {};
}

Share.getAPI = () => ({
  getItems: () => ({
    names: Share.getAddresses().map((item) => ({
      name: item,
      title: Share.getFilesTitle(),
    })),
    files: Share.getFilesSrc(),
  })
});

function getInitState({
  filesWithStatuses,
}) {
  return {
    filesWithStatuses,
    filesTitle: '',
    addresses: [],
    forceUpdate: false,
  };
}