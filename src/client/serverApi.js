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
		.catch((error) => {
			notifyServerError(error);

			throw error;
		});
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
			}))
			.then(response => response.json());
	}

	$saveFilesToFlash = (params) => {
		return fetchWithLoader(
			this.getFullUrl({ url: 'saveFilesToFlash' }),
			new PostObjTmp({ body: params }))
			.then(res => res.json());
	};

	imgRotate(params) {
		const url = this.getUrlWithParams({ url: this.imgRotate.name, params });
		return fetch(url)
			.then(res => res.json());
	}

	$remove = (params) => {
		const url = this.getUrlWithParams({
			url: 'remove', params: {
				...params,
				curWindow: window.name,
			}
		});
		return fetchWithLoader(url)
			.then(res => res.json());
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
		)
		.then(res => res.json())
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
			)
			.then((res) => res.json());
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
		)
		.then((result) => {
			return result?.json();
		});
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
		)
		.then(res => res.json());
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
		)
		.then((res) => res.json());
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
		)
			.then(res => res.json());
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
		}).then(res => res.json());
	}

	$getNewPhotos = () => {
		return fetchWithLoader(this.getFullUrl({ url: 'getNewPhotos' })).then(res => res.json());
	}

	checkProgress = () => {
		return fetchUpd(
			this.getFullUrl({
				url: 'checkProgress'
			}))
			.then(res => res.json())
	}

	$getUsbDevices = (params = {}) => {
		const url = this.getUrlWithParams({ url: 'getUsbDevices', params });
		return fetchWithLoader(url)
			.then(res => res.json()).then(res => { console.log('usbDevices', res); return res; });
	}
}