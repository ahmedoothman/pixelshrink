import React from 'react';
import { CompressionOptions } from '../types';

interface SettingsPanelProps {
  options: CompressionOptions;
  destination: string;
  onChange: (options: CompressionOptions) => void;
  onSelectDestination: () => void;
  onCompress: () => void;
  onReset: () => void;
  processing: boolean;
  hasFiles: boolean;
  hasResults: boolean;
}

function getQualityDescription(quality: number): string {
  if (quality < 40) return 'Low quality, maximum compression';
  if (quality < 60) return 'Medium quality, good compression';
  if (quality < 80) return 'Good quality, moderate compression';
  return 'High quality, minimal compression';
}

export default function SettingsPanel({
  options,
  destination,
  onChange,
  onSelectDestination,
  onCompress,
  onReset,
  processing,
  hasFiles,
  hasResults,
}: SettingsPanelProps) {
  const handleQualityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...options, quality: Number(e.target.value) });
  };

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? 0 : Number(e.target.value);
    if (value >= 0 && value <= 10000) {
      onChange({ ...options, width: value });
    }
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? 0 : Number(e.target.value);
    if (value >= 0 && value <= 10000) {
      onChange({ ...options, height: value });
    }
  };

  const handleSuffixChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...options, addSuffix: e.target.checked });
  };

  const canCompress = hasFiles && destination && !processing;

  return (
    <>
      <div className="card">
        <h3 className="card-title">Compression Settings</h3>

        {/* Quality Slider */}
        <div className="slider-container">
          <div className="slider-header">
            <span className="slider-label">Quality</span>
            <span className="slider-value">{options.quality}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            value={options.quality}
            onChange={handleQualityChange}
            className="slider"
          />
          <p className="quality-desc">{getQualityDescription(options.quality)}</p>
        </div>

        {/* Resize Options */}
        <div className="input-group">
          <div className="input-field">
            <label className="input-label">Width (px)</label>
            <input
              type="number"
              className="input"
              placeholder="Auto"
              value={options.width || ''}
              onChange={handleWidthChange}
              min="0"
              max="10000"
            />
          </div>
          <div className="input-field">
            <label className="input-label">Height (px)</label>
            <input
              type="number"
              className="input"
              placeholder="Auto"
              value={options.height || ''}
              onChange={handleHeightChange}
              min="0"
              max="10000"
            />
          </div>
        </div>

        {/* Suffix Option */}
        <label className="checkbox-container">
          <input
            type="checkbox"
            className="checkbox"
            checked={options.addSuffix}
            onChange={handleSuffixChange}
          />
          <span className="checkbox-label">Add "_compressed" to filename</span>
        </label>
      </div>

      <div className="card">
        <h3 className="card-title">Output Destination</h3>
        <div className="destination">
          <div className={`destination-path ${destination ? 'set' : ''}`}>
            {destination || 'No folder selected'}
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onSelectDestination}
          >
            📁
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="btn-group" style={{ marginTop: 'auto' }}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onCompress}
          disabled={!canCompress}
        >
          {processing ? '⏳ Compressing...' : '🚀 Compress'}
        </button>
        {hasResults && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onReset}
            style={{ flex: '0 0 auto', width: '48px' }}
          >
            🔄
          </button>
        )}
      </div>
    </>
  );
}
