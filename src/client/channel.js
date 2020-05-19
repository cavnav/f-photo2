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
    this.addAPI(new AppServerAPI(sd));
  }
  addAPI = ({ api }) => {
    const name = api.name || api.constructor.name;
    this.API[name] = api;
  }
  essentials = (component) => {
    if (component.getAPI) this.addAPI(component.getAPI());
    if (component.getReqProps) return {
      ...this.chunkProps,
      ...component.getReqProps(this),
    };
  }
}