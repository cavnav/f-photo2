import React from 'react';

export function Dirs({
  dirs,
  onChangeDir,
  onSelectDir,
}) {
    const Comp = useMemo(() => {
      className="positionRel fitPreview dir"
      className="itemSelector positionAbs"
      return dirs.map(dir => {
        return (
          <div 
            key={dir}
            src={dir}
            event={onChangeDir}
          >
            {dir.slice(1)}
            <input
              type="checkbox"
              src={dir}
              event={onSelectDir}
            />
          </div>
        );
      });
    }, [dirs]);
    
    return (
      <Comp/>
    );
  }