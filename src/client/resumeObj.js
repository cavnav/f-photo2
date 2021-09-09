import { myCrop, updFromObj } from './functions';
import { get as _get, set as _set } from 'lodash';

export const resumeObjConstants = {
  storageItemName:'resume',
  browserCount: 'browserCount',
};
export class ResumeObj {
  constructor(
    props = {},
    {
      selector = [],
      val,
    } = props,
  ) {

    this.selector = selector;
    if (this.state === null) {
      this.saveCore({
        val: this.defAppState,
      });      
    }   
    
    if (Object.keys(this.get()).length === 0 &&
      props.hasOwnProperty('selector') && 
      props.hasOwnProperty('val')
    ) {
      this.save({
        val,
      });
    }
  }

  save({ 
    val, 
    selector = this.selector,
  }) { 
    const resumeObj = this.state;
    const selectorObj = _get(
      resumeObj,
      selector,  
      {},    
    ); 
    Object.assign(
      selectorObj,
      val,
    ); 
    _set(
      resumeObj,
      selector,
      selectorObj,
    );

    this.saveCore({
      val: resumeObj,
    });
  }

  saveCore({
    val,
  }) {
    localStorage.setItem(
      resumeObjConstants.storageItemName, 
      JSON.stringify(
        val,
      ),
    );
  }

  saveMerge({
    val,
  }) {
    localStorage.setItem(
      resumeObjConstants.storageItemName,
      JSON.stringify({
        ...this.state,
        ...val,
      }),
    );
  }

  load({
    selector,
  }) {
    return myCrop({
      from: this.state,
      selector,
    });
  }

  get({
    selector = this.selector,
    defVal = {},
  } = {}) {
    return _get(
      this.state,
      selector,
      defVal,
    );
  }

  get state() {
    return JSON.parse(localStorage.getItem(resumeObjConstants.storageItemName));
  }  

  defAppState = {
    [resumeObjConstants.browserCount]: 1,
    leftWindow: {
      // OnePhoto: {},
    },
    rightWindow: {
    },
    // [Print.name]: {},
    // [Share.name]: {},
  };
}
