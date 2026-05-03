import { AlertTriangle } from "lucide-react";

export default function ConfirmDialog({ isOpen, onConfirm, onCancel, message }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6 shadow-2xl">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/25 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-base mb-1">Confirm Delete</h3>
            <p className="text-[#A1A1AA] text-sm">{message ?? "This action cannot be undone."}</p>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-lg border border-[#2A2A2A] text-[#A1A1AA] hover:text-white hover:bg-[#252525] text-sm font-medium transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-all duration-200 shadow-lg shadow-red-600/20"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}