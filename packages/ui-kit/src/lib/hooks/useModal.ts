import React from "react";

export function useModal<T = null> () {
	const [ modal, setModal ] = React.useState<{
		visible: boolean;
		value?: T | null
	}>({ visible: false });

	const toggleModal = React.useCallback(() => {
		setModal(state => {
			return {
				visible: !state.visible,
				value: null
			}
		})
	}, []);

	const openModal = React.useCallback((v?: T | null) => {
		setModal({
			visible: true,
			value: v
		})
	}, []);

	return {
		...modal,
		setModal,
		openModal,
		toggleModal
	}
}
