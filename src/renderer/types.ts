export interface ImageFile {
  path: string;
  name: string;
  size?: number;
}

export interface CompressionOptions {
  quality: number;
  width: number;
  height: number;
  addSuffix: boolean;
}

export interface CompressionResult {
  file: string;
  originalSize: number;
  compressedSize: number;
  savingsPercent: string;
  success: boolean;
  error?: string;
}
