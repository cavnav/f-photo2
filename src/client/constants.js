const additionalActionsInit = {
  ExitFromAlbum: {
    title: 'Закрыть альбом',
    isActive: true,
  },
  ExitFromOnePhoto: {
    title: 'Вернуть фото',
    isActive: true,
  },
  SelectAlbum: {
    title: 'Выбрать альбом',
    isActive: false,
  },
};

export const additionalActions = Object.entries(additionalActionsInit).reduce((res, [actionName, action]) => ({ ...res, [actionName]: { name: actionName, ...action }}), {});