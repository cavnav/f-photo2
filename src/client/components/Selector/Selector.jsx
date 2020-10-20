import React from 'react';
import { Select } from 'antd';
import { tempReducer } from '../../functions';



export const Selector = React.memo(function ({
  allowClear = true,
  hideOptions = true,
  options = [],
  placeHolder = 'Нажми, чтобы выбрать',
  selectedAddresses,
}) {

  const [state, setState] = React.useReducer(tempReducer, {
    selectedItems: [],
  });

  const handleChange = React.useCallback((selectedItems) => {
    setState({ selectedItems });
  }, []);
  const onSelectAll = React.useCallback(() => setState({
    selectedItems: options,
  }));

  React.useEffect(() => {
    Object.assign(selectedAddresses, state.selectedItems);
  }, [state.selectedItems]);

  const { selectedItems } = state;
  const filteredOptions = hideOptions ? options.filter(o => !selectedItems.includes(o)) : [];
  return (
    <>
      <input type="button" value="Выбрать все" onClick={onSelectAll} />
      <Select
        mode="multiple"
        allowClear={allowClear}
        placeholder={placeHolder}
        value={selectedItems}
        onChange={handleChange}
        style={{ width: '100%' }}
        size="large"
      >
        {filteredOptions.map(item => (
          <Select.Option key={item} value={item}>
            {item}
          </Select.Option>
        ))}
      </Select>
    </>
  );
});