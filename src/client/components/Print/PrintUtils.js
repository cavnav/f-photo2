export const updateFilesToPrint = {
	update(props) {
		const {filesToPrint} = props;
		filesToPrint[props.photoSrc] = {
			...filesToPrint[props.photoSrc],
			cnt: props.cnt,
		};
		return filesToPrint;
	},
	add(props) {
		const {filesToPrint} = props;
		filesToPrint[props.photoSrc] = {
			cnt: props.cnt,
		};
		return filesToPrint;

	},
	delete(props) {
		const {filesToPrint} = props;
		delete filesToPrint[props.photoSrc];
		return filesToPrint;
	},
}