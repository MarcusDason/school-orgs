export default function getCroppedImg(imageSrc, crop) {
  const image = new Image();
  image.src = imageSrc;

  return new Promise((resolve, reject) => {
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const pixelCrop = {
        x: Math.round(crop.x * image.naturalWidth / 100),
        y: Math.round(crop.y * image.naturalHeight / 100),
        width: Math.round(crop.width * image.naturalWidth / 100),
        height: Math.round(crop.height * image.naturalHeight / 100),
      };

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

      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error('Canvas is empty'));
        const fileUrl = URL.createObjectURL(blob);
        resolve(fileUrl);
      }, 'image/jpeg');
    };
    image.onerror = () => reject(new Error('Failed to load image'));
  });
}