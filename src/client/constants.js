export const additionalActions = {
  ExitFromAlbum() { 
    return {
      title: 'Закрыть альбом',
      isActive: true,
    };
  ExitFromOnePhoto: {
    title: 'Вернуть фото',
    isActive: true,
  },
  SaveChanges: {
    title: 'Сохранить изменения',
    isActive: false,
    onAction: {
      api: undefined,
      params: undefined,
    }
  }

  changeAction({
    actionUpd,
    set,
  }) {
    Object.entries(set).map(([p, v]) => actionUpd[p] = v);
  }
};

  // selectAlbum: {
  //   title: 'Выбрать альбом',
  //   isActive: false,
  // },

Object.keys(additionalActionsInit).map(name => additionalActionsInit[name].name = name);