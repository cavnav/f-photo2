import { 
  AdditionalPanel,
  AdditionalActionsComps,
} from "./components/";

export const eventNames = {
  checkSameWindowPaths: 'checkSameWindowPaths',
  refreshWindow: 'refreshWindow',
};

const {
  ExitFromAlbum,
  ToggleRightWindow,
  SaveChanges,
  SavePhotosToFlash,
  ActionSharePhotos,
  ExitFromOnePhoto,
  MoveSelections,
  AddAlbum,
  RemoveSelections,
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

  [ExitFromAlbum.name] = new Action({ 
    title: 'Закрыть альбом',
    isActive: true,
    componentName: ExitFromAlbum.name,    
  });
  [ExitFromOnePhoto.name] = new Action({
    title: 'Вернуть фото',
    isActive: true,
    componentName: ExitFromOnePhoto.name,
  });  
  [SaveChanges.name] = new Action({
    title: 'Сохранить изменения',
    className: 'SaveChanges',
    isActive: false,
    componentName: SaveChanges.name,
  });
  [SavePhotosToFlash.name] = new Action({
    title: 'Записать фото на флешку',
    className: 'SaveFotosToFlash',
    isActive: true,
    componentName: SavePhotosToFlash.name,
  });
  SharePhotos = new Action({
    isActive: true,
    componentName: ActionSharePhotos.name,
  });
  [ToggleRightWindow.name] = new Action({
    isActive: true,
    componentName: ToggleRightWindow.name,
  });
  [MoveSelections.name] = new Action({
    isActive: true,
    componentName: MoveSelections.name,
  });
  [AddAlbum.name] = new Action({
    isActive: true,
    componentName: AddAlbum.name,
  });
  [RemoveSelections.name] = new Action({
    isActive: true,
    componentName: RemoveSelections.name,
  });
}

export const additionalActions = new AdditionalActions();