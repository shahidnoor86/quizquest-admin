import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Plus, BookOpen, ChevronRight, Trash2, ListChecks, Loader2 } from "lucide-react";

import Sidebar from "../components/Sidebar";
import Modal from "../components/Modal";
import Breadcrumb from "../components/Breadcrumb";
import DifficultyBadge from "../components/DifficultyBadge";
import ConfirmDialog from "../components/ConfirmDialog";
import { SkeletonList } from "../components/SkeletonCard";
import { useCollectionWhere } from "../hooks/useFirestore";
import { addDocument, deleteDocument, getDocument } from "../firebase/firestore";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  difficulty: z.enum(["Easy", "Medium", "Hard"], { required_error: "Select a difficulty" }),
  total_questions: z.coerce.number().min(1, "Must be at least 1"),
});

// ─── Quiz card ────────────────────────────────────────────────────────────────
function QuizCard({ quiz, categoryId }) {
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => navigate(`/dashboard/categories/${categoryId}/quizzes/${quiz.id}`)}
        className="group relative bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6 cursor-pointer
          transition-all duration-200 hover:border-indigo-500/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.15)]"
      >
        <button
          onClick={(e) => { e.stopPropagation(); setConfirmOpen(true); }}
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg
            flex items-center justify-center text-[#52525B] hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-white font-semibold text-sm leading-tight flex-1">{quiz.title}</h3>
          <DifficultyBadge difficulty={quiz.difficulty} />
        </div>

        <p className="text-[#A1A1AA] text-xs leading-relaxed line-clamp-2 mb-4">{quiz.description}</p>

        <div className="flex items-center gap-1.5 text-[#A1A1AA] text-xs">
          <ListChecks className="w-3.5 h-3.5" />
          <span>{quiz.total_questions} question{quiz.total_questions !== 1 ? "s" : ""}</span>
        </div>

        <ChevronRight className="absolute bottom-4 right-4 w-4 h-4 text-[#52525B] group-hover:text-indigo-400 transition-colors duration-200" />
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        message={`Delete quiz "${quiz.title}"?`}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={async () => {
          await deleteDocument("quizzes", quiz.id);
          toast.success("Quiz deleted");
          setConfirmOpen(false);
        }}
      />
    </>
  );
}

// ─── Add quiz modal ───────────────────────────────────────────────────────────
function AddQuizModal({ isOpen, onClose, categoryId }) {
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await addDocument("quizzes", { ...data, cat_id: categoryId });
      toast.success("Quiz created!");
      reset();
      onClose();
    } catch {
      toast.error("Failed to create quiz.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => { reset(); onClose(); };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Quiz">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Title *" error={errors.title?.message}>
          <input placeholder="Quiz title" {...register("title")} className={inputCls(errors.title)} />
        </Field>

        <Field label="Description *" error={errors.description?.message}>
          <textarea rows={3} placeholder="What this quiz covers…" {...register("description")} className={inputCls(errors.description)} />
        </Field>

        <Field label="Difficulty *" error={errors.difficulty?.message}>
          <select {...register("difficulty")} className={inputCls(errors.difficulty)}>
            <option value="">Select difficulty</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </Field>

        <Field label="Total Questions *" error={errors.total_questions?.message}>
          <input type="number" min={1} placeholder="10" {...register("total_questions")} className={inputCls(errors.total_questions)} />
        </Field>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={handleClose}
            className="flex-1 py-2.5 rounded-lg border border-[#2A2A2A] text-[#A1A1AA] hover:text-white hover:bg-[#252525] text-sm font-medium transition-all duration-200">
            Cancel
          </button>
          <button type="submit" disabled={submitting}
            className="flex-1 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-sm font-semibold transition-all duration-200 shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2">
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</> : "Create Quiz"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

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
export default function CategoryQuizzes() {
  const { categoryId } = useParams();
  const [modalOpen, setModalOpen] = useState(false);
  const [catName, setCatName] = useState("…");

  const { data: quizzes, loading } = useCollectionWhere("quizzes", "cat_id", categoryId);

  useEffect(() => {
    getDocument("quiz_categories", categoryId).then((snap) => {
      if (snap.exists()) setCatName(snap.data().name);
    });
  }, [categoryId]);

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex">
      <Sidebar />

      <main className="flex-1 ml-60 p-8">
        <Breadcrumb crumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: catName },
        ]} />

        <div className="flex items-center justify-between mb-6 mt-1">
          <div>
            <h1 className="text-white text-2xl font-bold tracking-tight">{catName} — Quizzes</h1>
            <p className="text-[#A1A1AA] text-sm mt-0.5">{quizzes.length} quiz{quizzes.length !== 1 ? "zes" : ""}</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-all duration-200 shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            Add Quiz
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6 space-y-3">
                <div className="h-4 w-3/4 rounded bg-[#2A2A2A] animate-pulse" />
                <div className="h-3 w-full rounded bg-[#252525] animate-pulse" />
                <div className="h-3 w-1/2 rounded bg-[#252525] animate-pulse" />
              </div>
            ))}
          </div>
        ) : quizzes.length === 0 ? (
          <EmptyState catName={catName} onAdd={() => setModalOpen(true)} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((q) => <QuizCard key={q.id} quiz={q} categoryId={categoryId} />)}
          </div>
        )}
      </main>

      <AddQuizModal isOpen={modalOpen} onClose={() => setModalOpen(false)} categoryId={categoryId} />
    </div>
  );
}

function EmptyState({ catName, onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center mb-4">
        <BookOpen className="w-7 h-7 text-[#52525B]" />
      </div>
      <h3 className="text-white font-semibold text-base mb-1">No quizzes in {catName}</h3>
      <p className="text-[#A1A1AA] text-sm mb-5">Add your first quiz to this category.</p>
      <button onClick={onAdd}
        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-all duration-200">
        <Plus className="w-4 h-4" /> Add Quiz
      </button>
    </div>
  );
}