'use client';

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE } from '../../constants';

export function MediaUploader({ onUpload }) {
  const onDrop = useCallback((acceptedFiles) => {
    onUpload(acceptedFiles);
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
  });

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...getRootProps()}
      className={`flex-1 p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors
        ${isDragActive
          ? 'border-primary-500 bg-primary-50'
          : 'border-gray-300 hover:border-primary-500 hover:bg-primary-50'
        }`}
    >
      <input {...getInputProps()} />
      <div className="space-y-2">
        <motion.svg
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </motion.svg>
        <div className="text-sm text-gray-600">
          {isDragActive ? (
            <p>Drop the files here ...</p>
          ) : (
            <p>
              Drag & drop files here, or click to select files
              <br />
              <span className="text-xs text-gray-500">
                (Max size: 10MB)
              </span>
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
} 