import {useEffect} from 'react';
import { getChannelComps } from '../../functions';


export function useEffectShareActions(props) {
    useEffect(
        render({props}),
        props.deps
    );
}





function render({
    props,
}) {
    const {
        additionalPanelRender,
        state: {
            isButtonSelectTo,
            isButtonBackward,
            isButtonSend,
        },    
        onSelectTo,
        onBackwardToPhotos,
        onSend,
        
    } = props;

    
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



        additionalPanelRender({
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
                if (isButtonBackward) {
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
            additionalPanelRender({
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