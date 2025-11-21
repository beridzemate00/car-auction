import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import CarListPage from "./pages/CarListPage";
import CarDetailPage from "./pages/CarDetailPage";

const App: React.FC = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<CarListPage />} />
        <Route path="/auctions/:id" element={<CarDetailPage />} />
        <Route path="*" element={<p>Not found</p>} />
      </Routes>
    </Layout>
  );
};

export default App;
