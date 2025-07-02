// App.tsx
// This is the main component that sets up routing for the entire application using React Router.
// It determines which page (component) to show based on the URL path.

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Import routing components from React Router
import HomePage from './pages/HomePage'; // Home page component
import DataSourcePage from './pages/DataSourcePage'; // Page for uploading files or connecting to a database
import DataCleaningPage from './pages/DataCleaningPage'; // Page for selecting and cleaning data columns
import ReportTypePage from './pages/ReportTypePage'; // Page for choosing the type of report
import ReportViewerPage from './pages/ReportViewerPage'; // Page for viewing the generated report
import './App.css' // Import global styles

function App() {
  // The Router component enables navigation between different pages.
  // The Routes component contains all the possible routes (pages) in the app.
  // Each Route specifies a path and the component to render for that path.
  return (
    <Router>
      <Routes>
        {/* Home page route (default) */}
        <Route path="/" element={<HomePage />} />
        {/* Data source selection (file upload or DB connect) */}
        <Route path="/data-source" element={<DataSourcePage />} />
        {/* Data cleaning page */}
        <Route path="/data-cleaning" element={<DataCleaningPage />} />
        {/* Report type selection page */}
        <Route path="/report-type" element={<ReportTypePage />} />
        {/* Report viewer page */}
        <Route path="/report-viewer" element={<ReportViewerPage />} />
      </Routes>
    </Router>
  )
}

export default App // Export the App component so it can be used in main.tsx
