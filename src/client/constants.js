const additionalActionsInit = {
  ExitFromAlbum: {
    title: 'Закрыть альбом',
    isActive: true,
  },
  ExitFromOnePhoto: {
    title: 'Вернуть фото',
    isActive: true,
  },
  SaveChanges: {
    title: 'Сохранить изменения',
    isActive: false,
  },
  // selectAlbum: {
  //   title: 'Выбрать альбом',
  //   isActive: false,
  // },
};

export const additionalActions = Object.entries(additionalActionsInit).reduce((res, [actionName, action]) => ({ ...res, [actionName]: { name: actionName, ...action }}), {});

export function changeAction({ action, props }) {
  Object.entries(props).map((p, v) => action[p] = v);
}