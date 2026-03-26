import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import './CourseLearning.css';

function CourseLearning() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [currentSection, setCurrentSection] = useState(null);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState('sections');
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showAnswerResult, setShowAnswerResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [totalScore, setTotalScore] = useState(0);
  const [completedSections, setCompletedSections] = useState([]);
  const [currentTheoryIndex, setCurrentTheoryIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [cleanedCourseId, setCleanedCourseId] = useState('');

  useEffect(() => {
    if (courseId) {
      const cleanId = courseId.replace(/^["']+|["']+$/g, '').trim();
      setCleanedCourseId(cleanId);
    }
  }, [courseId]);

  useEffect(() => {
    if (cleanedCourseId) {
      loadCourseData();
    }
  }, [cleanedCourseId]);

  const loadCourseData = async () => {
    setIsLoading(true);

    try {
      const token = authService.getToken();
      const headers = { 'accept': 'text/plain' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/v1/Courses/${cleanedCourseId}`, {
        method: 'GET',
        headers: headers,
        credentials: 'include'
      });

      if (response.status === 401) {
        authService.logout();
        alert('Сессия истекла. Пожалуйста, войдите заново.');
        navigate('/');
        return;
      }

      if (!response.ok) {
        throw new Error('Курс не найден');
      }

      const courseData = await response.json();
      console.log('Загружен курс:', courseData);

      setCourse({
        id: courseData.id,
        title: courseData.title || 'Курс',
        description: courseData.description || 'Описание курса',
        sections: courseData.chapters || 0,
        difficulty: courseData.complexity || 1,
        language: courseData.pl || 'Не указан',
        titleImage: courseData.titleImage || null
      });

      // Загружаем разделы
      const chaptersResponse = await fetch(`/api/v1/Chapters/${cleanedCourseId}`, {
        method: 'GET',
        headers: headers,
        credentials: 'include'
      });

      if (chaptersResponse.ok) {
        const chaptersData = await chaptersResponse.json();
        console.log('Загружены разделы:', chaptersData);

        const loadedSections = chaptersData.map((chapter, index) => {
          // Обрабатываем теории
          let theoriesArray = [];
          if (chapter.theories && Array.isArray(chapter.theories)) {
            theoriesArray = chapter.theories.map((theory, theoryIndex) => ({
              id: theory.id,
              name: theory.name || `Теория ${theoryIndex + 1}`,
              article: theory.article || 'Теоретический материал',
              imagePreview: theory.titleImage?.fileName ? `/images/${theory.titleImage.fileName}` : null,
              index: theoryIndex
            }));
          }

          // Обрабатываем задания
          let tasksArray = [];
          if (chapter.tasks && Array.isArray(chapter.tasks)) {
            tasksArray = chapter.tasks.map((task, taskIndex) => {
              let correctAnswerIndex = 0;
              let answers = [];

              if (task.questions && Array.isArray(task.questions)) {
                answers = task.questions.map(q => q.name);
                const correctIndex = task.questions.findIndex(q => q.answer === true);
                if (correctIndex !== -1) correctAnswerIndex = correctIndex;
              }

              return {
                id: task.id,
                name: task.name || `Задание ${taskIndex + 1}`,
                description: task.description || 'Описание задания',
                hint: task.hint || '',
                imagePreview: task.titleImage?.fileName ? `/images/${task.titleImage.fileName}` : null,
                answers: answers.length > 0 ? answers : ['Вариант 1', 'Вариант 2', 'Вариант 3', 'Вариант 4'],
                correctAnswerIndex: correctAnswerIndex
              };
            });
          }

          return {
            id: chapter.id,
            name: chapter.name || `Раздел ${index + 1}`,
            description: chapter.description || 'Описание раздела',
            sectionNumber: index + 1,
            theoryCount: chapter.numberTheoryBloks || 0,
            theories: theoriesArray,
            tasks: tasksArray,
            completed: false,
            progress: 0
          };
        });

        setSections(loadedSections);

        // Загружаем сохраненный прогресс
        const savedProgress = localStorage.getItem(`course-progress-${cleanedCourseId}`);
        if (savedProgress) {
          const progress = JSON.parse(savedProgress);
          setCompletedSections(progress.completedSections || []);
          setTotalScore(progress.totalScore || 0);
        }
      }

    } catch (error) {
      console.error('Ошибка загрузки курса:', error);
      setCourse(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSection = (section) => {
    setCurrentSection(section);
    setCurrentTheoryIndex(0);
    setCurrentStep('theory');
    setCurrentTaskIndex(0);
    setSelectedAnswer(null);
    setShowAnswerResult(false);
    setScore(0);
    setShowHint(false);
  };

  const handleNextTheory = () => {
    if (currentSection && currentTheoryIndex < currentSection.theoryCount - 1) {
      setCurrentTheoryIndex(prev => prev + 1);
    } else {
      handleStartTasks();
    }
  };

  const handlePrevTheory = () => {
    if (currentTheoryIndex > 0) {
      setCurrentTheoryIndex(prev => prev - 1);
    } else {
      setCurrentStep('sections');
    }
  };

  const handleStartTasks = () => {
    if (currentSection) {
      setCurrentStep('task');
      setCurrentTaskIndex(0);
      setSelectedAnswer(null);
      setShowAnswerResult(false);
      setShowHint(false);
    }
  };

  const handleSelectAnswer = (answerIndex) => {
    if (!showAnswerResult) {
      setSelectedAnswer(answerIndex);
    }
  };

  const handleCheckAnswer = () => {
    if (selectedAnswer === null || !currentSection) return;

    setShowAnswerResult(true);

    const currentTask = currentSection.tasks[currentTaskIndex];
    const isCorrect = selectedAnswer === currentTask.correctAnswerIndex;

    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setTimeout(() => {
      if (currentTaskIndex < currentSection.tasks.length - 1) {
        setCurrentTaskIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setShowAnswerResult(false);
        setShowHint(false);
      } else {
        setCurrentStep('results');

        if (!completedSections.includes(currentSection.id)) {
          setCompletedSections(prev => [...prev, currentSection.id]);
          setTotalScore(prev => prev + score);

          // Сохраняем прогресс локально (только для удобства, можно и без этого)
          saveProgress();
        }
      }
    }, 1500);
  };

  const saveProgress = () => {
    try {
      const progressData = {
        courseId: cleanedCourseId,
        completedSections: [...completedSections, currentSection.id],
        totalScore: totalScore + score,
        lastAccessed: new Date().toISOString()
      };
      localStorage.setItem(`course-progress-${cleanedCourseId}`, JSON.stringify(progressData));
    } catch (error) {
      console.error('Ошибка сохранения прогресса:', error);
    }
  };

  const handleNextTask = () => {
    if (currentTaskIndex < currentSection.tasks.length - 1) {
      setCurrentTaskIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowAnswerResult(false);
      setShowHint(false);
    } else {
      setCurrentStep('results');
    }
  };

  const handlePrevTask = () => {
    if (currentTaskIndex > 0) {
      setCurrentTaskIndex(prev => prev - 1);
      setSelectedAnswer(null);
      setShowAnswerResult(false);
      setShowHint(false);
    }
  };

  const handleBackToSections = () => {
    setCurrentStep('sections');
    setCurrentSection(null);
    setCurrentTheoryIndex(0);
  };

  const handleBackToTheory = () => {
    setCurrentStep('theory');
  };

  const handleRetrySection = () => {
    setCurrentTaskIndex(0);
    setSelectedAnswer(null);
    setShowAnswerResult(false);
    setScore(0);
    setCurrentStep('task');
    setShowHint(false);
  };

  const handleNextSection = () => {
    const currentIndex = sections.findIndex(s => s.id === currentSection.id);
    if (currentIndex < sections.length - 1) {
      handleSelectSection(sections[currentIndex + 1]);
    } else {
      navigate('/courses');
    }
  };

  const handleExitCourse = () => {
    navigate('/courses');
  };

  const toggleHint = () => {
    setShowHint(!showHint);
  };

  if (isLoading) {
    return (
        <div className="course-learning">
          <div className="learning-container">
            <div className="loading-screen">
              <div className="loading-spinner"></div>
              <p>Загрузка курса...</p>
            </div>
          </div>
        </div>
    );
  }

  if (!course) {
    return (
        <div className="course-learning">
          <div className="learning-container">
            <div className="learning-content">
              <h2>Курс не найден</h2>
              <p>Курс с ID {cleanedCourseId} не существует.</p>
              <button
                  className="nav-btn back"
                  onClick={() => navigate('/courses')}
                  style={{ marginTop: '20px' }}
              >
                ← Вернуться к курсам
              </button>
            </div>
          </div>
        </div>
    );
  }

  const currentTheory = currentSection?.theories?.[currentTheoryIndex];

  return (
      <div className="course-learning">
        <div className="learning-container">
          <header className="learning-header">
            <div>
              <h1>{course.title}</h1>
              <p style={{ opacity: 0.9, fontSize: '14px' }}>
                {course.language} • Сложность: {course.difficulty}
              </p>
            </div>
            <div className="learning-progress">
              {currentStep === 'sections' && 'Выбор раздела'}
              {currentStep === 'theory' && `Теория ${currentTheoryIndex + 1} из ${currentSection?.theoryCount || 1}`}
              {currentStep === 'task' && `Задание ${currentTaskIndex + 1} из ${currentSection?.tasks?.length || 0}`}
              {currentStep === 'results' && 'Результаты'}
            </div>
          </header>

          <div className="learning-content">
            {currentStep === 'sections' && (
                <div className="sections-screen">
                  <div className="sections-header">
                    {course.titleImage && (
                        <div className="course-title-image" style={{ textAlign: 'center', marginBottom: '20px' }}>
                          <img
                              src={course.titleImage}
                              alt={course.title}
                              style={{
                                maxWidth: '100%',
                                maxHeight: '200px',
                                borderRadius: '12px',
                                objectFit: 'cover',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                              }}
                          />
                        </div>
                    )}
                    <h2>Выберите раздел для изучения</h2>
                    <p>{sections.length} разделов доступно</p>
                    {completedSections.length > 0 && (
                        <p className="progress-info">
                          Завершено: {completedSections.length}/{sections.length} разделов
                        </p>
                    )}
                  </div>

                  <div className="sections-grid">
                    {sections.map((section, index) => (
                        <div
                            key={section.id}
                            className={`section-card ${completedSections.includes(section.id) ? 'completed' : ''}`}
                            onClick={() => handleSelectSection(section)}
                        >
                          <h3>
                            {section.name}
                            {completedSections.includes(section.id) && (
                                <span className="completed-badge">✓</span>
                            )}
                          </h3>
                          <p className="section-description">{section.description}</p>
                          <div className="section-meta">
                      <span className="meta-item">
                        {section.theoryCount} теорий
                      </span>
                            <span className="meta-item">
                        {section.tasks?.length || 0} заданий
                      </span>
                            <span className="meta-item">
                        Раздел {index + 1}
                      </span>
                          </div>
                        </div>
                    ))}
                  </div>

                  <button
                      className="nav-btn back"
                      onClick={handleExitCourse}
                      style={{ marginTop: '40px' }}
                  >
                    ← Назад к курсам
                  </button>
                </div>
            )}

            {currentStep === 'theory' && currentSection && (
                <div className="theory-screen">
                  <div className="theory-header">
                    <h2>{currentSection.name}</h2>
                    <p className="theory-description">{currentSection.description}</p>
                    <div className="theory-progress">
                      Теория {currentTheoryIndex + 1} из {currentSection.theoryCount}
                    </div>
                  </div>

                  <div className="theory-content">
                    {currentTheory ? (
                        <>
                          <h3>{currentTheory.name}</h3>
                          {currentTheory.imagePreview && (
                              <div className="theory-image">
                                <img
                                    src={currentTheory.imagePreview}
                                    alt={currentTheory.name}
                                    style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', margin: '15px 0' }}
                                />
                              </div>
                          )}
                          <div style={{ whiteSpace: 'pre-line' }}>
                            {currentTheory.article || 'Теоретический материал отсутствует'}
                          </div>
                        </>
                    ) : (
                        <p>Теоретический материал для этого раздела еще не добавлен.</p>
                    )}
                  </div>

                  <div className="navigation-buttons">
                    <button className="nav-btn back" onClick={currentTheoryIndex === 0 ? handleBackToSections : handlePrevTheory}>
                      {currentTheoryIndex === 0 ? '← Назад к разделам' : '← Предыдущая теория'}
                    </button>
                    <button className="nav-btn next" onClick={handleNextTheory}>
                      {currentTheoryIndex < currentSection.theoryCount - 1 ? 'Следующая теория →' : 'К заданиям →'}
                    </button>
                  </div>
                </div>
            )}

            {currentStep === 'task' && currentSection && currentSection.tasks && currentSection.tasks[currentTaskIndex] && (
                <div className="tasks-screen">
                  <div className="task-navigation">
                    <button className="nav-btn back" onClick={handleBackToTheory}>
                      ← К теории
                    </button>
                    <div className="task-counter">
                      Задание {currentTaskIndex + 1} из {currentSection.tasks.length}
                    </div>
                  </div>

                  <div className="task-content">
                    <h3>{currentSection.tasks[currentTaskIndex].name}</h3>
                    <p className="task-question">{currentSection.tasks[currentTaskIndex].description}</p>

                    {currentSection.tasks[currentTaskIndex].imagePreview && (
                        <div className="task-image" style={{ textAlign: 'center', margin: '15px 0' }}>
                          <img
                              src={currentSection.tasks[currentTaskIndex].imagePreview}
                              alt="Изображение задания"
                              style={{ maxWidth: '100%', maxHeight: '250px', borderRadius: '8px', border: '1px solid #ddd' }}
                          />
                        </div>
                    )}

                    {currentSection.tasks[currentTaskIndex].hint && (
                        <div className="task-hint">
                          <button
                              onClick={toggleHint}
                              className="hint-toggle-btn"
                              style={{
                                background: '#f0f0f0',
                                border: 'none',
                                padding: '5px 12px',
                                borderRadius: '20px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                marginBottom: '10px'
                              }}
                          >
                            {showHint ? 'Скрыть подсказку' : 'Показать подсказку'} 💡
                          </button>
                          {showHint && (
                              <div className="hint-content" style={{
                                background: '#fff3cd',
                                padding: '10px 15px',
                                borderRadius: '8px',
                                marginBottom: '15px',
                                borderLeft: '4px solid #ffc107',
                                fontSize: '14px'
                              }}>
                                {currentSection.tasks[currentTaskIndex].hint}
                              </div>
                          )}
                        </div>
                    )}

                    <div className="answers-list">
                      {currentSection.tasks[currentTaskIndex].answers?.map((answer, index) => {
                        let answerClass = 'answer-item';
                        if (selectedAnswer === index) answerClass += ' selected';
                        if (showAnswerResult) {
                          if (index === currentSection.tasks[currentTaskIndex].correctAnswerIndex) {
                            answerClass += ' correct';
                          } else if (selectedAnswer === index) {
                            answerClass += ' incorrect';
                          }
                        }

                        return (
                            <div
                                key={`answer-${currentSection.tasks[currentTaskIndex].id}-${index}`}
                                className={answerClass}
                                onClick={() => handleSelectAnswer(index)}
                            >
                              <div className="answer-text">{answer}</div>
                            </div>
                        );
                      })}
                    </div>

                    <div className="navigation-buttons" style={{ marginTop: '30px' }}>
                      <button
                          className="nav-btn back"
                          onClick={handlePrevTask}
                          disabled={currentTaskIndex === 0}
                      >
                        ← Назад
                      </button>

                      {!showAnswerResult ? (
                          <button
                              className="nav-btn next"
                              onClick={handleCheckAnswer}
                              disabled={selectedAnswer === null}
                          >
                            Проверить →
                          </button>
                      ) : (
                          <button
                              className="nav-btn next"
                              onClick={handleNextTask}
                          >
                            {currentTaskIndex < currentSection.tasks.length - 1 ? 'Далее →' : 'Результаты →'}
                          </button>
                      )}
                    </div>

                    {showAnswerResult && (
                        <div className="answer-feedback">
                          {selectedAnswer === currentSection.tasks[currentTaskIndex].correctAnswerIndex
                              ? '✅ Правильно!'
                              : '❌ Неправильно!'}
                        </div>
                    )}
                  </div>
                </div>
            )}

            {currentStep === 'results' && currentSection && (
                <div className="results-screen">
                  <div className="results-content">
                    <h2>Раздел завершен!</h2>
                    <div className="results-score">
                      {Math.round((score / currentSection.tasks.length) * 100)}%
                    </div>
                    <p className="results-message">
                      Вы ответили правильно на {score} из {currentSection.tasks.length} вопросов
                    </p>

                    <div className="section-stats">
                      <p>Пройдено: {currentSection.theoryCount} теорий</p>
                    </div>

                    <div className="navigation-buttons">
                      <button className="nav-btn back" onClick={handleRetrySection}>
                        🔄 Повторить
                      </button>
                      <button className="nav-btn next" onClick={handleNextSection}>
                        Следующий раздел →
                      </button>
                    </div>

                    <button
                        className="nav-btn back"
                        onClick={handleExitCourse}
                        style={{ marginTop: '20px', width: '100%' }}
                    >
                      ← Завершить курс
                    </button>
                  </div>
                </div>
            )}
          </div>
        </div>
      </div>
  );
}

export default CourseLearning;