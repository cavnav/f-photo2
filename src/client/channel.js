import {
  AppServerAPI
} from './ServerApi';
import {
  tempReducer
} from './functions';
import {
  get as _get
} from 'lodash';

export const channel = ChannelWrap();

function ChannelWrap(props) {
  class Channel {
    s; // states;
    d; // dispatches;
    comps = {};
    API = {
      _get,
      comps: {},
    };

    preset({
      s,
      d
    }) {
      this.s = s;
      this.d = d;
      this.addAPI({
        server: new AppServerAPI({
          s,
          d
        }),
      });
    }

    addAPI = (compAPI) => {
      const comps = this.API.comps;
      Object.entries(compAPI).map(([newComp, api]) => Object.assign(comps[newComp] || (comps[newComp] = {}), api));
    }

    addComp({
      fn,
      getAPI,
      getReqProps,
    }) {
      // For getting CompAPI from channel.comps.
      fn.API = {
        [fn.name]: {
          API: `${fn.name}API`,
        },
      };

      const baseComp = getNewChannelComp({
        comp: fn,
        getAPI,
        getReqProps,
      });
      this.comps[fn.name] = baseComp;
      fn.baseComp = baseComp;

      return baseComp;
    }

    essentials = (component, {
      parentProps = {}
    } = {}) => {
      if (component.getAPI) this.addAPI({
        [component.name]: component.getAPI({
          channel: this,
        }),
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
    crop(
      source, 
      context, 
      {
        stack,
        res = {}
      } = {},
    ) {
      // По заданному пути возвращает соответствующие значения this.    
      if (stack && stack.length === 0) return res;
      if (!stack) {
        // TODO убрать контекст из параметров, связав в .essentials с this.
        const contextUpd = context ? {
          channel: this,
          ...context
        } : this;
        stack = Object.entries(source).map(e => push(e, contextUpd[e[0]])); // add link to sourceVal.
      }
      let [
        [propName, prop, sourceVal, alias = prop]
      ] = stack;
      // 
      if (prop.constructor === Function) Object.assign(
        res,
        prop(sourceVal),
      );
      else if (prop.constructor !== Object) res[prop === 1 ? propName : alias] = sourceVal;
      else stack.push(...Object.entries(prop).map((e) => {
        if (
          sourceVal[e[0]] !== undefined ||
          propName !== 'comps'
        ) return push(e, sourceVal[e[0]]);

        return push(e, subscribe.call(this, {
          compName: e[0]
        }));
      }));

      return this.crop(
        null, 
        null, 
        {
          stack: stack.slice(1),
          res,
        }
      );


      // ------------------------
      function subscribe({
        compName
      }) {
        // Create object with methods wrapper which will be rewriten with real API methods.    
        const compAPI = {};
        // Object.keys(compAPI).forEach(methodName => compAPI[methodName] = (...args) => compAPI[methodName](...args));
        this.API.comps[compName] = compAPI;

        return compAPI;
      }

      function push(a, v) {
        a.push(v);
        return a;
      }

    }
  }

  return new Channel(props);
}

function getCompDeps(props = {}) {
  if (
    props.hasOwnProperty('compId') && 
    this.depends[props.compId] === undefined
  ) {
    return this.depends[props.compId] = {};
  } 
  return this.depends[props.compId] || this.depends.default;
} 

function setCompDeps(props) {
  Object.assign(
    this.getCompDeps(props),
    props?.deps,
  );
}

function createSetCompDeps(props) {
  const that = this;
  return ({
    deps,
  }) => {        
    that.setCompDeps({
      ...(props.compId && { compId: props.compId }),
      deps,
    });
  };
}

function crop({
    from, 
    selector,
    stack,
    res = [],
}) {   
  if (stack && stack.length === 0) return res;
  if (!stack) {       
    stack = getSelectorItems({
        from,
        selector,
    });
  }
  let [
    [
        propName, 
        propVal, 
        sourceVal, 
        alias = propVal,
    ]
  ] = stack;

  if (propVal.constructor !== Object) {
    res[propVal === 1 ? propName : alias] = sourceVal;          
  }
  else {
    stack.push(...getSelectorItems({
        from: sourceVal,
        selector: propVal,              
    }));
  }

  return crop({
    stack: stack.slice(1),
    res,
  });
}      
  
  
function getSelectorItems({
  selector,
  from,
}) {
  return Object.entries(selector).map((item) => {
    const [propName, propVal] = item;
    return [
      propName,
      propVal,
      from[propName],
    ];
  });
}

function getNewChannelComp({
  comp,
  getAPI,
  getReqProps,
}) {
  return new class ChannelComp {
    deps = {};
    setCompDeps = (props) => {
      Object.assign(
        this.deps,
        props.deps,
      );
    };

    replicate() {
      return {
        comp,
        chComp: new ChannelComp(),
      };
    }

    getDeps() {
      return this.deps;
    }
  
    getAPI() {
      return getAPI({
        deps: this.deps,
      });
    }

    getReqProps() {
      return getReqProps({
        deps: this.deps,
      });
    }
  }
}