import React from 'react';
import { getFileDateSrcKey, tempReducer } from '../../functions';
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

export function Share({
  printState,
}) {
  const [state, setState] = React.useReducer(tempReducer, getInitState({
    printState,
  }));

  Share.state = state;

  const onRemoveFile = React.useCallback((e) => {
    const fileElement = e.target;
    const printStateUpd = state.printState.
    setState({
      printState: printStateUpd,
    })
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
              Object.entries(photo).map(([fileSrc, status]) => { 
                const key = getFileDateSrcKey({date, fileSrc});         
                return <div 
                  className="rowData"
                  key={key}
                  date={date}
                  photosrc={fileSrc}
                >
                  <div
                    className='fitPreview100 file marginRight10'
                    style={{ 'backgroundImage': `url(${fileSrc})` }}
                  >
                  </div>              
                  <input 
                    type="button" 
                    keyid={key}
                    className="marginRight10" 
                    onClick={onRemoveFile} 
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
  return {
    date,
    files: Object.keys(printState),
  };
}

function getInitState({
  printState,
}) {
  const [[date, filesMeta]] = Object.entries(printState);
  return {
    printState: { ...filesMeta },
    filesTitle: '',
  };
}