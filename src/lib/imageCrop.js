// Extracts the exact crop rectangle (from react-easy-crop's onCropComplete)
// as a Blob. The output feeds straight into resizeImageToSquareJpeg, whose
// own center-crop-to-square step becomes a no-op since the rect is already
// square (aspect=1 is enforced in the crop UI) — so that function needs no
// changes at all.
export function getCroppedImageBlob(imageSrc, croppedAreaPixels) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(
        img,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
      );
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to crop image'));
      }, 'image/png');
    };
    img.onerror = () => reject(new Error('Failed to load image for cropping'));
    img.src = imageSrc;
  });
}
