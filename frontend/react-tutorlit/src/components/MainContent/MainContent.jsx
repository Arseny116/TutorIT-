import './MainContent.css';

function MainContent() {
  return (
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
    </main>
  );
}

export default MainContent;