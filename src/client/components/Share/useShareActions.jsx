import React, {useEffect} from 'react';
import { getChannelComps } from '../../functions';


export function useShareActions({
    additionalPanelRender: render,
    isSelectTo,
    isBackwardToPhotos,
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
                    if (isSelectTo) {
                        SelectToAPI.forceUpdate({
                            title: 'Выбрать получателей',
                            onClick: onSelectTo,
                        });
                    }
                    if (isBackwardToPhotos) {
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
        [isSelectTo, isBackwardToPhotos]
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