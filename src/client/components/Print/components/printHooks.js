import {useEffect} from 'react';
import { getChannelComps } from '../../../functions';

export function usePrintActions({
    render,
    isSaveToFlashBtn,
    isCancelCopyingBtn,
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
            } = getChannelComps({
                callback: getCompsCallback,
            });

            render({
                actions: [
                    BackToPrinted,
                    CancelSaveToFlash,
                    SaveToFlash,
                ],
            })
            .then(() => {
                if (isCancelCopyingBtn) {
                    CancelSaveToFlashAPI.forceUpdate({
                        title: 'Отменить запись',
                        onClick: onCancelSaveToFlash,
                    });
                } 
                if (isSaveToFlashBtn) {
                    SaveToFlashAPI.forceUpdate({
                        title: 'Записать на флешку',
                        onClick: onSaveToFlash,
                    });
                }
                if (printed && onBackToPrinted) {
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
        [isSaveToFlashBtn, isCancelCopyingBtn]
    );
}

function getCompsCallback({
    Label,
}) {
    return {
        toClone: {
            CancelSaveToFlash: Label,
            SaveToFlash: Label,
            BackToPrinted: Label,
        },
    };
}