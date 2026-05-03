import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import {
  Plus, Trash2, ChevronDown, ChevronUp, Image as ImageIcon,
  HelpCircle, Check, Loader2, Star,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Modal from "../components/Modal";
import Breadcrumb from "../components/Breadcrumb";
import ConfirmDialog from "../components/ConfirmDialog";
import { SkeletonList } from "../components/SkeletonCard";
import { useCollectionWhere } from "../hooks/useFirestore";
import { addDocument, deleteDocument, getDocument } from "../firebase/firestore";

// ─── Zod schema ───────────────────────────────────────────────────────────────
const schema = z.object({
  title: z.string().min(1, "Question text is required"),
  options: z
    .array(z.object({ value: z.string().min(1, "Option cannot be empty") }))
    .min(2, "At least 2 options required"),
  correctOptionIndex: z.coerce.number().min(0),
  explanation: z.string().optional(),
  imageUrl: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  points: z.coerce.number().min(1, "Must be at least 1 point"),
});

// ─── Question card ────────────────────────────────────────────────────────────
function QuestionCard({ question, index }) {
  const [showExplanation, setShowExplanation] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <div className="group bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6 transition-all duration-200 hover:border-indigo-500/30">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-start gap-3 flex-1">
            <span className="shrink-0 w-7 h-7 rounded-lg bg-indigo-600/15 border border-indigo-500/25 text-indigo-400 text-xs font-bold flex items-center justify-center">
              {index + 1}
            </span>
            <h3 className="text-white font-semibold text-sm leading-relaxed">{question.title}</h3>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="flex items-center gap-1 text-amber-400 text-xs font-medium bg-amber-500/10 border border-amber-500/20 rounded-full px-2.5 py-0.5">
              <Star className="w-3 h-3" />
              {question.points} pts
            </span>
            <button
              onClick={() => setConfirmOpen(true)}
              className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center text-[#52525B] hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Image */}
        {question.imageUrl && (
          <img
            src={question.imageUrl}
            alt=""
            className="w-full max-h-40 object-cover rounded-lg mb-4 border border-[#2A2A2A]"
            onError={(e) => { e.target.style.display = "none"; }}
          />
        )}

        {/* Options */}
        <div className="space-y-2 mb-4">
          {question.options?.map((opt, i) => {
            const isCorrect = i === question.correctOptionIndex;
            return (
              <div key={i}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm border transition-all ${
                  isCorrect
                    ? "bg-green-500/10 border-green-500/30 text-green-400"
                    : "bg-[#252525] border-[#2A2A2A] text-[#A1A1AA]"
                }`}
              >
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                  isCorrect ? "border-green-500 bg-green-500" : "border-[#3A3A3A]"
                }`}>
                  {isCorrect && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                </div>
                <span className={isCorrect ? "font-medium" : ""}>{opt}</span>
              </div>
            );
          })}
        </div>

        {/* Explanation toggle */}
        {question.explanation && (
          <button
            onClick={() => setShowExplanation((p) => !p)}
            className="flex items-center gap-1.5 text-xs text-[#A1A1AA] hover:text-indigo-400 transition-colors duration-150 mb-2"
          >
            {showExplanation ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {showExplanation ? "Hide" : "Show"} explanation
          </button>
        )}
        {showExplanation && question.explanation && (
          <div className="bg-[#252525] border border-[#2A2A2A] rounded-lg px-3 py-2.5 text-[#A1A1AA] text-xs leading-relaxed">
            {question.explanation}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        message="Delete this question?"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={async () => {
          await deleteDocument("questions", question.id);
          toast.success("Question deleted");
          setConfirmOpen(false);
        }}
      />
    </>
  );
}

// ─── Add question modal ───────────────────────────────────────────────────────
function AddQuestionModal({ isOpen, onClose, quizId }) {
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, watch, control, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      options: [{ value: "" }, { value: "" }, { value: "" }, { value: "" }],
      points: 10,
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "options" });
  const imageUrlValue = watch("imageUrl");
  const optionsWatch = watch("options");

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await addDocument("questions", {
        title: data.title,
        options: data.options.map((o) => o.value),
        correctOptionIndex: data.correctOptionIndex,
        explanation: data.explanation || "",
        imageUrl: data.imageUrl || "",
        points: data.points,
        quizId,
      });
      toast.success("Question added!");
      reset({
        options: [{ value: "" }, { value: "" }, { value: "" }, { value: "" }],
        points: 10,
      });
      onClose();
    } catch {
      toast.error("Failed to add question.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    reset({ options: [{ value: "" }, { value: "" }, { value: "" }, { value: "" }], points: 10 });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Question" maxWidth="max-w-xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Question *" error={errors.title?.message}>
          <textarea rows={2} placeholder="Enter the question text…" {...register("title")} className={inputCls(errors.title)} />
        </Field>

        {/* Options */}
        <div>
          <label className="block text-sm text-[#A1A1AA] mb-2 font-medium">Options *</label>
          <div className="space-y-2">
            {fields.map((field, i) => (
              <div key={field.id} className="flex items-center gap-2">
                <span className="text-[#52525B] text-xs w-5 shrink-0 text-right">{i + 1}.</span>
                <input
                  placeholder={`Option ${i + 1}`}
                  {...register(`options.${i}.value`)}
                  className={`flex-1 ${inputCls(errors.options?.[i]?.value)}`}
                />
                {fields.length > 2 && (
                  <button type="button" onClick={() => remove(i)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[#52525B] hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {errors.options && typeof errors.options === "object" && !Array.isArray(errors.options) && (
            <p className="mt-1 text-red-400 text-xs">{errors.options.message}</p>
          )}
          <button type="button" onClick={() => append({ value: "" })}
            className="mt-2 flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors duration-150">
            <Plus className="w-3.5 h-3.5" /> Add option
          </button>
        </div>

        {/* Correct answer */}
        <Field label="Correct Answer *" error={errors.correctOptionIndex?.message}>
          <select {...register("correctOptionIndex")} className={inputCls(errors.correctOptionIndex)}>
            {fields.map((_, i) => (
              <option key={i} value={i}>Option {i + 1}{optionsWatch[i]?.value ? ` — ${optionsWatch[i].value}` : ""}</option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Points *" error={errors.points?.message}>
            <input type="number" min={1} placeholder="10" {...register("points")} className={inputCls(errors.points)} />
          </Field>

          <Field label="Image URL" error={errors.imageUrl?.message}>
            <input placeholder="https://…" {...register("imageUrl")} className={inputCls(errors.imageUrl)} />
          </Field>
        </div>

        {imageUrlValue && (
          <img src={imageUrlValue} alt="preview"
            className="w-full max-h-32 object-cover rounded-lg border border-[#2A2A2A]"
            onError={(e) => { e.target.style.display = "none"; }} />
        )}

        <Field label="Explanation" error={errors.explanation?.message}>
          <textarea rows={2} placeholder="Explain the correct answer (optional)…" {...register("explanation")} className={inputCls(errors.explanation)} />
        </Field>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={handleClose}
            className="flex-1 py-2.5 rounded-lg border border-[#2A2A2A] text-[#A1A1AA] hover:text-white hover:bg-[#252525] text-sm font-medium transition-all duration-200">
            Cancel
          </button>
          <button type="submit" disabled={submitting}
            className="flex-1 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-sm font-semibold transition-all duration-200 shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2">
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Adding…</> : "Add Question"}
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
export default function QuizQuestions() {
  const { categoryId, quizId } = useParams();
  const [modalOpen, setModalOpen] = useState(false);
  const [catName, setCatName] = useState("…");
  const [quizTitle, setQuizTitle] = useState("…");

  const { data: questions, loading } = useCollectionWhere("questions", "quizId", quizId);

  useEffect(() => {
    getDocument("quiz_categories", categoryId).then((s) => { if (s.exists()) setCatName(s.data().name); });
    getDocument("quizzes", quizId).then((s) => { if (s.exists()) setQuizTitle(s.data().title); });
  }, [categoryId, quizId]);

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex">
      <Sidebar />

      <main className="flex-1 ml-60 p-8">
        <Breadcrumb crumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: catName, to: `/dashboard/categories/${categoryId}` },
          { label: quizTitle },
        ]} />

        <div className="flex items-center justify-between mb-6 mt-1">
          <div>
            <h1 className="text-white text-2xl font-bold tracking-tight">{quizTitle} — Questions</h1>
            <p className="text-[#A1A1AA] text-sm mt-0.5">{questions.length} question{questions.length !== 1 ? "s" : ""}</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-all duration-200 shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            Add Question
          </button>
        </div>

        {loading ? (
          <SkeletonList />
        ) : questions.length === 0 ? (
          <EmptyState quizTitle={quizTitle} onAdd={() => setModalOpen(true)} />
        ) : (
          <div className="space-y-4 max-w-3xl">
            {questions.map((q, i) => <QuestionCard key={q.id} question={q} index={i} />)}
          </div>
        )}
      </main>

      <AddQuestionModal isOpen={modalOpen} onClose={() => setModalOpen(false)} quizId={quizId} />
    </div>
  );
}

function EmptyState({ quizTitle, onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center mb-4">
        <HelpCircle className="w-7 h-7 text-[#52525B]" />
      </div>
      <h3 className="text-white font-semibold text-base mb-1">No questions yet</h3>
      <p className="text-[#A1A1AA] text-sm mb-5">Add questions to "{quizTitle}"</p>
      <button onClick={onAdd}
        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-all duration-200">
        <Plus className="w-4 h-4" /> Add Question
      </button>
    </div>
  );
}