import { AppServerAPI } from './ServerApi';
import { tempReducer } from './functions';
import { get as _get } from 'lodash';

export class Channel {
  channel = this;
  API = {
    _get,
  };

  constructor({ s, d }) {
    this.s = s;
    this.d = d;
    this.addAPI({ 
      server: new AppServerAPI({ s, d }),
    });
  }
  addAPI = (props) => {
    const API = this.API;
    Object.entries(props).map(([p, val]) => API[p] = val);
  }
  essentials = (component) => {
    if (component.getAPI) this.addAPI({
      [component.name]: component.getAPI(), 
    });
    if (component.getReqProps) return {
      channel: this,
      tempReducer,
      ...component.getReqProps(this),
    };
  }
  crop({ path, stack, res = {} }) {
  // По заданному пути возвращает соответствующие значения this.
    if (stack && stack.length === 0) return res;
    if (!stack) stack = Object.entries(path).map(e => push(e, this[e[0]])); // add link to source val.
    let [[propName, prop, sourceVal, alias = prop]] = stack;
    if (prop.constructor !== Object) res[prop === 1 ? propName : alias] = sourceVal;
    else stack.push(...Object.entries(prop).map(e => push(e, sourceVal[e[0]])));
    return this.crop({ path: prop, stack: stack.slice(1), res });
  }
}

function push(a, v) { a.push(v); return a; }