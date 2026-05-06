import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import HomePage from './pages/HomePage';
import CreateCoursePage from './pages/CreateCoursePage';
import CoursesPage from './pages/CoursesPage';
import CourseBuilder from './pages/CourseBuilder';
import CourseLearning from './pages/CourseLearning';
import UserProfilePage from './pages/UserProfilePage';
import EditCoursePage from './pages/EditCoursePage'; // Добавь импорт

function App() {
  return (
      <BrowserRouter>
        <div className="App">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/create-course" element={<CreateCoursePage />} />
              <Route path="/course/:courseId/builder" element={<CourseBuilder />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/learn/:courseId" element={<CourseLearning />} />
              <Route path="/profile" element={<UserProfilePage />} />
              <Route path="/edit-course/:courseId" element={<EditCoursePage />} /> {/* Добавь маршрут */}
            </Routes>
          </main>
        </div>
      </BrowserRouter>
  );
}

export default App;