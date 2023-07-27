import {useEffect} from 'react';
import {channel} from '../../../channel';
import { getCompsAPI } from '../../../functions';

export function usePrintActions({
    render,
    isSaveToFlash,
    isEmpty,
    printed,
    onCancelSaveToFlash,
    onSaveToFlash,
    onBackToPrinted,
}) {
    useEffect(
        () => {
            // Задать кнопки действий.
            const {
                CancelSaveToFlash,
                SaveToFlash,
                BackToPrinted,
                CancelSaveToFlashAPI,
                SaveToFlashAPI,
                BackToPrintedAPI,
            } = getComps();

            render({
                actions: [
                    CancelSaveToFlash,
                    SaveToFlash,
                    BackToPrinted,
                ],
            })
            .then(() => {
                if (isSaveToFlash) {
                    CancelSaveToFlashAPI.forceUpdate({
                        title: 'Отменить запись',
                        onClick: onCancelSaveToFlash,
                    });
                } 
                else if (!isEmpty) {
                    SaveToFlashAPI.forceUpdate({
                        title: 'Записать на флешку',
                        onClick: onSaveToFlash,
                    });
                }
                if (onBackToPrinted) {
                    BackToPrintedAPI.forceUpdate({
                        title: `Закрыть ${printed}`,
                        onClick: onBackToPrinted,
                    });
                }
            });

            return () => {
                render({
                    actions: [],
                });
            };
        },
        [isSaveToFlash, isEmpty]
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
            BackToPrinted: Label,
		},
    });
}