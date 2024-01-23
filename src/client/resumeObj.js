import { myCrop } from './functions';
import { get as _get, set as _set } from 'lodash';

export const STORAGE_ITEM = 'resume';
const KEY_BROWSER_COUNT = 'browserCount';

export class ResumeObj {
    defAppState = {
        sep: '\\',
        [KEY_BROWSER_COUNT]: 1,
        leftWindow: {
            // OnePhoto: {},
        },
        rightWindow: undefined,
        // [Print.name]: {},
        // [Share.name]: {},
    };

    constructor(
        props = {},
    ) {

        const {
            selector = [],
            val,
        } = props;

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
            STORAGE_ITEM,
            JSON.stringify(
                val,
            ),
        );
    }

    saveMerge({
        val,
    }) {
        localStorage.setItem(
            STORAGE_ITEM,
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
        const storage = localStorage.getItem(STORAGE_ITEM);
        return storage ? JSON.parse(storage) : this.defAppState;
    }
}
