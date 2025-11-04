import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import HomePage from './pages/HomePage';
import CreateCoursePage from './pages/CreateCoursePage';
import CoursePage from './pages/CoursePage';
import CoursesPage from './pages/CoursesPage';  

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create-course" element={<CreateCoursePage />} />
          <Route path="/course/:courseId" element={<CoursePage />} />
          <Route path="/courses" element={<CoursesPage />} />  
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;