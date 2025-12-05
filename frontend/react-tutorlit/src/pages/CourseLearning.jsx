import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  const [userAnswers, setUserAnswers] = useState({});
  const [totalScore, setTotalScore] = useState(0);
  const [completedSections, setCompletedSections] = useState([]);
  const [currentTheoryIndex, setCurrentTheoryIndex] = useState(0); // Добавил для отслеживания текущей теории

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  const loadCourseData = () => {
    setIsLoading(true);
    
    try {
      const localCourses = JSON.parse(localStorage.getItem('tutorit-courses') || '[]');
      console.log('Загружаю курс с ID:', courseId);
      
      const foundCourse = localCourses.find(course => {
        const storedId = String(course.id).replace(/^["']+|["']+$/g, '').trim();
        const searchId = String(courseId).replace(/^["']+|["']+$/g, '').trim();
        return storedId === searchId;
      });
      
      console.log('Найденный курс:', foundCourse);
      
      if (!foundCourse) {
        console.log('Курс не найден');
  
      } else {
        setCourse({
          id: foundCourse.id,
          title: foundCourse.title || 'Курс',
          description: foundCourse.description || 'Описание курса',
          sections: foundCourse.sections || 0,
          difficulty: foundCourse.difficulty || 1,
          language: foundCourse.language || foundCourse.pl || 'Не указан',
          isFromAPI: foundCourse.isFromAPI
        });
        
        
        if (foundCourse.sectionsData && foundCourse.sectionsData.length > 0) {
          console.log('Загружаю разделы из sectionsData:', foundCourse.sectionsData.length);
          
          const loadedSections = foundCourse.sectionsData.map((section, index) => {
            
            const sectionId = section.id || `section-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`;
            
            // Обрабатываем multiple теории
            let theoriesArray = [];
            if (section.theory) {
              if (Array.isArray(section.theory)) {
                // Преобразуем массив теорий
                theoriesArray = section.theory.map((theoryItem, theoryIndex) => ({
                  id: theoryItem.id || `theory-${sectionId}-${theoryIndex}`,
                  name: theoryItem.name || `Теория ${theoryIndex + 1}`,
                  article: theoryItem.article || 'Теоретический материал',
                  index: theoryIndex,
                  isFromAPI: theoryItem.isFromAPI || false
                }));
              } else {
                // Если теория в виде объекта, делаем из нее массив с одним элементом
                theoriesArray = [{
                  id: section.theory.id || `theory-${sectionId}-0`,
                  name: section.theory.name || `Теория 1`,
                  article: section.theory.article || 'Теоретический материал',
                  index: 0,
                  isFromAPI: section.theory.isFromAPI || false
                }];
              }
            }
            
            // Подсчитываем количество теорий
            const theoryCount = theoriesArray.length > 0 ? theoriesArray.length : 
                                (section.numberTheoryBloks || 0);
            
            const sectionForLearning = {
              id: sectionId,
              name: section.name || `Раздел ${index + 1}`,
              description: section.description || 'Описание раздела',
              sectionNumber: index + 1,
              theoryCount: theoryCount,
              theories: theoriesArray, // Массив теорий
              completed: false,
              progress: 0
            };
            
            // Обрабатываем задания
            if (section.tasks && Array.isArray(section.tasks)) {
              sectionForLearning.tasks = section.tasks.map((task, taskIndex) => {
                
                const taskId = task.id || `task-${sectionId}-${taskIndex}-${Math.random().toString(36).substr(2, 9)}`;
                
                let correctAnswerIndex = 0;
                if (task.questions && Array.isArray(task.questions)) {
                  const correctQuestion = task.questions.find(q => q.answer === true);
                  if (correctQuestion && task.questions.indexOf(correctQuestion) !== -1) {
                    correctAnswerIndex = task.questions.indexOf(correctQuestion);
                  }
                } else if (task.correctAnswerIndex !== undefined) {
                  correctAnswerIndex = task.correctAnswerIndex;
                }
                
                return {
                  id: taskId,
                  name: task.name || `Задание ${taskIndex + 1}`,
                  description: task.description || 'Описание задания',
                  answers: task.answers || task.questions?.map(q => q.name) || 
                           ['Вариант 1', 'Вариант 2', 'Вариант 3', 'Вариант 4'],
                  correctAnswerIndex: correctAnswerIndex,
                  isFromAPI: task.isFromAPI
                };
              });
            } else if (section.numberTasks > 0) {
              
              sectionForLearning.tasks = Array.from({ length: section.numberTasks }, (_, taskIndex) => ({
                id: `task-${sectionId}-${taskIndex}-${Math.random().toString(36).substr(2, 9)}`,
                name: `Задание ${taskIndex + 1}`,
                description: 'Пример задания',
                answers: ['Правильный ответ', 'Неправильный вариант 1', 'Неправильный вариант 2', 'Неправильный вариант 3'],
                correctAnswerIndex: 0
              }));
            } else {
              sectionForLearning.tasks = [];
            }
            
            return sectionForLearning;
          });
          
          console.log('Преобразованные разделы:', loadedSections);
          setSections(loadedSections);
          
        } else if (foundCourse.sections > 0) {
  
          console.log('Создаю тестовые разделы для курса');
          const testSections = Array.from({ length: foundCourse.sections }, (_, index) => ({
            id: `section-generated-${index}-${Date.now()}`,
            name: `Раздел ${index + 1}`,
            description: 'Описание раздела',
            sectionNumber: index + 1,
            theoryCount: 1,
            theories: [{
              id: `theory-generated-${index}-${Date.now()}`,
              name: `Теория ${index + 1}`,
              article: 'Теоретический материал для изучения.',
              index: 0
            }],
            tasks: [
              {
                id: `task-generated-${index}-${Date.now()}`,
                name: 'Пример вопроса',
                description: 'Выберите правильный вариант ответа',
                answers: [
                  'Правильный ответ',
                  'Неправильный вариант 1',
                  'Неправильный вариант 2',
                  'Неправильный вариант 3'
                ],
                correctAnswerIndex: 0
              }
            ]
          }));
          setSections(testSections);
        } else {
     
          const testSections = [
            {
              id: `section-fallback-${Date.now()}`,
              name: 'Введение',
              description: 'Основы программирования',
              theoryCount: 1,
              theories: [{
                id: `theory-fallback-${Date.now()}`,
                name: 'Теория раздела 1',
                article: 'Это теоретический материал для изучения.',
                index: 0
              }],
              tasks: [
                {
                  id: `task-fallback-${Date.now()}`,
                  name: 'Пример вопроса',
                  description: 'Выберите правильный вариант ответа',
                  answers: [
                    'Правильный ответ',
                    'Неправильный вариант 1',
                    'Неправильный вариант 2',
                    'Неправильный вариант 3'
                  ],
                  correctAnswerIndex: 0
                }
              ]
            }
          ];
          setSections(testSections);
        }
      }
      
    } catch (error) {
      console.error('Ошибка загрузки курса:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSection = (section) => {
    setCurrentSection(section);
    setCurrentTheoryIndex(0); // Сбрасываем индекс теории к первой
    setCurrentStep('theory');
    setCurrentTaskIndex(0);
    setSelectedAnswer(null);
    setShowAnswerResult(false);
    setScore(0);
    setUserAnswers({});
  };

  const handleNextTheory = () => {
    if (currentSection && currentTheoryIndex < currentSection.theoryCount - 1) {
      setCurrentTheoryIndex(prev => prev + 1);
    } else {
      // Если это последняя теория, переходим к заданиям
      handleStartTasks();
    }
  };

  const handlePrevTheory = () => {
    if (currentTheoryIndex > 0) {
      setCurrentTheoryIndex(prev => prev - 1);
    } else {
      // Если это первая теория, возвращаемся к выбору раздела
      setCurrentStep('sections');
    }
  };

  const handleStartTasks = () => {
    if (currentSection) {
      setCurrentStep('task');
      setCurrentTaskIndex(0);
      setSelectedAnswer(null);
      setShowAnswerResult(false);
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
    
    setUserAnswers(prev => ({
      ...prev,
      [currentTaskIndex]: {
        answer: selectedAnswer,
        isCorrect: isCorrect
      }
    }));
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    
    setTimeout(() => {
      if (currentTaskIndex < currentSection.tasks.length - 1) {
        setCurrentTaskIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setShowAnswerResult(false);
      } else {
        setCurrentStep('results');
      
        if (!completedSections.includes(currentSection.id)) {
          setCompletedSections(prev => [...prev, currentSection.id]);
          setTotalScore(prev => prev + score);
          
          saveProgress();
        }
      }
    }, 1500);
  };

  const saveProgress = () => {
    try {
      const progressKey = `course-progress-${courseId}`;
      const progressData = {
        courseId: courseId,
        completedSections: completedSections,
        totalScore: totalScore + score,
        lastAccessed: new Date().toISOString()
      };
      localStorage.setItem(progressKey, JSON.stringify(progressData));
    } catch (error) {
      console.error('Ошибка сохранения прогресса:', error);
    }
  };

  const handleNextTask = () => {
    if (currentTaskIndex < currentSection.tasks.length - 1) {
      setCurrentTaskIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowAnswerResult(false);
    } else {
      setCurrentStep('results');
    }
  };

  const handlePrevTask = () => {
    if (currentTaskIndex > 0) {
      setCurrentTaskIndex(prev => prev - 1);
      setSelectedAnswer(null);
      setShowAnswerResult(false);
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
    setUserAnswers({});
    setSelectedAnswer(null);
    setShowAnswerResult(false);
    setScore(0);
    setCurrentStep('task');
  };

  const handleNextSection = () => {
    const currentIndex = sections.findIndex(s => s.id === currentSection.id);
    if (currentIndex < sections.length - 1) {
      handleSelectSection(sections[currentIndex + 1]);
    } else {
      const totalTasks = sections.reduce((sum, section) => sum + (section.tasks?.length || 0), 0);
      const finalScore = totalTasks > 0 ? Math.round((totalScore / totalTasks) * 100) : 0;
      
      saveFinalResult(finalScore);
      
      navigate('/courses');
    }
  };

  const saveFinalResult = (finalScore) => {
    try {
      const resultsKey = 'course-results';
      const results = JSON.parse(localStorage.getItem(resultsKey) || '[]');
      
      const existingResultIndex = results.findIndex(r => r.courseId === courseId);
      const resultData = {
        courseId: courseId,
        courseTitle: course.title,
        finalScore: finalScore,
        completedAt: new Date().toISOString(),
        sectionsCompleted: completedSections.length,
        totalSections: sections.length
      };
      
      if (existingResultIndex !== -1) {
        results[existingResultIndex] = resultData;
      } else {
        results.push(resultData);
      }
      
      localStorage.setItem(resultsKey, JSON.stringify(results));
    } catch (error) {
      console.error('Ошибка сохранения результата:', error);
    }
  };

  const handleExitCourse = () => {
    navigate('/courses');
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
            <p>Курс с ID {courseId} не существует.</p>
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

  // Получаем текущую теорию
  const currentTheory = currentSection?.theories?.[currentTheoryIndex] || 
                       (currentSection?.theories?.length > 0 ? currentSection.theories[0] : null);

  return (
    <div className="course-learning">
      <div className="learning-container">
        <header className="learning-header">
          <div>
            <h1>{course.title}</h1>
            <p style={{ opacity: 0.9, fontSize: '14px' }}>
              {course.language} • Сложность: {course.difficulty}
              {course.isFromAPI && ' • Серверный курс'}
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
                    key={`${section.id}-${index}`} 
                    className={`section-card ${currentSection?.id === section.id ? 'active' : ''} ${completedSections.includes(section.id) ? 'completed' : ''}`}
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