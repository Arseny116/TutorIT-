import './MainContent.css';
import { useState } from 'react';
import CourseModal from '../CourseModal/CourseModal';

function MainContent() {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
            onClick={() => setIsModalOpen(true)}
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

      <CourseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}

export default MainContent;