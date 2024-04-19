export const BTN_REMOVE = 'Удалить';
export const BTN_MOVE = 'Переместить';
export const BTN_ZOOM = 'Увеличить';
export const BTN_BACKWARD = 'Вернуться';

export function setBtnTitle({
  title,
  prefix,
}) {
  return title ? `${prefix} ${title}` : title;
}