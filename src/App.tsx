import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DataSourcePage from './pages/DataSourcePage';
import DataCleaningPage from './pages/DataCleaningPage';
import ReportTypePage from './pages/ReportTypePage';
import ReportViewerPage from './pages/ReportViewerPage';
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/data-source" element={<DataSourcePage />} />
        <Route path="/data-cleaning" element={<DataCleaningPage />} />
        <Route path="/report-type" element={<ReportTypePage />} />
        <Route path="/report-viewer" element={<ReportViewerPage />} />
      </Routes>
    </Router>
  )
}

export default App
