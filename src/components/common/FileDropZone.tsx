import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, X, FileText, Image } from 'lucide-react';

interface FileDropZoneProps {
    onFilesSelected: (files: File[]) => void;
    files: File[];
    onRemoveFile: (index: number) => void;
    acceptedTypes?: string[];
    maxFiles?: number;
}

const DEFAULT_ACCEPTED_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'text/plain',
    'text/markdown'
];

export function FileDropZone({
    onFilesSelected,
    files,
    onRemoveFile,
    acceptedTypes = DEFAULT_ACCEPTED_TYPES,
    maxFiles = 5
}: FileDropZoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFiles = Array.from(e.dataTransfer.files);
        processFiles(droppedFiles);
    };

    const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            processFiles(selectedFiles);
        }
    };

    const processFiles = (newFiles: File[]) => {
        const validFiles = newFiles.filter(file => {
            const isValidType = acceptedTypes.some(type => {
                if (type.endsWith('/*')) {
                    return file.type.startsWith(type.replace('/*', ''));
                }
                return file.type === type;
            });
            return isValidType;
        });

        const totalFiles = files.length + validFiles.length;
        const filesToAdd = validFiles.slice(0, maxFiles - files.length);

        if (filesToAdd.length > 0) {
            onFilesSelected([...files, ...filesToAdd]);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const getFileIcon = (file: File) => {
        if (file.type.startsWith('image/')) {
            return <Image size={16} className="text-sage" />;
        }
        return <FileText size={16} className="text-gold" />;
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className="space-y-3">
            <div
                onClick={handleClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                    relative border-2 border-dashed rounded-2xl p-6 transition-all cursor-pointer
                    ${isDragging
                        ? 'border-gold bg-gold/5'
                        : 'border-charcoal/10 hover:border-gold/40 hover:bg-background/50'
                    }
                `}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={acceptedTypes.join(',')}
                    onChange={handleFileInput}
                    className="hidden"
                />

                <div className="flex flex-col items-center gap-2 text-center">
                    <div className={`p-3 rounded-full transition-colors ${isDragging ? 'bg-gold/20' : 'bg-charcoal/5'}`}>
                        <Upload size={20} className={isDragging ? 'text-gold' : 'text-charcoal/40'} />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-charcoal">
                            {isDragging ? 'Drop files here' : 'Drag files or click to upload'}
                        </p>
                        <p className="text-[10px] text-charcoal/40 mt-1">
                            PDF, Images, or Text files (max {maxFiles})
                        </p>
                    </div>
                </div>
            </div>

            {files.length > 0 && (
                <div className="space-y-2">
                    {files.map((file, index) => (
                        <div
                            key={`${file.name}-${index}`}
                            className="flex items-center justify-between p-3 rounded-xl bg-white/60 border border-charcoal/5"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                {getFileIcon(file)}
                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-charcoal truncate">
                                        {file.name}
                                    </p>
                                    <p className="text-[10px] text-charcoal/40">
                                        {formatFileSize(file.size)}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemoveFile(index);
                                }}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-charcoal/40 hover:text-red-500 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
