import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import HomePage from './pages/HomePage';
import CreateCoursePage from './pages/CreateCoursePage';
import CoursePage from './pages/CoursePage';
import CoursesPage from './pages/CoursesPage';
import CourseBuilder from './pages/CourseBuilder';
import CourseLearning from './pages/CourseLearning'; // Добавить

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create-course" element={<CreateCoursePage />} />
          <Route path="/course/:courseId" element={<CoursePage />} />
          <Route path="/course/:courseId/builder" element={<CourseBuilder />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/learn/:courseId" element={<CourseLearning />} /> {/* Добавить */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;