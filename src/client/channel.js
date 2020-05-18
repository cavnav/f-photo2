export class Channel {
  API = {
    Views,
    _get,
  };

  chunkProps = {
    tempReducer, 
    channel: this,
  };

  props = {};

  constructor(props) {
    this.props = { 
      ...props,
      API: this.API,
    };
    // Object.entries(props).map((p, v) => this[p] = v);
  }
  addAPI = ({ name, methods }) => {
    this.API[name] = methods;
  }
  essentials = (component) => {
    if (component.getAPI) this.addAPI(component.getAPI());
    if (component.getReqProps) return {
      ...this.chunkProps,
      ...component.getReqProps(this.props),
    };
  }
}