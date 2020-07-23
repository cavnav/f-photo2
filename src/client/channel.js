import { AppServerAPI } from './ServerApi';
import { tempReducer } from './functions';
import { get as _get } from 'lodash';

export class Channel {
  channel = this;
  s; // states;
  d; // dispatches;
  API = {
    _get,
    comps: new Proxy({}, {
      get(target, prop) {
        return _get(target, [prop], {});
      },
    }),
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
    Object.entries(props).map(([p, val]) => comps[p] = val);
  }
  essentials = (component, { parentProps = {} } = {}) => {
    if (component.getAPI) this.addAPI({
      [component.name]: component.getAPI(), 
    });
    if (component.getReqProps) return {
      channel: this,
      tempReducer,
      ...component.getReqProps({ channel: this, parentProps }),
    };
  }
  crop(source, context, { stack, res = {} } = {}) {
  // По заданному пути возвращает соответствующие значения this.
    if (stack && stack.length === 0) return res;
    if (!stack) {
      const contextUpd = context ? { channel: this, ...context } : this;
      stack = Object.entries(source).map(e => push(e, contextUpd[e[0]])); // add link to source val.
    }
    let [[propName, prop, sourceVal, alias = prop]] = stack;
    if (prop.constructor !== Object) res[prop === 1 ? propName : alias] = sourceVal;
    else stack.push(...Object.entries(prop).map(e => push(e, sourceVal[e[0]])));
    return this.crop(null, null, { stack: stack.slice(1), res });
  }
}

function push(a, v) { a.push(v); return a; }