import { AppServerAPI } from './ServerApi';
import { tempReducer } from './functions';
import { get as _get } from 'lodash';

export class Channel {
  channel = this;
  s; // states;
  d; // dispatches;
  API = {
    _get,
    comps: {},
  };

  constructor({ s, d }) {
    this.s = s;
    this.d = d;
    this.addAPI({ 
      server: new AppServerAPI({ s, d }),
    });
  }
  addAPI = (props) => {
    const comps = this.API.comps;
    Object.entries(props).map(([p, val]) => Object.assign(comps[p] || (comps[p] = {}), val));
  }
  essentials = (component, { parentProps = {} } = {}) => {
    if (component.getAPI) this.addAPI({
      [component.name]: component.getAPI(), 
    });
    if (component.getReqProps) return {
      channel: this,
      tempReducer,
      ...component.getReqProps({ 
        channel: this, 
        parentProps,
      }),
    };
  }
  crop(source, context, { stack, res = {} } = {}) {
  // По заданному пути возвращает соответствующие значения this.    
    if (stack && stack.length === 0) return res;
    if (!stack) {
      // TODO убрать контекст из параметров, связав в .essentials с this.
      const contextUpd = context ? { channel: this, ...context } : this;
      stack = Object.entries(source).map(e => push(e, contextUpd[e[0]])); // add link to sourceVal.
    }
    let [[propName, prop, sourceVal, alias = prop]] = stack;
    // 
    if (prop.constructor !== Object) res[prop === 1 ? propName : alias] = sourceVal;
    else stack.push(...Object.entries(prop).map(e => push(e, subscribe.call(this, { comp: e, propName, sourceVal: sourceVal[e[0]] }))));
    return this.crop(null, null, { stack: stack.slice(1), res });

    // ------------------------
    function subscribe({ comp: [compName, compAPI], propName, sourceVal }) {
      if (sourceVal !== undefined) return sourceVal;
      if (propName !== 'comps') return sourceVal;

      const compAPIupd = {};
      Object.keys(compAPI).forEach(APIname => compAPIupd[APIname] = (...args) => compAPIupd[APIname](...args));
      this.API.comps[compName] = compAPIupd;
      
      return compAPIupd;
    }

    function push(a, v) { a.push(v); return a; }

  }
}