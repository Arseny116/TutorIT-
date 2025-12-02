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

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  const loadCourseData = () => {
    setIsLoading(true);
    
    try {
      const localCourses = JSON.parse(localStorage.getItem('tutorit-courses') || '[]');
      console.log('Все курсы в localStorage:', localCourses);
      
      const courseIdStr = String(courseId);
      
      const foundCourse = localCourses.find(course => {
        const storedId = String(course.id).replace(/^["']+|["']+$/g, '').trim();
        return storedId === courseIdStr;
      });
      
      console.log('Найденный курс:', foundCourse);
      
      if (!foundCourse) {
        console.log('Курс не найден, создаю тестовый...');
        const testCourse = {
          id: courseId,
          title: 'Тестовый курс',
          description: 'Это тестовый курс для демонстрации',
          sections: 3,
          difficulty: 1,
          language: 'JavaScript',
          sectionsData: []
        };
        
        const testSections = [
          {
            id: 'section-1',
            name: 'Введение',
            description: 'Основы программирования',
            theory: {
              name: 'Что такое программирование?',
              article: 'Программирование - это процесс создания компьютерных программ. Программа - это набор инструкций, которые компьютер выполняет для решения задачи.\n\nОсновные понятия:\n1. Алгоритм\n2. Переменные\n3. Условия\n4. Циклы'
            },
            tasks: [
              {
                id: 'task-1',
                name: 'Первый вопрос',
                description: 'Что такое алгоритм?',
                answers: [
                  'Последовательность шагов для решения задачи',
                  'Язык программирования',
                  'Тип данных',
                  'Имя переменной'
                ],
                correctAnswerIndex: 0
              },
              {
                id: 'task-2',
                name: 'Второй вопрос',
                description: 'Что такое переменная?',
                answers: [
                  'Имя для хранения данных',
                  'Тип цикла',
                  'Математическая функция',
                  'Синтаксическая ошибка'
                ],
                correctAnswerIndex: 0
              }
            ]
          },
          {
            id: 'section-2',
            name: 'Переменные и типы данных',
            description: 'Работа с данными в программировании',
            theory: {
              name: 'Типы данных',
              article: 'Типы данных определяют, какого рода информацию может хранить переменная.\n\nОсновные типы:\n1. Числа (int, float)\n2. Строки (string)\n3. Булевы значения (boolean)\n4. Массивы\n5. Объекты'
            },
            tasks: [
              {
                id: 'task-3',
                name: 'Типы данных',
                description: 'Какой тип используется для хранения текста?',
                answers: [
                  'String',
                  'Integer',
                  'Boolean',
                  'Array'
                ],
                correctAnswerIndex: 0
              }
            ]
          }
        ];
        
        setCourse(testCourse);
        setSections(testSections);
        
      } else {
        setCourse({
          id: foundCourse.id,
          title: foundCourse.title || 'Курс',
          description: foundCourse.description || 'Описание курса',
          sections: foundCourse.sections || 0,
          difficulty: foundCourse.difficulty || 1,
          language: foundCourse.language || 'Не указан'
        });
        
        if (foundCourse.sectionsData && foundCourse.sectionsData.length > 0) {
          const loadedSections = foundCourse.sectionsData.map((section, index) => ({
            id: section.id || `section-${index}`,
            name: section.name || `Раздел ${index + 1}`,
            description: section.description || 'Описание раздела',
            theory: section.theory || null,
            tasks: section.tasks || [],
            completed: false,
            progress: 0,
            sectionNumber: index + 1
          }));
          setSections(loadedSections);
        } else {
          const testSections = [
            {
              id: 'section-1',
              name: 'Введение',
              description: 'Основы программирования',
              theory: {
                name: 'Теория раздела 1',
                article: 'Это теоретический материал для изучения.'
              },
              tasks: [
                {
                  id: 'task-1',
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
    setCurrentStep('theory');
    setCurrentTaskIndex(0);
    setSelectedAnswer(null);
    setShowAnswerResult(false);
    setScore(0);
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
      }
    }, 1500);
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
      alert('🎉 Поздравляем! Вы завершили курс!');
      navigate('/courses');
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
            {currentStep === 'theory' && 'Теория'}
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
              </div>
              
              <div className="sections-grid">
                {sections.map((section, index) => (
                  <div 
                    key={section.id}
                    className={`section-card ${currentSection?.id === section.id ? 'active' : ''}`}
                    onClick={() => handleSelectSection(section)}
                  >
                    <h3>{section.name}</h3>
                    <p className="section-description">{section.description}</p>
                    <div className="section-meta">
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
              </div>
              
              <div className="theory-content">
                {currentSection.theory ? (
                  <>
                    <h3>{currentSection.theory.name}</h3>
                    <div style={{ whiteSpace: 'pre-line' }}>
                      {currentSection.theory.article || 'Теоретический материал отсутствует'}
                    </div>
                  </>
                ) : (
                  <p>Теоретический материал для этого раздела еще не добавлен.</p>
                )}
              </div>
              
              <div className="navigation-buttons">
                <button className="nav-btn back" onClick={handleBackToSections}>
                  ← Назад к разделам
                </button>
                <button className="nav-btn next" onClick={handleStartTasks}>
                  К заданиям →
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
                        key={index}
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