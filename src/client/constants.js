import { 
  ExitFromAlbum,
  ExitFromOnePhoto,
  SaveChanges,
  AdditionalPanel,
} from "./components/index";

class Action {
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
  }
}
class AdditionalActions extends Action {
  constructor() {
    super();
    
    Object.keys(this)
    .filter(k => k.constructor === Object)
    .map(name => {
      this[name].name = name;
      this.onAction = {
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