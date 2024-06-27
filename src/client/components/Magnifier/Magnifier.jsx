import React, { useCallback, useEffect, useRef } from 'react';


export function Magnifier({ 
	img, 
	zoom = 3,
	size = 1, // widht, height = ${size * 100}px;.
}) {

	const magRef = useRef();	

	const onMoveMagnifier = useCallback((e) => moveMagnifier({e, magRef, zoom, img}),[img, zoom]);

	useEffect(() => {		
		const glass = magRef.current;
		glass?.addEventListener('mousemove', onMoveMagnifier);
		glass?.addEventListener('touchmove', onMoveMagnifier, {passive: false});

		return () => {			
			glass?.removeEventListener('mousemove', onMoveMagnifier);
			glass?.removeEventListener('touchmove', onMoveMagnifier);
		};
		
	}, [img, zoom]);	

    const style = {
        position: 'absolute',
        border: '3px solid #000',
        borderRadius: '50%',
        cursor: 'none',
        width: `${size * 150}px`,
        height: `${size * 150}px`,
        zIndex: 1000,
        backgroundImage: `url('${img.src}')`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: `${img.offsetWidth * zoom}px ${img.offsetHeight * zoom}px`,
    };

	return (
        <div 
			ref={magRef}
            className='img-magnifier-glass'
            style={style}		
        />        
    );
}

function moveMagnifier({e, magRef, zoom, img}) {
	const glass = magRef.current;
	if (!glass) {
		return;
	}

	// prevent any other actions that may occur when moving over the image
	e.preventDefault();

	// get the cursor's x and y positions
	const {xByParent, yByParent, xByImage, yByImage} = getCursorPos({e, img});

	// set the position of the magnifier glass
	glass.style.left = `${xByParent - glass.offsetWidth / 2}px`;
	glass.style.top = `${yByParent - glass.offsetHeight / 2}px`;

	// calculate background position for the magnifier glass
	const backgroundPosX = -(xByImage * zoom - glass.offsetWidth / 2);
	const backgroundPosY = -(yByImage * zoom - glass.offsetHeight / 2);
	glass.style.backgroundPosition = `${backgroundPosX}px ${backgroundPosY}px`;
}	


function getCursorPos({e, img}) {
	let x = 0, y = 0;

	if (e.type === 'touchmove') {
		// coordinates for touch devices
		x = e.touches[0].clientX;
		y = e.touches[0].clientY;
	} else {
		// coordinates for mouse devices
		x = e.clientX;
		y = e.clientY;
	}

	// get the x and y coordinates, relative to the image.
	const {left:imgLeft, top: imgTop} = img.getBoundingClientRect();
	const xByImage = x - imgLeft - window.scrollX;
	const yByImage = y - imgTop - window.scrollY;
	
	// calculate the cursor's x and y coordinates, relative to the parent.
	const {left: parentLeft, top: parentTop} = img.parentElement.getBoundingClientRect();
	const xByParent = x - parentLeft - window.scrollX;
	const yByParent = y - parentTop - window.scrollY;

	return {xByParent, yByParent, xByImage, yByImage};
}	