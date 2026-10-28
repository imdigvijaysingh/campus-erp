import React, { useState, useRef } from 'react';

const DragDropUpload = ({ 
  onFileSelect, 
  accept = "image/*,video/*,application/pdf", 
  label = "Drag & drop file here or click to browse",
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = (file) => {
    if (!file) return;
    setSelectedFile(file);
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const clearSelection = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onFileSelect) {
      onFileSelect(null);
    }
  };

  return (
    <div 
      className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-all cursor-pointer 
        ${isDragging ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:bg-gray-50 bg-white'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleChange} 
        accept={accept}
        className="hidden" 
      />
      
      {selectedFile ? (
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
            <i className="fas fa-check text-xl"></i>
          </div>
          <p className="text-gray-800 font-semibold mb-1 max-w-[200px] truncate" title={selectedFile.name}>
            {selectedFile.name}
          </p>
          <p className="text-xs text-gray-500 mb-3">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
          <button 
            type="button"
            onClick={clearSelection}
            className="text-xs text-[#6D4C9C] hover:text-[#5B21B6] font-medium"
          >
            Remove File
          </button>
        </div>
      ) : (
        <>
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-3">
            <i className="fas fa-cloud-upload-alt text-xl"></i>
          </div>
          <p className="text-gray-800 font-medium mb-1 text-sm">{label}</p>
          <p className="text-xs text-gray-400">Supports PDF, Image, Video</p>
        </>
      )}
    </div>
  );
};

export default DragDropUpload;
