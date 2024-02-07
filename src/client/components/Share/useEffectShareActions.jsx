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
            shared,
            isButtonSelectTo,
            isButtonBackward,
            isButtonSend,
            filesSelected,
        }, 
        onCancelShare,
        onClose,   
        onSelectTo,
        onBackwardToPhotos,
        onSend,
    } = props;

    
    return () => {
        const {
            SelectTo,
            BackwardToPhotos,
            Send,
            Close,
            Cancel,

            DialogAPI,
            CancelAPI,
            SelectToAPI,
            BackwardToPhotosAPI,
            SendAPI,
            CloseAPI,
            
        } = getChannelComps({
            callback: getCompsCallback,
        });



        additionalPanelRender({
            actions: [
                Close,
                Cancel,
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
                if (shared) {
                    CloseAPI.forceUpdate({
                        title: `Закрыть ${shared}`,
                        onClick: onClose,
                    });
                }
                const cancelItemsCount = filesSelected.length;
                if (cancelItemsCount > 0) {
                    const onClick = () => {
                        DialogAPI.showChoiceConfirmation({
                            message: "",
                            onConfirm: onCancelShare,
                        });
                    };

                    CancelAPI.forceUpdate({
                        title: `Отменить отправку ${cancelItemsCount}`,
                        onClick,
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
    Dialog,
    Label,
}) {
    return {
        items: {
            Dialog,
        },
        toClone: {
            SelectTo: Label,
            BackwardToPhotos: Label,
            Send: Label,
            Close: Label,
            Cancel: Label,
        },
    };
}