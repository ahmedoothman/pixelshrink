import { useState, useCallback } from 'react';
import './App.css';
import { ImageFile, CompressionOptions, CompressionResult } from './types';
import { Header, DropZone, SettingsPanel, ResultsView } from './components';

// Initial compression options
const defaultOptions: CompressionOptions = {
  quality: 80,
  width: 0,
  height: 0,
  addSuffix: true,
};

export default function App() {
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [destination, setDestination] = useState<string>('');
  const [options, setOptions] = useState<CompressionOptions>(defaultOptions);
  const [results, setResults] = useState<CompressionResult[]>([]);
  const [processing, setProcessing] = useState<boolean>(false);

  // Select files via dialog
  const handleSelectFiles = useCallback(async () => {
    const filePaths = await window.electron.ipcRenderer.invoke<string[]>(
      'select-files'
    );
    if (filePaths.length > 0) {
      const newFiles: ImageFile[] = filePaths.map((path) => ({
        path,
        name: path.split(/[\\/]/).pop() || path,
      }));
      setFiles(newFiles);
      setResults([]); // Clear previous results
    }
  }, []);

  // Remove a file from the list
  const handleRemoveFile = useCallback((path: string) => {
    setFiles((prev) => prev.filter((f) => f.path !== path));
  }, []);

  // Select destination folder
  const handleSelectDestination = useCallback(async () => {
    const folderPath = await window.electron.ipcRenderer.invoke<string>(
      'select-destination'
    );
    if (folderPath) {
      setDestination(folderPath);
    }
  }, []);

  // Compress images
  const handleCompress = useCallback(async () => {
    if (files.length === 0 || !destination) return;

    setProcessing(true);
    setResults([]);

    try {
      const compressionResults =
        await window.electron.ipcRenderer.invoke<CompressionResult[]>(
          'compress-images',
          {
            files: files.map((f) => f.path),
            destination,
            options,
          }
        );
      setResults(compressionResults);
    } catch (error) {
      console.error('Compression error:', error);
    } finally {
      setProcessing(false);
    }
  }, [files, destination, options]);

  // Reset state
  const handleReset = useCallback(() => {
    setFiles([]);
    setResults([]);
    // Keep destination for convenience
  }, []);

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <Header fileCount={files.length} />

        <DropZone
          files={files}
          onSelectFiles={handleSelectFiles}
          onRemoveFile={handleRemoveFile}
        />

        <SettingsPanel
          options={options}
          destination={destination}
          onChange={setOptions}
          onSelectDestination={handleSelectDestination}
          onCompress={handleCompress}
          onReset={handleReset}
          processing={processing}
          hasFiles={files.length > 0}
          hasResults={results.length > 0}
        />
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <ResultsView files={files} results={results} processing={processing} />
      </main>
    </div>
  );
}
