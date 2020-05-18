export const changesToSave = {
  imgRotate({ 
    isActive,
    params,
  }) {
    channel.API.AdditionalPanel.changeAction({
      action: additionalActions.SaveChanges,
      set: {
        isActive,
        params,
      },
      
    });
  },
  imgDelete() {

  },
}
export const additionalActions = {
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
    onAction: appServerAPI.saveChanges,
    params: {},
  }
};

  // selectAlbum: {
  //   title: 'Выбрать альбом',
  //   isActive: false,
  // },

Object.keys(additionalActionsInit).map(name => additionalActionsInit[name].name = name);