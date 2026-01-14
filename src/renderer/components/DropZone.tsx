import React, { useState, useCallback } from 'react';
import { ImageFile } from '../types';

interface DropZoneProps {
  files: ImageFile[];
  onSelectFiles: () => void;
  onRemoveFile: (path: string) => void;
}

export default function DropZone({
  files,
  onSelectFiles,
  onRemoveFile,
}: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // Note: Drag and drop with file paths requires native file handling
    // For now, users should use the Browse button
    onSelectFiles();
  }, [onSelectFiles]);

  return (
    <div className="card">
      <h3 className="card-title">Select Images</h3>

      <div
        className={`dropzone ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={onSelectFiles}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onSelectFiles()}
      >
        <div className="dropzone-icon">🖼️</div>
        <p className="dropzone-text">Click to browse images</p>
        <p className="dropzone-hint">Supports JPG, PNG, WebP, GIF</p>
      </div>

      {files.length > 0 && (
        <div className="file-list">
          {files.map((file) => (
            <div key={file.path} className="file-item">
              <span className="file-name" title={file.name}>
                {file.name}
              </span>
              <span
                className="file-remove"
                onClick={() => onRemoveFile(file.path)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) =>
                  e.key === 'Enter' && onRemoveFile(file.path)
                }
              >
                ✕
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
