import React, {useState, useEffect} from 'react';
import styles from './styles.module.css';
import classNames from 'classnames';

export function File({file, errors}) {
    const [url, setUrl] = useState('');
  
    useEffect(() => {
      // Create a blob URL
      const blobUrl = URL.createObjectURL(file);
      setUrl(blobUrl);
  
      // Cleanup function to revoke the blob URL
      return () => {
        URL.revokeObjectURL(blobUrl);
      };
    }, [file]);

    if (!url) return null; 
  
    return (
      <div className={classNames({
        [styles.file]: true,
        [styles.uploadError]: errors?.length > 0,
      })}>
        <img
          src={url}
        />
        <div>{file.name}</div>
        <div className='error'>{errors}</div>
      </div>
    );
  };