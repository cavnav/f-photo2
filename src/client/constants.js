import { 
  ExitFromAlbum,
  ExitFromOnePhoto,
  SaveChanges
} from "./components/index";

export const additionalActions = {
  ExitFromAlbum: { 
    title: 'Закрыть альбом',
    isActive: true,
    component: ExitFromAlbum,
  },
  ExitFromOnePhoto: {
    title: 'Вернуть фото',
    isActive: true,
    component: ExitFromOnePhoto,
  },
  SaveChanges: {
    title: 'Сохранить изменения',
    isActive: false,
    onAction: {
      api: undefined,
      onResolve: () => {},
    },
    component: SaveChanges,
  },
  changeAction({
    actionUpd,
    set,
  }) {
    Object.entries(set).map(([p, v]) => actionUpd[p] = v);
  }
};

Object.keys(additionalActionsInit).map(name => additionalActionsInit[name].name = name);