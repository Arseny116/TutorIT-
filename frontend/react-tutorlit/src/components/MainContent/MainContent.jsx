import './MainContent.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CourseModal from '../CourseModal/CourseModal';
import AuthModal from '../AuthModal/AuthModal';
import authService from '../../services/authService';

function MainContent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const navigate = useNavigate();

  const handleCoursesClick = () => {
    if (authService.isAuthenticated()) {
      setIsModalOpen(true);
    } else {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 3000);
    }
  };

  const handleCreateCourse = () => {
    if (authService.isAuthenticated()) {
      navigate('/create-course');
    } else {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 3000);
    }
  };

  return (
      <>
        <main className="main-content">
          <h1>Добро пожаловать в TutorIT</h1>
          <p className="main-description">
            Образовательная платформа с адаптивным обучением
          </p>

          <div className="about-section">
            <h2>О нас</h2>
            <p className="about-text">
              Мы создаем персонализированные образовательные траектории для каждого студента.
              Наша платформа использует адаптивные алгоритмы для эффективного обучения.
            </p>
          </div>

          <div className="main-actions">
            <button
                className="main-courses-btn"
                onClick={handleCoursesClick}
            >
              🚀 Курсы
            </button>

            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🎯</div>
                <h3>Адаптивное обучение</h3>
                <p>Персонализированная программа под ваш уровень знаний и темп обучения</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">📚</div>
                <h3>Разнообразные курсы</h3>
                <p>От основ программирования до продвинутых тем и фреймворков</p>
              </div>
            </div>
          </div>
        </main>

        {showWarning && (
            <div className="warning-toast">
              <div className="warning-content">
                <span className="warning-icon">⚠️</span>
                <span className="warning-text">Сначала нужно зарегистрироваться или войти в аккаунт</span>
              </div>
            </div>
        )}

        <CourseModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
        />

        <AuthModal
            isOpen={isAuthOpen}
            onClose={() => setIsAuthOpen(false)}
            onSuccess={() => {}}
        />
      </>
  );
}

export default MainContent;