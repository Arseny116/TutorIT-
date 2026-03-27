import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import './CourseLearning.css';

const API_BASE_URL = 'http://94.103.85.168:8080';

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
  const [error, setError] = useState('');

  const [modalImage, setModalImage] = useState(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    return `${API_BASE_URL}/${imagePath}`;
  };

  const openImageModal = (imageUrl) => {
    setModalImage(imageUrl);
    setIsImageModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setModalImage(null);
    document.body.style.overflow = 'unset';
  };

  useEffect(() => {
    if (courseId) {
      const cleanId = courseId.replace(/^["']+|["']+$/g, '').trim();
      setCleanedCourseId(cleanId);
    }
  }, [courseId]);

  useEffect(() => {
    if (cleanedCourseId) {
      loadCourseData();
      loadProgress();
    }
  }, [cleanedCourseId]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        closeImageModal();
      }
    };
    if (isImageModalOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isImageModalOpen]);

  const loadProgress = () => {
    try {
      const savedProgress = localStorage.getItem(`course-progress-${cleanedCourseId}`);
      if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        setCompletedSections(progress.completedSections || []);
        setTotalScore(progress.totalScore || 0);
      }
    } catch (error) {
      console.error('Ошибка загрузки прогресса:', error);
    }
  };

  const saveProgress = () => {
    try {
      const progressData = {
        courseId: cleanedCourseId,
        completedSections: completedSections,
        totalScore: totalScore,
        lastAccessed: new Date().toISOString()
      };
      localStorage.setItem(`course-progress-${cleanedCourseId}`, JSON.stringify(progressData));
    } catch (error) {
      console.error('Ошибка сохранения прогресса:', error);
    }
  };

  const loadCourseData = async () => {
    setIsLoading(true);
    setError('');

    try {
      const token = authService.getToken();
      const headers = { 'accept': 'text/plain' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const courseResponse = await fetch(`/api/v1/Courses/${cleanedCourseId}`, {
        method: 'GET',
        headers: headers,
        credentials: 'include'
      });

      if (courseResponse.status === 401) {
        authService.logout();
        alert('Сессия истекла. Пожалуйста, войдите заново.');
        navigate('/');
        return;
      }

      if (!courseResponse.ok) {
        throw new Error('Курс не найден');
      }

      const courseData = await courseResponse.json();
      setCourse({
        id: courseData.id,
        title: courseData.title || 'Курс',
        description: courseData.description || 'Описание курса',
        sections: courseData.chapters || 0,
        difficulty: courseData.complexity || 1,
        language: courseData.pl || 'Не указан',
        titleImage: getImageUrl(courseData.titleImage)
      });

      const chaptersResponse = await fetch(`/api/v1/Chapters/${cleanedCourseId}`, {
        method: 'GET',
        headers: headers,
        credentials: 'include'
      });

      if (!chaptersResponse.ok) {
        throw new Error('Не удалось загрузить разделы');
      }

      let chaptersData = await chaptersResponse.json();
      let chapters = Array.isArray(chaptersData) ? chaptersData : (chaptersData.$values || chaptersData);

      const loadedSections = [];

      for (const chapter of chapters) {
        const chapterId = chapter.id || chapter.$id;

        // Загружаем теории
        let theoriesArray = [];
        try {
          const theoriesResponse = await fetch(`/api/v1/Theories?CharterId=${chapterId}`, {
            method: 'GET',
            headers: headers,
            credentials: 'include'
          });

          if (theoriesResponse.ok) {
            let theoriesData = await theoriesResponse.json();
            let theories = Array.isArray(theoriesData) ? theoriesData : (theoriesData.$values || []);

            theoriesArray = theories.map((theory, index) => {
              let imageUrl = null;
              if (theory.titleImage) {
                if (typeof theory.titleImage === 'string') {
                  imageUrl = getImageUrl(theory.titleImage);
                } else if (theory.titleImage.fileName) {
                  imageUrl = getImageUrl(theory.titleImage.fileName);
                }
              }

              return {
                id: theory.id || theory.$id,
                name: theory.name || `Теория ${index + 1}`,
                article: theory.article || 'Теоретический материал',
                imagePreview: imageUrl,
                index: index
              };
            });
          }
        } catch (err) {
          console.error('Ошибка загрузки теорий:', err);
        }

        // Загружаем задания
        let tasksArray = [];
        try {
          const tasksResponse = await fetch(`/api/v1/TasksCreators/${chapterId}`, {
            method: 'GET',
            headers: headers,
            credentials: 'include'
          });

          if (tasksResponse.ok) {
            let tasksData = await tasksResponse.json();
            let tasks = Array.isArray(tasksData) ? tasksData : (tasksData.$values || []);

            for (const task of tasks) {
              let answers = [];
              let correctAnswerIndex = 0;

              let imageUrl = null;
              if (task.titleImage) {
                if (typeof task.titleImage === 'string') {
                  imageUrl = getImageUrl(task.titleImage);
                } else if (task.titleImage.fileName) {
                  imageUrl = getImageUrl(task.titleImage.fileName);
                }
              }

              if (task.questions && Array.isArray(task.questions) && task.questions.length > 0) {
                answers = task.questions.map(q => q.name);
                const correctIndex = task.questions.findIndex(q => q.answer === true);
                if (correctIndex !== -1) correctAnswerIndex = correctIndex;

                tasksArray.push({
                  id: task.id || task.$id,
                  name: task.name || `Задание ${tasksArray.length + 1}`,
                  description: task.description || 'Описание задания',
                  hint: task.hint || '',
                  imagePreview: imageUrl,
                  answers: answers,
                  correctAnswerIndex: correctAnswerIndex
                });
              } else {
                try {
                  const questionsResponse = await fetch(`/api/v1/Questions?TaskCreater=${task.id}`, {
                    method: 'GET',
                    headers: headers,
                    credentials: 'include'
                  });

                  if (questionsResponse.ok) {
                    let questionsData = await questionsResponse.json();
                    let questions = Array.isArray(questionsData) ? questionsData : (questionsData.$values || []);
                    answers = questions.map(q => q.name);
                    const correctIndex = questions.findIndex(q => q.answer === true);
                    if (correctIndex !== -1) correctAnswerIndex = correctIndex;
                  }
                } catch (err) {
                  console.error('Ошибка загрузки вопросов:', err);
                }

                tasksArray.push({
                  id: task.id || task.$id,
                  name: task.name || `Задание ${tasksArray.length + 1}`,
                  description: task.description || 'Описание задания',
                  hint: task.hint || '',
                  imagePreview: imageUrl,
                  answers: answers.length > 0 ? answers : ['Вариант 1', 'Вариант 2', 'Вариант 3', 'Вариант 4'],
                  correctAnswerIndex: correctAnswerIndex
                });
              }
            }
          }
        } catch (err) {
          console.error('Ошибка загрузки заданий:', err);
        }

        loadedSections.push({
          id: chapterId,
          name: chapter.name || `Раздел ${loadedSections.length + 1}`,
          description: chapter.description || 'Описание раздела',
          sectionNumber: loadedSections.length + 1,
          theoryCount: theoriesArray.length,
          theories: theoriesArray,
          tasks: tasksArray,
          completed: false
        });
      }

      setSections(loadedSections);

    } catch (error) {
      console.error('Ошибка загрузки курса:', error);
      setError(error.message);
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
    if (currentSection && currentTheoryIndex < (currentSection.theories?.length || 0) - 1) {
      setCurrentTheoryIndex(prev => prev + 1);
    } else if (currentSection?.tasks?.length > 0) {
      handleStartTasks();
    } else {
      handleCompleteSection();
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
    if (currentSection && currentSection.tasks.length > 0) {
      setCurrentStep('task');
      setCurrentTaskIndex(0);
      setSelectedAnswer(null);
      setShowAnswerResult(false);
      setShowHint(false);
    } else {
      handleCompleteSection();
    }
  };

  const handleCompleteSection = () => {
    if (!completedSections.includes(currentSection.id)) {
      const newCompleted = [...completedSections, currentSection.id];
      setCompletedSections(newCompleted);
      saveProgress();
    }

    const currentIndex = sections.findIndex(s => s.id === currentSection.id);
    if (currentIndex < sections.length - 1) {
      handleSelectSection(sections[currentIndex + 1]);
    } else {
      setCurrentStep('courseComplete');
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
        const newTotalScore = totalScore + score + (isCorrect ? 1 : 0);
        setTotalScore(newTotalScore);

        if (!completedSections.includes(currentSection.id)) {
          const newCompleted = [...completedSections, currentSection.id];
          setCompletedSections(newCompleted);
          saveProgress();
        }

        setCurrentStep('sectionComplete');
      }
    }, 1500);
  };

  const handleNextTask = () => {
    if (currentTaskIndex < currentSection.tasks.length - 1) {
      setCurrentTaskIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowAnswerResult(false);
      setShowHint(false);
    } else {
      handleCompleteSection();
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

  if (error || !course) {
    return (
        <div className="course-learning">
          <div className="learning-container">
            <div className="learning-content">
              <h2>Курс не найден</h2>
              <p>{error || `Курс с ID ${cleanedCourseId} не существует.`}</p>
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
  const currentTask = currentSection?.tasks?.[currentTaskIndex];

  return (
      <div className="course-learning">
        <div className="learning-container">
          <header className="learning-header">
            <div>
              <h1>{course.title}</h1>
              <div className="course-badge">
                <span className="badge language">{course.language}</span>
                <span className="badge difficulty">Сложность: {course.difficulty}</span>
              </div>
            </div>
            <div className="learning-progress">
              {currentStep === 'sections' && `${sections.length} разделов`}
              {currentStep === 'theory' && `Теория ${currentTheoryIndex + 1} из ${currentSection?.theories?.length || 0}`}
              {currentStep === 'task' && `Задание ${currentTaskIndex + 1} из ${currentSection?.tasks?.length || 0}`}
              {currentStep === 'sectionComplete' && 'Раздел завершен'}
              {currentStep === 'courseComplete' && 'Курс завершен'}
            </div>
          </header>

          <div className="learning-content">
            {currentStep === 'sections' && (
                <div className="sections-screen">
                  <div className="sections-header">
                    {course.titleImage && (
                        <div className="course-title-image">
                          <img
                              src={course.titleImage}
                              alt={course.title}
                              onClick={() => openImageModal(course.titleImage)}
                          />
                        </div>
                    )}
                    <h2>Выберите раздел для изучения</h2>
                    <p className="sections-count">{sections.length} {getWordEnding(sections.length, 'раздел', 'раздела', 'разделов')}</p>
                  </div>

                  <div className="sections-grid">
                    {sections.map((section) => (
                        <div
                            key={section.id}
                            className="section-card"
                            onClick={() => handleSelectSection(section)}
                        >
                          <div className="section-icon">
                            <span>📚</span>
                          </div>
                          <h3>{section.name}</h3>
                          <p className="section-description">{section.description}</p>
                          <div className="section-meta">
                      <span className="meta-item theory-count">
                        📖 {section.theories?.length || 0} теорий
                      </span>
                            <span className="meta-item task-count">
                        ✍️ {section.tasks?.length || 0} заданий
                      </span>
                          </div>
                        </div>
                    ))}
                  </div>

                  <button
                      className="exit-course-btn"
                      onClick={handleExitCourse}
                  >
                    ← Вернуться к курсам
                  </button>
                </div>
            )}

            {currentStep === 'theory' && currentSection && (
                <div className="theory-screen">
                  <div className="theory-header">
                    <div className="theory-nav">
                      <button className="back-to-sections" onClick={handleBackToSections}>
                        ← Все разделы
                      </button>
                      <div className="theory-counter">
                        {currentTheoryIndex + 1} / {currentSection.theories?.length || 0}
                      </div>
                    </div>
                    <h2>{currentSection.name}</h2>
                    <p className="theory-description">{currentSection.description}</p>
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
                                    onClick={() => openImageModal(currentTheory.imagePreview)}
                                />
                              </div>
                          )}
                          <div className="theory-article">
                            {currentTheory.article || 'Теоретический материал отсутствует'}
                          </div>
                        </>
                    ) : (
                        <div className="empty-theory">
                          <p>Теоретический материал для этого раздела еще не добавлен.</p>
                        </div>
                    )}
                  </div>

                  <div className="navigation-buttons">
                    <button className="nav-btn back" onClick={handlePrevTheory}>
                      {currentTheoryIndex === 0 ? '← Назад к разделам' : '← Предыдущая теория'}
                    </button>
                    <button className="nav-btn next" onClick={handleNextTheory}>
                      {currentTheoryIndex < (currentSection.theories?.length || 0) - 1 ? 'Следующая теория →' : 'К заданиям →'}
                    </button>
                  </div>
                </div>
            )}

            {currentStep === 'task' && currentTask && (
                <div className="tasks-screen">
                  <div className="task-header">
                    <div className="task-nav">
                      <button className="back-to-theory" onClick={handleBackToTheory}>
                        ← К теории
                      </button>
                      <div className="task-counter">
                        Задание {currentTaskIndex + 1} из {currentSection.tasks.length}
                      </div>
                    </div>
                    <h2>{currentSection.name}</h2>
                  </div>

                  <div className="task-content">
                    <div className="task-question-block">
                      <h3>{currentTask.name}</h3>
                      <p>{currentTask.description}</p>
                    </div>

                    {currentTask.imagePreview && (
                        <div className="task-image">
                          <img
                              src={currentTask.imagePreview}
                              alt="Изображение задания"
                              onClick={() => openImageModal(currentTask.imagePreview)}
                          />
                        </div>
                    )}

                    {currentTask.hint && (
                        <div className="task-hint">
                          <button
                              onClick={toggleHint}
                              className="hint-toggle"
                          >
                            {showHint ? 'Скрыть подсказку' : 'Показать подсказку'} 💡
                          </button>
                          {showHint && (
                              <div className="hint-content">
                                {currentTask.hint}
                              </div>
                          )}
                        </div>
                    )}

                    <div className="answers-list">
                      {currentTask.answers?.map((answer, index) => {
                        let answerClass = 'answer-item';
                        if (selectedAnswer === index) answerClass += ' selected';
                        if (showAnswerResult) {
                          if (index === currentTask.correctAnswerIndex) {
                            answerClass += ' correct';
                          } else if (selectedAnswer === index) {
                            answerClass += ' incorrect';
                          }
                        }

                        return (
                            <div
                                key={`answer-${currentTask.id}-${index}`}
                                className={answerClass}
                                onClick={() => handleSelectAnswer(index)}
                            >
                              <div className="answer-marker">{String.fromCharCode(65 + index)}</div>
                              <div className="answer-text">{answer}</div>
                            </div>
                        );
                      })}
                    </div>

                    <div className="answer-actions">
                      {!showAnswerResult ? (
                          <button
                              className="check-answer-btn"
                              onClick={handleCheckAnswer}
                              disabled={selectedAnswer === null}
                          >
                            Проверить ответ
                          </button>
                      ) : (
                          <button
                              className="next-task-btn"
                              onClick={handleNextTask}
                          >
                            {currentTaskIndex < currentSection.tasks.length - 1 ? 'Следующее задание →' : 'Завершить раздел →'}
                          </button>
                      )}
                    </div>

                    {showAnswerResult && (
                        <div className="answer-feedback">
                          {selectedAnswer === currentTask.correctAnswerIndex
                              ? <span className="correct-feedback">✅ Правильно! Отличная работа!</span>
                              : <span className="incorrect-feedback">❌ Неправильно. Попробуй еще раз!</span>}
                        </div>
                    )}
                  </div>
                </div>
            )}

            {currentStep === 'sectionComplete' && currentSection && (
                <div className="results-screen">
                  <div className="results-card">
                    <div className="results-icon">🎉</div>
                    <h2>Раздел завершен!</h2>
                    <div className="results-score">
                      <span className="score-value">{Math.round((score / currentSection.tasks.length) * 100)}%</span>
                    </div>
                    <p className="results-message">
                      Вы ответили правильно на <strong>{score}</strong> из <strong>{currentSection.tasks.length}</strong> вопросов
                    </p>
                    <div className="results-stats">
                      <div className="stat">
                        <span className="stat-label">Пройдено теорий</span>
                        <span className="stat-value">{currentSection.theories?.length || 0}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Правильных ответов</span>
                        <span className="stat-value">{score}</span>
                      </div>
                    </div>
                    <div className="results-actions">
                      <button className="retry-btn" onClick={handleRetrySection}>
                        🔄 Повторить
                      </button>
                      <button className="next-section-btn" onClick={handleNextSection}>
                        {sections.findIndex(s => s.id === currentSection.id) < sections.length - 1
                            ? 'Следующий раздел →'
                            : 'Завершить курс →'}
                      </button>
                    </div>
                  </div>
                </div>
            )}

            {currentStep === 'courseComplete' && (
                <div className="results-screen">
                  <div className="results-card complete">
                    <div className="results-icon">🏆</div>
                    <h2>Поздравляем!</h2>
                    <p>Вы успешно завершили курс</p>
                    <div className="results-score">
                      <span className="score-value">{Math.round((totalScore / sections.reduce((sum, s) => sum + s.tasks.length, 0)) * 100)}%</span>
                    </div>
                    <button
                        className="finish-course-btn"
                        onClick={handleExitCourse}
                    >
                      ← Вернуться к курсам
                    </button>
                  </div>
                </div>
            )}
          </div>
        </div>

        {isImageModalOpen && modalImage && (
            <div className="image-modal" onClick={closeImageModal}>
              <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="image-modal-close" onClick={closeImageModal}>×</button>
                <img src={modalImage} alt="Увеличенное изображение" className="image-modal-img" />
              </div>
            </div>
        )}
      </div>
  );
}

function getWordEnding(number, one, two, five) {
  const n = Math.abs(number) % 100;
  const n1 = n % 10;
  if (n > 10 && n < 20) return five;
  if (n1 > 1 && n1 < 5) return two;
  if (n1 === 1) return one;
  return five;
}

export default CourseLearning;