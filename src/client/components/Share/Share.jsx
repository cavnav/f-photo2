import React from 'react';
import { getPhotoDataKey } from '../../functions';
import { Selector } from '../';

const ADDRESSEES = [
  'Мамао', 
  'Мама', 
  'Минаев', 
  'Феликс',
  'Любимая',
  'Лариса',
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

  return (
    <div className="Share">
      <div>2020-10-11</div>
      <Selector
        selectedAddresses={Share.selectedAddresses.current}
        options={ADDRESSEES}
      ></Selector>
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
  getItems: () => {
    const {
      date,
      filesMeta,
    } = flatPrintState(Share);

    return {
      names: Share.selectedAddresses.current,
      filesMeta,
      date,
    };
  }
});

function flatPrintState({
  printState,
}) {
  const [[date, filesMeta]] = Object.entries(printState);
  return {
    date,
    filesMeta,
  };
}