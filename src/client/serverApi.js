import { loader, notifyServerError } from "./functions";

class PostObjTmp {
	constructor({ body = {} } = {}) {
		Object.assign(this, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json;charset=utf-8'
			},
			body: JSON.stringify(body),
		});
	}
};

function fetchUpd(...params) {
	return fetch.apply(null, params)
	.then(async (result) => {
		const json = await result.json();
		if (json.error) {
			raiseError({error: json.error});
		}
		return json;
	})
	.catch((error) => raiseError({error}));	



	function raiseError({error}) {
		notifyServerError(error);

		throw error;
	}
}

function fetchWithLoader(...params) {
	const timerId = setTimeout(() => loader({isActive: true}), 500);

	return fetchUpd(...params)
		.then((response) => {
			clearTimeout(timerId);
			loader({isActive: false});

			return response;
		});
}

export class AppServerAPI {
	getFullUrl({ url }) {
		return `/api/${url}`;
	}

	// не смог использовать function - declaration. В channel.addAPI контекст теряется.

	share = (params) => {
		return fetchWithLoader(
			this.getFullUrl({ url: 'share' }),
			new PostObjTmp({
				body: params,
			}),
		);
	}

	getSharedRecipients = () => {
		return fetchWithLoader(
			this.getFullUrl({
				url: 'getSharedRecipients',
			}));
	}

	$saveFilesToFlash = (params) => {
		return fetchWithLoader(
			this.getFullUrl({ url: 'saveFilesToFlash' }),
			new PostObjTmp({ body: params }));
	};

	$remove = (params) => {
		const url = this.getUrlWithParams({
			url: 'remove', params: {
				...params,
				curWindow: window.name,
			}
		});
		return fetchWithLoader(url);
	}

	getUrlWithParams({
		url,
		params,
	}) {
		const urlUpd = this.getFullUrl({ url });
		const paramsUpd = this.getParams({ params });
		return `${urlUpd}${paramsUpd}`;
	}

	getParams({ params = {} }) {
		const arr = Object.entries(params)
			.filter(([name, val]) => val !== undefined)
			.map(([name, val]) => `${name}=${val}`);
		return `?${arr.join('&')}`;
	}

	backward = ({
		url = 'backward',
	} = {}) => {
		return this.navigate({
			url,
		});
	}

	resetNavigation = ({
		curWindow,
	}) => {
		return fetchWithLoader(
			this.getFullUrl({ url: 'resetNavigation' }),
			new PostObjTmp({
				body: {
					resetTo: '',
					curWindow,
				}
			})
		);
	}

	towardPrinted = (props) => this.toward({
		...props,
		url: 'towardPrinted',
	});

	towardShared = (props) => this.toward({
		...props,
		url: 'towardShared',
	});

	towardSharedItems = (props) => this.toward({
		...props,
		url: 'towardSharedItems',
	});

	toward = ({
		resetTo,
		dir,
		curWindow,
		url = 'toward',
	} = {}) => {
		return this.navigate({
			url,
			params: {
				dir,
				resetTo,
				curWindow,
			}
		});
	}

	navigate = ({ url, params = {} }) => {		
		return fetchWithLoader(
			this.getFullUrl({ url }),
			new PostObjTmp({
				body: {
					...params,
					...(!params.curWindow && { curWindow: window.name }),
				},
			})
		);
	}

	addAlbum = async ({
		name,
	}) => {
		if (!name) return;
		return fetchWithLoader(
			this.getFullUrl({
				url: 'addAlbum'
			}),
			new PostObjTmp({
				body: {
					name,
					curWindow: window.name,
				},
			})
		);
	};

	rename = async ({
		name,
		newName,
		updatedActionLists,
	}) => {
		if (!name || !newName || name === newName) return;

		return fetchWithLoader(
			this.getFullUrl({
				url: 'rename'
			}),
			new PostObjTmp({
				body: {
					name,
					newName,
					updatedActionLists,
					curWindow: window.name,
				}
			})
		);
	}

	getPrintedItems = ({
		requestFile,
	}) => {
		return fetchWithLoader(
			this.getFullUrl({
				url: 'getPrintedItems'
			}),
			new PostObjTmp({
				body: {
					requestFile,
					curWindow: window.name,
				},
			})
		);
	}

	removeItems = ({
		items = [],
		updatedActionLists,
	}) => {
		if (items.length === 0) return;
		return fetchWithLoader(
			this.getFullUrl({
				url: 'removeItems'
			}),
			new PostObjTmp({
				body: {
					items,
					curWindow: window.name,
					updatedActionLists,
				},
			})
		);
	};

	moveToPath = ({
		items,
		updatedActionLists,
		destWindow,
	}) => {
		return fetchWithLoader(
			this.getFullUrl({
				url: 'moveToPath',
			}),
			new PostObjTmp({
				body: {
					items,
					updatedActionLists,
					destWindow,
					curWindow: window.name,
				}
			})
		);
	}

	$copyPhotos = () => {
		return fetchWithLoader(this.getFullUrl({
			url: 'copyPhotos',
		}), {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json;charset=utf-8'
			},
			body: JSON.stringify({
				curWindow: window.name,
			})
		});
	}

	$getNewPhotos = () => {
		return fetchWithLoader(this.getFullUrl({ url: 'getNewPhotos' }));
	}

	checkProgress = () => {
		return fetchUpd(
			this.getFullUrl({
				url: 'checkProgress'
			}));
	}

	$getUsbDevices = (params = {}) => {
		const url = this.getUrlWithParams({ url: 'getUsbDevices', params });
		return fetchWithLoader(url)
			.then(res => { console.log('usbDevices', res); return res; });
	}
}