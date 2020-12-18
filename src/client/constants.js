import { 
  AdditionalPanel,
  AdditionalActionsComps,
} from "./components/";

const {
  ExitFromAlbum,
  ToggleRightWindow,
  SaveChanges,
  SavePhotosToFlash,
  ActionSharePhotos,
  ExitFromOnePhoto,
  MoveItems,
} = AdditionalActionsComps;
class Action {
  constructor(props) {
    Object.entries(props).map(([propName, prop]) => {
      this[propName] = prop;
    });
  }
  change({    
    set,
    needApply = true,
  }) {
    Object.entries(set).map(([p, v]) => this[p] = v);
    if (needApply) AdditionalPanel.forceUpdate();
  }

  reset() {
    const defaultStruct = {
      isActive: false,
      onAction: {
        API: undefined,
      },
    };
    Object.assign(this, defaultStruct);
    AdditionalPanel.forceUpdate();
  }
}
class AdditionalActions {
  constructor() {
    Object.entries(this)
    .map(([actionName, action]) => {
      action.name = actionName;
      if (action.onAction === undefined) {
        action.onAction = {
        };
      }
    });
  }

  ExitFromAlbum = new Action({ 
    title: 'Закрыть альбом',
    isActive: true,
    componentName: ExitFromAlbum.name,    
  });
  ExitFromOnePhoto = new Action({
    title: 'Вернуть фото',
    isActive: true,
    componentName: ExitFromOnePhoto.name,
  });  
  SaveChanges = new Action({
    title: 'Сохранить изменения',
    className: 'SaveChanges',
    isActive: false,
    componentName: SaveChanges.name,
  });
  SavePhotosToFlash = new Action({
    title: 'Записать фото на флешку',
    className: 'SaveFotosToFlash',
    isActive: true,
    componentName: SavePhotosToFlash.name,
  });
  SharePhotos = new Action({
    isActive: true,
    componentName: ActionSharePhotos.name,
  });
  ToggleRightWindow = new Action({
    isActive: true,
    componentName: ToggleRightWindow.name,
  });
  MoveItems = new Action({
    isActive: true,
    componentName: MoveItems.name,
  })
}

export const additionalActions = new AdditionalActions();