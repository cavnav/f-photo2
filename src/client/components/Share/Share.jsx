import React from 'react';
import { getPhotoDataKey, tempReducer } from '../../functions';
import { Selector } from '../';
import { Input } from 'antd';

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

// export const Share = React.memo(ShareFn);

export function Share({
  printState,
}) {
  const [state, setState] = React.useReducer(tempReducer, getInitState({
    printState,
  }));

  Share.state = state;

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
        <Input 
          placeholder="подпиши фото"
          allowClear
          onChange={onChangeFilesTitle}
          value={state.filesTitle}
        ></Input>
      </div>
      { renderItems() }
    </div>
  );

  function renderItems() {
    const toRender = Object.entries(state.printState)
      .map(([date, photo]) => {
      return (
        <>
          <div className="PrintItems">
            {
              Object.entries(photo).map(([photoSrc, status]) => { 
                const key = getPhotoDataKey({date, photoSrc});         
                return <div 
                  className="rowData"
                  key={key}
                  date={date}
                  photosrc={photoSrc}
                >
                  <div
                    className='fitPreview100 file marginRight10'
                    style={{ 'backgroundImage': `url(${photoSrc})` }}
                  >
                  </div>              
                  <input 
                    type="button" 
                    className="marginRight10" 
                    onClick={() => {}} 
                    value="Удалить" />
                </div>
              })
            }
          </div>
        </>
      );
    });

    return toRender;
  }
}

Share.getReqProps = ({ 
  channel,
}) => {
  return channel.crop({
    s: {
      printState: 1,
    }
  });
}

Share.getAPI = () => ({
  getItems: () => ({
    names: Share.state.addresses.map((item) => ({
      name: item,
      title: Share.state.filesTitle,
    })),
    ...flatPrintState(Share.state),
  })
});

function flatPrintState({
  printState,
}) {
  const [[date, filesMeta]] = Object.entries(printState);
  return {
    date,
    files: Object.keys(filesMeta),
  };
}

function getInitState({
  printState,
}) {
  return {
    printState: { ...printState },
    filesTitle: '',
  };
}