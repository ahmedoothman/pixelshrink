import React from 'react';
import { ImageFile, CompressionResult } from '../types';

interface ResultsViewProps {
  files: ImageFile[];
  results: CompressionResult[];
  processing: boolean;
}

function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}

export default function ResultsView({
  files,
  results,
  processing,
}: ResultsViewProps) {
  // Empty state
  if (files.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🖼️</div>
        <h2 className="empty-title">No images selected</h2>
        <p className="empty-text">
          Select images from the sidebar to get started. Supports JPG, PNG,
          WebP, and GIF formats.
        </p>
      </div>
    );
  }

  // Processing state
  if (processing) {
    return (
      <div className="processing-state fade-in">
        <div className="processing-spinner" />
        <p className="processing-text">Compressing images...</p>
        <p className="processing-subtext">This may take a moment</p>
      </div>
    );
  }

  // Results state
  if (results.length > 0) {
    const totalOriginal = results.reduce((sum, r) => sum + r.originalSize, 0);
    const totalCompressed = results.reduce(
      (sum, r) => sum + r.compressedSize,
      0
    );
    const totalSavings =
      totalOriginal > 0
        ? (((totalOriginal - totalCompressed) / totalOriginal) * 100).toFixed(1)
        : '0';
    const successCount = results.filter((r) => r.success).length;

    return (
      <div className="fade-in">
        {/* Summary Card */}
        <div className="results-summary">
          <div className="results-icon">✨</div>
          <div className="results-info">
            <h3>Compression Complete!</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              {successCount} of {results.length} images compressed successfully
            </p>
          </div>
          <div className="results-stats" style={{ marginLeft: 'auto' }}>
            <div className="results-stat">
              <div className="results-stat-value">
                {formatSize(totalOriginal - totalCompressed)}
              </div>
              <div className="results-stat-label">Saved</div>
            </div>
            <div className="results-stat">
              <div className="results-stat-value">{totalSavings}%</div>
              <div className="results-stat-label">Reduced</div>
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="results-table">
          <div className="results-table-header">
            <span>File</span>
            <span>Original</span>
            <span>Compressed</span>
            <span>Savings</span>
            <span>Status</span>
          </div>
          {results.map((result, index) => (
            <div key={index} className="results-table-row">
              <span style={{ color: 'var(--text-primary)' }}>{result.file}</span>
              <span style={{ color: 'var(--text-secondary)' }}>
                {formatSize(result.originalSize)}
              </span>
              <span style={{ color: 'var(--text-secondary)' }}>
                {formatSize(result.compressedSize)}
              </span>
              <span
                style={{
                  color: parseFloat(result.savingsPercent) > 30 
                    ? 'var(--success)' 
                    : 'var(--text-secondary)',
                }}
              >
                {result.savingsPercent}%
              </span>
              <span
                className={`file-status ${
                  result.success ? 'status-success' : 'status-error'
                }`}
              >
                {result.success ? '✓' : '✗'}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Ready state - files selected but not compressed
  return (
    <div className="fade-in">
      <div className="ready-state">
        <div className="ready-icon">📋</div>
        <div className="ready-info">
          <h3>Ready to compress</h3>
          <p>
            {files.length} image{files.length > 1 ? 's' : ''} selected.
            Configure settings and click Compress to begin.
          </p>
        </div>
      </div>

      <div className="preview-list">
        <div className="preview-header">Selected Files</div>
        {files.map((file, index) => (
          <div key={file.path} className="preview-item">
            <span className="preview-number">{index + 1}</span>
            <span className="preview-name">{file.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
