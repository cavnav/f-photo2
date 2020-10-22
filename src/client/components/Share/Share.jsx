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
  Share.selectedAddresses = React.useRef([]);
  Share.printState = printState;

  const [state, setState] = React.useReducer(tempReducer, getInitState());

  const onChangeShareTitle = React.useCallback((shareTitle) => {
    setState({
      shareTitle,
    });
  }, []);

  return (
    <div className="Share">
      <div>2020-10-11</div>
      <div>Кому</div>
      <Selector
        selectedAddresses={Share.selectedAddresses.current}
        options={ADDRESSEES}
      ></Selector>
      <div>Сообщение</div>
      <div>
        <Input 
          placeholder="подпиши фото"
          allowClear
          onChange={onChangeShareTitle}
          value={state.shareTitle}
        ></Input>
      </div>
      { renderItems() }
    </div>
  );

  function renderItems() {
    const toRender = Object.entries(printState)
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
    names: Share.selectedAddresses.current.map((item) => ({
      name: item,
      title: 'Извини, тест',
    })),
    ...flatPrintState(Share),
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

function getInitState() {
  return {
    shareTitle: '',
  };
}