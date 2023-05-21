import { Dialog } from '.././components/Dialog/Dialog';
export function useRequest({ cb }) {
    Dialog.show({
		loading: true,
	});
	rp.server.toward({
		resetTo: state.path,
	})
}