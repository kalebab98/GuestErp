import React, { useRef } from 'react';
import { Camera, Image as ImageIcon, X } from 'lucide-react';

export interface UploadedFile {
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  previewUrl: string;
}

interface PhotoUploaderProps {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  maxFiles?: number;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  files,
  onFilesChange,
  maxFiles = 3,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected) return;

    const newFiles: UploadedFile[] = [...files];

    Array.from(selected).forEach(file => {
      if (newFiles.length >= maxFiles) return;

      // Check max size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} exceeds 5MB size limit.`);
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      newFiles.push({
        fileName: file.name,
        filePath: `uploads/${Date.now()}-${file.name.replace(/\s+/g, '_')}`,
        fileSize: file.size,
        mimeType: file.type || 'image/jpeg',
        previewUrl,
      });
    });

    onFilesChange(newFiles);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = (index: number) => {
    const updated = files.filter((_, i) => i !== index);
    onFilesChange(updated);
  };

  return (
    <div className="space-y-2 text-left">
      <label className="block text-sm font-medium text-slate-700">
        Photos / Evidence (Optional)
      </label>

      {/* Preview thumbnails */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2.5 mb-2">
          {files.map((file, idx) => (
            <div
              key={idx}
              className="relative h-20 w-20 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 group shadow-xs"
            >
              <img
                src={file.previewUrl}
                alt={file.fileName}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="absolute top-1 right-1 rounded-full bg-slate-900/70 p-1 text-white hover:bg-rose-600 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {files.length < maxFiles && (
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            capture="environment"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 py-3.5 px-4 text-sm font-medium text-slate-600 hover:border-teal-600 hover:text-teal-700 hover:bg-teal-50/50 transition-colors"
          >
            <Camera className="h-4 w-4 text-slate-500" />
            <span>Add photo or take picture ({files.length}/{maxFiles})</span>
          </button>
        </div>
      )}
    </div>
  );
};

