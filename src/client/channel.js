import { AppServerAPI } from './ServerApi';
import { getTempReducer } from './functions';
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
      api: new AppServerAPI({ s, d }),
      apiName: 'server',
    });
  }
  addAPI = ({ api, apiName }) => {
    const name = apiName || api.name || api.constructor.name;
    this.API[name] = api;
  }
  essentials = (component) => {
    if (component.getAPI) this.addAPI(component.getAPI());
    if (component.getReqProps) return {
      channel: this,
      getTempReducer,
      ...component.getReqProps(this),
    };
  }
  crop({ path, stack, res = {} }) {
  // По заданному пути возвращает соответствующие значения this.
    if (stack && stack.length === 0) return res;
    if (!stack) stack = Object.entries(path).map(e => e.concat(this[e[0]])); // add link to source val.
    let [[propName, prop, sourceVal, alias = prop]] = stack;
    if (prop.constructor !== Object) res[prop === 1 ? propName : alias] = sourceVal;
    else stack.push(...Object.entries(prop).map(e => e.concat(sourceVal[e[0]])));
    return this.crop({ path: prop, stack: stack.slice(1), res });
  }
}