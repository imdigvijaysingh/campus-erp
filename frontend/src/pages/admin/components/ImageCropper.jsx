import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';

const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = new Image();
  image.src = imageSrc;
  await new Promise(resolve => image.onload = resolve);

  const canvas = document.createElement('canvas');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext('2d');

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

  return new Promise((resolve) => {
    canvas.toBlob((file) => {
      resolve(URL.createObjectURL(file));
    }, 'image/jpeg');
  });
};

const ImageCropper = ({ imageSrc, onCropComplete, onCancel, aspect = 1 }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const handleCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      // We can convert this blob URL back to a base64 string for the backend or return it
      const response = await fetch(croppedImage);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        onCropComplete(reader.result); // Base64 string
      };
      reader.readAsDataURL(blob);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex flex-col items-center justify-center p-4">
      <div className="bg-white p-4 rounded-xl shadow-2xl w-full max-w-lg">
        <h3 className="text-lg font-bold mb-4">Crop Image</h3>
        <div className="relative w-full h-64 bg-gray-200 rounded-lg overflow-hidden">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onCropComplete={handleCropComplete}
            onZoomChange={setZoom}
          />
        </div>
        <div className="mt-4 flex items-center gap-4">
          <label className="text-sm font-medium">Zoom</label>
          <input 
            type="range" 
            min={1} 
            max={3} 
            step={0.1} 
            value={zoom} 
            onChange={e => setZoom(e.target.value)}
            className="flex-1"
          />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 bg-[#6D4C9C] text-white rounded-lg hover:bg-[#5B21B6]">Apply Crop</button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
