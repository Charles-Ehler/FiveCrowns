export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-sm rounded-t-3xl bg-white p-5 shadow-2xl dark:bg-gray-900 sm:rounded-3xl animate-pop-in">
        <h2 className="text-lg font-semibold">{title}</h2>
        {message && <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{message}</p>}
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-gray-300 py-3 font-medium transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-red-600 py-3 font-medium text-white transition active:scale-[0.98]"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
