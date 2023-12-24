export const BTN_REMOVE = 'Удалить';
export const BTN_MOVE = 'Переместить';

export function setBtnTitle({
  title,
  prefix,
}) {
  return title ? `${prefix} ${title}` : title;
}