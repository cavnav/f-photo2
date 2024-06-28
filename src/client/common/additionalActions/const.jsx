export const BTN_REMOVE = 'Удалить';
export const BTN_MOVE = 'Переместить';
export const BTN_ZOOM_INC = 'Увеличить';
export const BTN_ZOOM_DEC = 'Уменьшить';
export const BTN_BACKWARD = 'Вернуться';
export const BTN_IMAGE_INFO = 'Инфо';

export function setBtnTitle({
  title,
  prefix,
}) {
  return title ? `${prefix} ${title}` : title;
}