export const EVENT_NAMES = {
    checkSameWindowPaths: 'checkSameWindowPaths',
    refreshWindow: 'refreshWindow',
    exitFolder: 'exitFolder'
};

export const LAST_ELEMENT = 'last-element';

export const SEP = '/';

class BrowseItemTypes {
    constructor({id}) {
        for (const item of id) {
            this[item] = item;
        }
    }    
}

export const BROWSE_ITEM_TYPES = new BrowseItemTypes({
    id: [
        'file',
        'folder',
    ],
});
