import React, { useState, useRef } from 'react';
import Cropper from 'react-easy-crop';
import { toast } from 'react-hot-toast';

// Helper function to create the cropped image
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  // Set canvas size to the cropped size
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Draw the cropped image onto the canvas
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // Return base64 string
  return canvas.toDataURL('image/jpeg');
};

const ProfileImageCropper = ({ currentPhoto, onUpload, onRemove }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const processFile = (file) => {
    // Check file size (1MB limit)
    if (file.size > 1024 * 1024) {
      toast.error('Image must be under 1 MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setImageSrc(reader.result?.toString() || null);
      setIsCropping(true);
    });
    reader.readAsDataURL(file);
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
      e.target.value = '';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleUpload = async () => {
    try {
      setIsUploading(true);
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      await onUpload(croppedImage);
      setIsCropping(false);
      setImageSrc(null);
    } catch (e) {
      console.error(e);
      toast.error('Failed to crop image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div 
      className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${isDragging ? 'border-blue-400 bg-purple-50' : 'border-transparent'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Profile Photo Display */}
      <div className={`relative group mb-4 transition-transform ${isDragging ? 'scale-105' : ''}`}>
        <div className={`h-24 w-24 rounded-full border-4 shadow-lg overflow-hidden flex items-center justify-center transition-colors ${isDragging ? 'border-blue-400 bg-purple-100' : 'border-white bg-gray-100'}`}>
          {currentPhoto && !isDragging ? (
             <img src={currentPhoto} alt="Profile" className="h-full w-full object-cover" />
          ) : (
            <i className={`fas fa-user text-3xl ${isDragging ? 'text-blue-400' : 'text-gray-400'}`}></i>
          )}
        </div>
        
        {/* Hover overlay for changing photo */}
        <div 
          className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <i className="fas fa-camera text-white mb-1"></i>
          <span className="text-white text-xs font-medium text-center px-1">Click or Drag</span>
        </div>
      </div>

      <div className="flex gap-2">
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileChange} 
        />
        <button 
          onClick={() => fileInputRef.current?.click()} 
          className="text-xs px-3 py-1.5 bg-purple-50 text-[#6D4C9C] font-medium rounded-lg hover:bg-purple-100 transition"
        >
          Upload Photo
        </button>
        {currentPhoto && (
          <button 
            onClick={onRemove} 
            className="text-xs px-3 py-1.5 bg-purple-50 text-red-600 font-medium rounded-lg hover:bg-purple-100 transition"
          >
            Remove
          </button>
        )}
      </div>

      {/* Cropper Modal */}
      {isCropping && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl overflow-hidden w-full max-w-md shadow-2xl flex flex-col h-[500px]">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800">Crop Profile Picture</h3>
              <button onClick={() => setIsCropping(false)} className="text-gray-500 hover:text-gray-700">
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="relative flex-1 bg-gray-900">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            
            <div className="p-4 bg-white border-t space-y-4">
              <div>
                <label className="text-xs text-gray-500 font-medium block mb-1">Zoom</label>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(e.target.value)}
                  className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button 
                  onClick={() => setIsCropping(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="px-4 py-2 text-sm font-bold bg-[#6D4C9C] text-white hover:bg-[#5B21B6] rounded-lg transition flex items-center gap-2"
                >
                  {isUploading ? (
                    <><i className="fas fa-spinner fa-spin"></i> Saving...</>
                  ) : (
                    <><i className="fas fa-check"></i> Save Photo</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileImageCropper;
