import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CataloguePage from './pages/CataloguePage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import EnquiryPage from './pages/EnquiryPage';
import HealthPage from './pages/HealthPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalogue" element={<CataloguePage />} />
        <Route path="/product/:id" element={<ProductDetailsPage />} />
        <Route path="/enquiry" element={<EnquiryPage />} />
        <Route path="/health" element={<HealthPage />} />
      </Routes>
    </Router>
  );
}

export default App;
