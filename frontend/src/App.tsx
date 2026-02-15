import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { PublicOnlyRoute } from "./components/auth/PublicOnlyRoute";
import {
  Landing,
  Dashboard,
  WaterIrrigation,
  CropRecommendation,
  YieldPest,
  MarketPrices,
  GovernmentSchemes,
  SchemesAdmin,
  Login,
  SignUp,
  Assistance,
  Reports,
  Settings,
} from "./pages";

function App() {
  return (
    <Routes>
      {/* Public Landing Page - accessible to all */}
      <Route path="/landing" element={<Landing />} />
      
      {/* Public Auth Pages */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicOnlyRoute>
            <SignUp />
          </PublicOnlyRoute>
        }
      />

      {/* Protected Dashboard Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="water" element={<WaterIrrigation />} />
        <Route path="crop" element={<CropRecommendation />} />
        <Route path="yield" element={<YieldPest />} />
        <Route path="market" element={<MarketPrices />} />
        <Route path="schemes" element={<GovernmentSchemes />} />
        <Route path="schemes/admin" element={<SchemesAdmin />} />
        <Route path="assistance" element={<Assistance />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Catch all - redirect to landing for unauthenticated, dashboard for authenticated */}
      <Route path="*" element={<Navigate to="/landing" replace />} />
    </Routes>
  );
}

export default App;
