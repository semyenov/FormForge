import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import "./index.css";

// Components
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import FormBuilder from "./pages/FormBuilder";
import FormSubmission from "./pages/FormSubmission";
import FormList from "./pages/FormList";
import FormTemplateList from "./pages/FormTemplateList";
import OrganizationList from "./pages/OrganizationList";
import ReviewList from "./pages/ReviewList";
import Layout from "./components/Layout";
import AuthGuard from "./components/AuthGuard";

// Auth context
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";

const queryClient = new QueryClient();
const client = new ApolloClient({
  uri: "http://localhost:5173/api/graphql",
  cache: new InMemoryCache(),
  credentials: "include",
});

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={!user ? <Login /> : <Navigate to="/dashboard" />}
      />
      <Route
        path="/register"
        element={!user ? <Register /> : <Navigate to="/dashboard" />}
      />

      <Route
        path="/api/graphql"
      ></Route>

      <Route
        path="/"
        element={
          <AuthGuard>
            <Layout />
          </AuthGuard>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />

        {/* Forms routes */}
        <Route path="forms" element={<FormList />} />
        <Route path="forms/new" element={<FormBuilder />} />
        <Route path="forms/:formId" element={<FormBuilder />} />
        <Route path="forms/:formId/submit" element={<FormSubmission />} />

        {/* Templates routes */}
        <Route path="templates" element={<FormTemplateList />} />
        <Route path="templates/new" element={<FormBuilder />} />
        <Route path="templates/:templateId" element={<FormBuilder />} />
        <Route path="templates/:templateId/edit" element={<FormBuilder />} />

        {/* Organizations routes */}
        <Route path="organizations" element={<OrganizationList />} />

        {/* Reviews routes */}
        <Route path="reviews" element={<ReviewList />} />
        <Route path="reviews/:reviewId" element={<FormSubmission />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    link.onload = () => setFontsLoaded(true);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ApolloProvider client={client}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
            <Toaster position="top-right" />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ApolloProvider>
  );
}

export default App;
