import { 
  ExitFromAlbum,
  ExitFromOnePhoto,
  SaveChanges,
  AdditionalPanel,
} from "./components/index";

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
      action.onAction = {
       API: undefined,
      };
    });
  }

  ExitFromAlbum = new Action({ 
    title: 'Закрыть альбом',
    isActive: true,
    component: ExitFromAlbum,    
  });
  ExitFromOnePhoto = new Action({
    title: 'Вернуть фото',
    isActive: true,
    component: ExitFromOnePhoto,
  });  
  SaveChanges = new Action({
    title: 'Сохранить изменения',
    className: 'SaveChanges',
    isActive: false,
    component: SaveChanges,
  });
}

export const additionalActions = new AdditionalActions();