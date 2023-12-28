import React, {useEffect} from 'react';
import { getChannelComps } from '../../functions';


export function useShareActions({
    additionalPanelRender: render,
    isButtonSelectTo,
    isButtonBackwardToPhotos,
    onSelectTo,
    onBackwardToPhotos,
}) {
    useEffect(
        () => {
            const {
                SelectTo,
                BackwardToPhotos,

                SelectToAPI,
                BackwardToPhotosAPI,
            } = getChannelComps({
                callback: getCompsCallback,
            });

            render({
                actions: [
                    SelectTo,
                    BackwardToPhotos,
                ],
            })
            .then(
                () => {
                    if (isButtonSelectTo) {
                        SelectToAPI.forceUpdate({
                            title: 'Выбрать получателей',
                            onClick: onSelectTo,
                        });
                    }
                    if (isButtonBackwardToPhotos) {
                        BackwardToPhotosAPI.forceUpdate({
                            title: 'Вернуться к фото',
                            onClick: onBackwardToPhotos,
                        });
                    }

                }
            );

            return () => {
                render({
                    actions: []
                });
            };
        },
        [isButtonSelectTo, isButtonBackwardToPhotos]
    );
}

function getCompsCallback({
    Label,
}) {
    return {
        toClone: {
            SelectTo: Label,
            BackwardToPhotos: Label,
        },
    };
}