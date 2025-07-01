import Header from './components/Header'
import SectionOne from './components/SectionOne'
import SectionTwo from './components/SectionTwo'
import Footer from './components/Footer'
import './App.css'

function App() {
  return (
    <div className="app-container">
      <div className="main-card">
        <Header />
        <SectionOne />
        <SectionTwo />
      </div>
      <Footer />
    </div>
  )
}

export default App
