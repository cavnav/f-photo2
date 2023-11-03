export const updateFiles = {
	update(props) {
		const {files} = props;
		files[props.photoSrc] = {
			...files[props.photoSrc],
			cnt: props.cnt,
		};
		return files;
	},
	add(props) {
		const {files} = props;
		files[props.photoSrc] = {
			cnt: props.cnt,
		};
		return files;

	},
	delete(props) {
		const {files} = props;
		delete files[props.photoSrc];
		return files;
	},
}