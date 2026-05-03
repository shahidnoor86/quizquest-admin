import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Plus, Grid3X3, ChevronRight, Search, Trash2, Loader2 } from "lucide-react";

import Sidebar from "../components/Sidebar";
import Modal from "../components/Modal";
import SkeletonCard from "../components/SkeletonCard";
import ConfirmDialog from "../components/ConfirmDialog";
import { useCollection } from "../hooks/useFirestore";
import { addDocument, deleteDocument } from "../firebase/firestore";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  iconUrl: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  parent_cat_id: z.string().optional(),
});

function CategoryCard({ cat, onDelete }) {
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => navigate(`/dashboard/categories/${cat.id}`)}
        className="group relative bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6 cursor-pointer
          transition-all duration-200 hover:border-indigo-500/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.15)]"
      >
        {/* Delete button */}
        <button
          onClick={(e) => { e.stopPropagation(); setConfirmOpen(true); }}
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg
            flex items-center justify-center text-[#52525B] hover:text-red-400 hover:bg-red-500/10
            transition-all duration-200"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        {/* Icon */}
        <div className="w-10 h-10 rounded-lg bg-[#252525] border border-[#2A2A2A] overflow-hidden mb-4 flex items-center justify-center">
          {cat.iconUrl ? (
            <img src={cat.iconUrl} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />
          ) : (
            <Grid3X3 className="w-5 h-5 text-[#52525B]" />
          )}
        </div>

        <h3 className="text-white font-semibold text-sm mb-1 leading-tight">{cat.name}</h3>
        <p className="text-[#A1A1AA] text-xs leading-relaxed line-clamp-2 mb-3">{cat.description}</p>

        {cat.parent_cat_id && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 mb-2">
            Sub-category
          </span>
        )}

        <ChevronRight className="absolute bottom-4 right-4 w-4 h-4 text-[#52525B] group-hover:text-indigo-400 transition-colors duration-200" />
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        message={`Delete category "${cat.name}"? All associated quizzes may be affected.`}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={async () => {
          await deleteDocument("quiz_categories", cat.id);
          toast.success("Category deleted");
          setConfirmOpen(false);
          onDelete?.();
        }}
      />
    </>
  );
}

function AddCategoryModal({ isOpen, onClose }) {
  const [submitting, setSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const iconUrlValue = watch("iconUrl");

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await addDocument("quiz_categories", {
        name: data.name,
        description: data.description,
        iconUrl: data.iconUrl || "",
        parent_cat_id: data.parent_cat_id || "",
      });
      toast.success("Category created!");
      reset();
      setPreviewUrl("");
      onClose();
    } catch {
      toast.error("Failed to create category.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => { reset(); setPreviewUrl(""); onClose(); };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Category">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Name *" error={errors.name?.message}>
          <input placeholder="e.g. Science" {...register("name")} className={inputCls(errors.name)} />
        </Field>

        <Field label="Description *" error={errors.description?.message}>
          <textarea rows={3} placeholder="Brief description…" {...register("description")} className={inputCls(errors.description)} />
        </Field>

        <Field label="Icon URL" error={errors.iconUrl?.message}>
          <input placeholder="https://…" {...register("iconUrl")} className={inputCls(errors.iconUrl)} />
          {iconUrlValue && (
            <img src={iconUrlValue} alt="preview" className="mt-2 w-12 h-12 rounded-lg object-cover border border-[#2A2A2A]"
              onError={(e) => { e.target.style.display = "none"; }} />
          )}
        </Field>

        <Field label="Parent Category ID" error={errors.parent_cat_id?.message}>
          <input placeholder="Optional parent doc ID" {...register("parent_cat_id")} className={inputCls(errors.parent_cat_id)} />
        </Field>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={handleClose}
            className="flex-1 py-2.5 rounded-lg border border-[#2A2A2A] text-[#A1A1AA] hover:text-white hover:bg-[#252525] text-sm font-medium transition-all duration-200">
            Cancel
          </button>
          <button type="submit" disabled={submitting}
            className="flex-1 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-sm font-semibold transition-all duration-200 shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2">
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</> : "Create Category"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Shared form helpers ──────────────────────────────────────────────────────
const inputCls = (err) =>
  `w-full bg-[#0F0F0F] border ${err ? "border-red-500/70" : "border-[#2A2A2A]"} rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-[#52525B] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 transition-all duration-200 resize-none`;

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm text-[#A1A1AA] mb-1.5 font-medium">{label}</label>
      {children}
      {error && <p className="mt-1 text-red-400 text-xs">{error}</p>}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { data: categories, loading } = useCollection("categories");
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = categories.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex">
      <Sidebar />

      <main className="flex-1 ml-60 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-white text-2xl font-bold tracking-tight">Quiz Categories</h1>
            <p className="text-[#A1A1AA] text-sm mt-0.5">{categories.length} categor{categories.length === 1 ? "y" : "ies"}</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-all duration-200 shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525B]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories…"
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg pl-9 pr-4 py-2.5 text-white text-sm placeholder:text-[#52525B] focus:outline-none focus:border-indigo-500 transition-all duration-200"
          />
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title={search ? "No categories match your search" : "No categories yet"}
            desc={search ? "Try a different search term." : "Create your first category to get started."}
            cta={!search && { label: "Add Category", onClick: () => setModalOpen(true) }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((cat) => <CategoryCard key={cat.id} cat={cat} />)}
          </div>
        )}
      </main>

      <AddCategoryModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

function EmptyState({ title, desc, cta }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center mb-4">
        <Grid3X3 className="w-7 h-7 text-[#52525B]" />
      </div>
      <h3 className="text-white font-semibold text-base mb-1">{title}</h3>
      <p className="text-[#A1A1AA] text-sm mb-5">{desc}</p>
      {cta && (
        <button
          onClick={cta.onClick}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          {cta.label}
        </button>
      )}
    </div>
  );
}