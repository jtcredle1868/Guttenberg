import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import clsx from 'clsx';
import { ArrowUpTrayIcon, DocumentIcon } from '@heroicons/react/24/outline';

interface FileUploadZoneProps {
  onDrop: (files: File[]) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  label?: string;
  hint?: string;
  className?: string;
}

export const FileUploadZone = ({ onDrop, accept, maxSize, label, hint, className }: FileUploadZoneProps) => {
  const handleDrop = useCallback((acceptedFiles: File[]) => {
    onDrop(acceptedFiles);
  }, [onDrop]);

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop: handleDrop,
    accept,
    maxSize,
  });

  return (
    <div
      {...getRootProps()}
      className={clsx(
        'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
        isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50',
        className
      )}
    >
      <input {...getInputProps()} />
      {acceptedFiles.length > 0 ? (
        <div className="flex flex-col items-center gap-2">
          <DocumentIcon className="w-10 h-10 text-primary-500" />
          <p className="text-sm font-medium text-gray-700">{acceptedFiles[0].name}</p>
          <p className="text-xs text-gray-400">{(acceptedFiles[0].size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <ArrowUpTrayIcon className="w-10 h-10 text-gray-400" />
          <p className="text-sm font-medium text-gray-700">{label || 'Drop files here or click to browse'}</p>
          {hint && <p className="text-xs text-gray-400">{hint}</p>}
        </div>
      )}
    </div>
  );
};
