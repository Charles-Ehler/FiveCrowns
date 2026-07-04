import { useCallback, useState } from 'react';
import Cropper from 'react-easy-crop';
import { ZoomIn, ZoomOut } from 'lucide-react';

// Circular crop shape to match the Avatar component (always rounded-full)
// everywhere else in the app. react-easy-crop handles drag-to-reposition and
// pinch/wheel-to-zoom internally — no hand-rolled gesture math.
export default function PhotoCropModal({ imageSrc, onCancel, onConfirm }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleCropComplete = useCallback((_area, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  async function handleConfirm() {
    if (!croppedAreaPixels || saving) return;
    setSaving(true);
    await onConfirm(croppedAreaPixels);
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/90">
      <div className="px-4 py-3 text-center text-sm font-semibold text-white">Adjust photo</div>

      <div className="relative flex-1 overflow-hidden">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape="round"
          showGrid={false}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={handleCropComplete}
        />
      </div>

      <div className="space-y-3 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-3 text-white">
          <ZoomOut size={16} className="shrink-0" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-violet-500"
            aria-label="Zoom"
          />
          <ZoomIn size={16} className="shrink-0" />
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="flex-1 rounded-xl border border-white/30 py-3 font-medium text-white transition-colors hover:bg-white/10 disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!croppedAreaPixels || saving}
            className="flex-1 rounded-xl bg-violet-600 py-3 font-semibold text-white shadow-sm transition active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
