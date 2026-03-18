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

export const FileUploadZone = ({
  onDrop, accept, maxSize, label, hint, className,
}: FileUploadZoneProps) => {
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
      className={clsx('rounded-xl p-8 text-center cursor-pointer transition-all duration-200', className)}
      style={{
        background: isDragActive
          ? 'rgba(212,175,55,0.08)'
          : 'rgba(10,22,40,0.50)',
        border: isDragActive
          ? '2px dashed rgba(212,175,55,0.60)'
          : '2px dashed rgba(61,96,128,0.35)',
        boxShadow: isDragActive
          ? '0 0 0 3px rgba(201,162,39,0.12), inset 0 0 24px rgba(212,175,55,0.04)'
          : 'none',
      }}
      onMouseEnter={e => {
        if (!isDragActive) {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(212,175,55,0.40)';
          (e.currentTarget as HTMLDivElement).style.background = 'rgba(212,175,55,0.05)';
        }
      }}
      onMouseLeave={e => {
        if (!isDragActive) {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(61,96,128,0.35)';
          (e.currentTarget as HTMLDivElement).style.background = 'rgba(10,22,40,0.50)';
        }
      }}
    >
      <input {...getInputProps()} />

      {acceptedFiles.length > 0 ? (
        <div className="flex flex-col items-center gap-2">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(52,211,153,0.10)', border: '1px solid rgba(52,211,153,0.25)' }}
          >
            <DocumentIcon className="w-6 h-6" style={{ color: '#34d399' }} />
          </div>
          <p className="text-sm font-semibold" style={{ color: '#c5d8e8' }}>
            {acceptedFiles[0].name}
          </p>
          <p className="text-xs" style={{ color: 'rgba(90,127,160,0.65)', fontFamily: '"Source Code Pro", monospace' }}>
            {(acceptedFiles[0].size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2.5">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-200"
            style={{
              background: isDragActive ? 'rgba(212,175,55,0.15)' : 'rgba(61,96,128,0.15)',
              border: `1px solid ${isDragActive ? 'rgba(212,175,55,0.30)' : 'rgba(61,96,128,0.30)'}`,
            }}
          >
            <ArrowUpTrayIcon
              className="w-6 h-6"
              style={{ color: isDragActive ? '#d4af37' : 'rgba(138,175,200,0.60)' }}
            />
          </div>
          <p className="text-sm font-semibold" style={{ color: isDragActive ? '#d4af37' : '#c5d8e8' }}>
            {isDragActive ? 'Drop to upload' : (label || 'Drop files here or click to browse')}
          </p>
          {hint && (
            <p className="text-xs" style={{ color: 'rgba(90,127,160,0.55)' }}>{hint}</p>
          )}
        </div>
      )}
    </div>
  );
};
