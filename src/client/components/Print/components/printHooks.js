import {useEffect} from 'react';
import { getComps } from '../../../functions';

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
            } = getCompsOwn();

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

function getCompsOwn() {
    return getComps({callback});

    function callback({
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
}
