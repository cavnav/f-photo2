import {useEffect} from 'react';
import {channel} from '../../../channel';
import { getCompsAPI } from '../../../functions';

export function usePrintActions({
    render,
    isSaveToFlash,
    onCancelSaveToFlash,
    onSaveToFlash,
}) {
    useEffect(
        () => {
            // Задать кнопки действий.
            const {
                CancelSaveToFlash,
                SaveToFlash,
                CancelSaveToFlashAPI,
                SaveToFlashAPI,
            } = getComps();

            render({
                actions: [
                    CancelSaveToFlash,
                    SaveToFlash,
                ],
            })
            .then(() => {
                if (isSaveToFlash) {
                    CancelSaveToFlashAPI.forceUpdate({
                        title: 'Отменить запись',
                        onClick: onCancelSaveToFlash,
                    });
                } 
                else {
                    SaveToFlashAPI.forceUpdate({
                        title: 'Записать на флешку',
                        onClick: onSaveToFlash,
                    });
                }
            });

            return () => {
                render({
                    actions: [],
                });
            };
        },
        [isSaveToFlash]
    );
}

function getComps() {
    const {
        Label,
    } = channel.comps;

    return getCompsAPI({
        toClone: {
			CancelSaveToFlash: Label,
			SaveToFlash: Label,
		},
    });
}