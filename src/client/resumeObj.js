import { 
  get as _get,
  set as _set, 
} from 'lodash';
import { updFromObj, myCrop } from './functions';

export const resumeObjConstants = {
  storageItemName:'resume',
  filesWithStatuses: 'filesWithStatuses',
  browserCount: 'browserCount',
  Browse: 'Browse',
};
export class ResumeObj {
  constructor({
    compName,
    selector = ({
      val,
    }) => ({
      [window.name]: {
        [compName]: val,
      },
    }),
  } = {}) {
    if (this.state === null) {
      this.save({
        selector: this.defAppState,
      });
    }

    Object.assign(
      this,
      {
        selector,
      },
    );    
  }

  defAppState = {
    [resumeObjConstants.browserCount]: 1,
    leftWindow: {
      // OnePhoto: {},
    },
    rightWindow: {
    },
    [resumeObjConstants.filesWithStatuses]: {},
    // [Print.name]: {},
    // [Share.name]: {},
  };

  save({ 
    stateUpd, 
    selector,
  }) { 
    localStorage.setItem(
      resumeObjConstants.storageItemName, 
      JSON.stringify(
        updFromObj({
          obj: { ...this.state },
          objUpd: selector || this.selector({
            val: stateUpd,
          })
        }),
      ),
    );
  }

  load({
    selector = 1,
  } = {}) {
    return myCrop({
      from: { ...this.state },
      selector: this.selector({
        val: selector,
      }),
    });
  }

  get state() {
    return JSON.parse(localStorage.getItem(resumeObjConstants.storageItemName));
  }  
}