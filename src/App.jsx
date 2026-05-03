import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./routes/PrivateRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CategoryQuizzes from "./pages/CategoryQuizzes";
import QuizQuestions from "./pages/QuizQuestions";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Protected */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/categories/:categoryId" element={<CategoryQuizzes />} />
            <Route path="/dashboard/categories/:categoryId/quizzes/:quizId" element={<QuizQuestions />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#1A1A1A",
            color: "#FFFFFF",
            border: "1px solid #2A2A2A",
            fontSize: "13px",
            borderRadius: "10px",
          },
          success: { iconTheme: { primary: "#22C55E", secondary: "#1A1A1A" } },
          error:   { iconTheme: { primary: "#EF4444", secondary: "#1A1A1A" } },
        }}
      />
    </AuthProvider>
  );
}