import React from 'react';
import icon from '../../../assets/icon.png';

interface HeaderProps {
  fileCount: number;
}

export default function Header({ fileCount }: HeaderProps) {
  return (
    <div className="header">
      <div className="header-logo">
        <div className="header-icon">
          <img src={icon} alt="PixelShrink" />
        </div>
        <h1 className="header-title">PixelShrink</h1>
      </div>
      <p className="header-tagline">
        Compress images without losing quality
        {fileCount > 0 && (
          <span className="file-count">
            {fileCount}
          </span>
        )}
      </p>
    </div>
  );
}
