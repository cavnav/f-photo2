import {
    AppServerAPI
} from './ServerApi';
import {
    getCompsAPI, getDefaultAPI,
} from './functions';
import {
    get as _get
} from 'lodash';

import { ResumeObj } from './resumeObj';

export const channel = ChannelWrap();

function ChannelWrap(props) {
    class Channel {
        s; // states;
        d; // dispatches;
        comps = {};

        preset({
            s,
            d
        }) {
            this.s = s;
            this.d = d;
            this.server = new AppServerAPI({
                s,
                d
            });
        }

        addComp({
            name,
            render,
            resumeObj,
            getAPI,
            getReqProps,
            getComps = () => ({}),
        }) {
            const baseComp = new class ChannelComp {
                r = render.bind(this);
                name = name;
                deps = {};
                comps = undefined;
                resumeObj = resumeObj ? new ResumeObj(resumeObj) : {};

                constructor({
                    name,
                } = {}) {
                    if (name) this.name = name;
                }

                bindSetCompDeps() {
                    return this.setCompDeps.bind(this);
                }

                setCompDeps(props) {
                    Object.assign(
                        this.deps,
                        props.deps,
                    );
                }

                getComps() {
                    if (this.comps === undefined) {
                        this.comps = {
                            ...getCompsAPI(                              
                                getComps({
                                    channelComps: channel.comps,
                                })
                            ),
                        };
                    }
                    return this.comps;
                }

                clone({
                    name,
                } = {}) {
                    return new ChannelComp({
                        name,
                    });
                }

                getServer() {
                    return channel.server;
                }

                getDeps() {
                    return this.deps;
                }

                getAPI() {
                    return getAPI?.({
                            Comp: this,
                            deps: this.deps,
                        }) 
                        ?? getDefaultAPI({
                            deps: this.deps,
                        });
                }

                get(props) {
                    const res = {};
                    const additionalProps = {
                        server: channel.server,
                        comps: this.getComps(),
                    };

                    for (const prop in props) {
                        res[prop] = this[prop] || additionalProps[prop];
                    };

                    return res;
                }

                getReqProps() {
                    const res = {
                        channel,
                        deps: this.deps,
                        comps: this.getComps(),
                        resumeObj: this.resumeObj,
                    };

                    return getReqProps ? getReqProps(res) : res;
                }
            };

            this.comps[name] = baseComp;

            return baseComp;
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
                this.comps[compName] = compAPI;

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

