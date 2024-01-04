import React, {useEffect} from 'react';
import { getChannelComps } from '../../functions';


export function useShareActions(props) {
    const deps = [];

    useEffect(
        effectRenderAdditionalActions({props, deps}),
        deps
    );
}





function effectRenderAdditionalActions({
    props,
    deps,
}) {
    const {
        additionalPanelRender: render,
        state: {
            isButtonSelectTo,
            isButtonBackwardToPhotos,
            isButtonSend,
        },    
        onSelectTo,
        onBackwardToPhotos,
        onSend,
        
    } = props;

    deps.push(...[
        isButtonSelectTo, 
        isButtonBackwardToPhotos,
        isButtonSend,
    ]);

    return () => {
        const {
            SelectTo,
            BackwardToPhotos,
            Send,

            SelectToAPI,
            BackwardToPhotosAPI,
            SendAPI,
            
        } = getChannelComps({
            callback: getCompsCallback,
        });



        render({
            actions: [
                SelectTo,
                BackwardToPhotos,
                Send,
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
                if (isButtonSend) {
                    SendAPI.forceUpdate({
                        title: 'Отправить',
                        onClick: onSend,                    
                    });
                }

            }
        );

        return () => {
            render({
                actions: []
            });
        };
    };
}

function getCompsCallback({
    Label,
}) {
    return {
        toClone: {
            SelectTo: Label,
            BackwardToPhotos: Label,
            Send: Label,
        },
    };
}