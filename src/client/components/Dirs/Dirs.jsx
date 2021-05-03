import React from 'react';

export function Dirs({
  dirs,
  onClickDirFnName,
  onClickItemSelectorFnName,
}) {
    return dirs.map(dir => {
      return (
        <div 
          key={dir}
          src={dir}
          className="positionRel fitPreview dir"
          clickcb={onClickDirFnName}
        >
          {dir.slice(1)}
          <input
            className="itemSelector positionAbs"
            type="checkbox"
            src={dir}
            clickcb={onClickItemSelectorFnName}
          />
        </div>
      );
    });
  }