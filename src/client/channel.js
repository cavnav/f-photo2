import { AppServerAPI } from './ServerApi';
export class Channel {
  channel = this;
  tempReducer = tempReducer;
  sd = {}; // states & dispatches.
  API = {
    Views,
    _get,
  };

  constructor(sd) {
    this.sd = sd;
    this.addAPI({ 
      api: new AppServerAPI(sd),
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
      ...this.chunkProps,
      ...component.getReqProps(this),
    };
  }
  crop(props) {
    // Позволяет в методе Component.getReqProps перечислять названия требуемых свойств и методов один раз.
    const propsCropped = {};
    return propsCropped;
  }
}