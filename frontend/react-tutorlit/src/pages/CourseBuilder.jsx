import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './CourseBuilder.css';

function CourseBuilder() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [currentStep, setCurrentStep] = useState('section');

  // Загрузка курса
  useEffect(() => {
    const courses = JSON.parse(localStorage.getItem('tutorit-courses') || '[]');
    const foundCourse = courses.find(c => c.id === parseInt(courseId));
    
    if (foundCourse) {
      // ✅ ГАРАНТИРУЕМ, что sectionsData существует
      const courseWithSections = {
        ...foundCourse,
        sectionsData: foundCourse.sectionsData || []
      };
      setCourse(courseWithSections);
    }
  }, [courseId]);

  // Шаг 1: Конструктор раздела
  const SectionBuilder = () => {
    const [sectionData, setSectionData] = useState({
      title: '',
      description: '',
      theoryBlocks: 0,
      tasksCount: 0
    });

    const handleSaveSection = () => {
      // ✅ ПРАВИЛЬНО работаем с sectionsData
      const currentSections = course.sectionsData || [];
      
      const updatedCourse = {
        ...course,
        sectionsData: [
          ...currentSections,
          {
            ...sectionData,
            sectionNumber: currentSections.length + 1,
            theory: [],
            assignments: []
          }
        ]
      };
      
      // Сохраняем в localStorage
      const courses = JSON.parse(localStorage.getItem('tutorit-courses') || '[]');
      const updatedCourses = courses.map(c => 
        c.id === parseInt(courseId) ? updatedCourse : c
      );
      localStorage.setItem('tutorit-courses', JSON.stringify(updatedCourses));
      setCourse(updatedCourse);
      
      // Переходим к конструктору теории
      setCurrentStep('theory');
    };

    return (
      <div className="builder-step">
        <h2>Конструктор раздела {(course.sectionsData?.length || 0) + 1}</h2>
        
        <div className="form-group">
          <label>Название раздела *</label>
          <input
            type="text"
            value={sectionData.title}
            onChange={(e) => setSectionData(prev => ({...prev, title: e.target.value}))}
            placeholder="Введите название раздела"
          />
        </div>

        <div className="form-group">
          <label>Описание раздела *</label>
          <textarea
            value={sectionData.description}
            onChange={(e) => setSectionData(prev => ({...prev, description: e.target.value}))}
            placeholder="Опишите содержание раздела"
            rows="3"
          />
        </div>

        <div className="counters-row">
          <div className="form-group">
            <label>Количество блоков теории</label>
            <input
              type="number"
              value={sectionData.theoryBlocks}
              onChange={(e) => setSectionData(prev => ({...prev, theoryBlocks: parseInt(e.target.value) || 0}))}
              min="0"
              max="10"
            />
          </div>

          <div className="form-group">
            <label>Количество задач</label>
            <input
              type="number"
              value={sectionData.tasksCount}
              onChange={(e) => setSectionData(prev => ({...prev, tasksCount: parseInt(e.target.value) || 0}))}
              min="0"
              max="10"
            />
          </div>
        </div>

        <button 
          className="next-btn"
          onClick={handleSaveSection}
          disabled={!sectionData.title || !sectionData.description}
        >
          Дальше → Конструктор теории
        </button>
      </div>
    );
  };

  // Шаг 2: Конструктор теории
  const TheoryBuilder = () => {
    // ✅ БЕЗОПАСНО получаем текущий раздел
    const currentSections = course.sectionsData || [];
    const currentSection = currentSections[currentSections.length - 1];
    
    if (!currentSection) {
      return <div>Ошибка: раздел не найден</div>;
    }

    const [theoryBlocks, setTheoryBlocks] = useState(
      Array.from({length: currentSection.theoryBlocks || 0}, (_, i) => ({
        blockNumber: i + 1,
        title: '',
        content: ''
      }))
    );

    const handleTheoryChange = (index, field, value) => {
      const newBlocks = [...theoryBlocks];
      newBlocks[index] = {...newBlocks[index], [field]: value};
      setTheoryBlocks(newBlocks);
    };

    const handleSaveTheory = () => {
      const updatedSections = [...(course.sectionsData || [])];
      const lastIndex = updatedSections.length - 1;
      
      if (lastIndex >= 0) {
        updatedSections[lastIndex] = {
          ...updatedSections[lastIndex],
          theory: theoryBlocks
        };
      }

      const updatedCourse = {
        ...course,
        sectionsData: updatedSections
      };

      const courses = JSON.parse(localStorage.getItem('tutorit-courses') || '[]');
      const updatedCourses = courses.map(c => 
        c.id === parseInt(courseId) ? updatedCourse : c
      );
      localStorage.setItem('tutorit-courses', JSON.stringify(updatedCourses));
      setCourse(updatedCourse);
      setCurrentStep('assignment');
    };

    return (
      <div className="builder-step">
        <h2>Конструктор теории для раздела: {currentSection.title}</h2>
        <p>Заполните теоретические материалы ({currentSection.theoryBlocks} блоков)</p>

        {theoryBlocks.map((block, index) => (
          <div key={index} className="theory-block">
            <h3>Блок теории {block.blockNumber}</h3>
            
            <div className="form-group">
              <label>Название блока теории *</label>
              <input
                type="text"
                value={block.title}
                onChange={(e) => handleTheoryChange(index, 'title', e.target.value)}
                placeholder="Введите название блока теории"
              />
            </div>

            <div className="form-group">
              <label>Теория раздела *</label>
              <textarea
                value={block.content}
                onChange={(e) => handleTheoryChange(index, 'content', e.target.value)}
                placeholder="Введите теоретический материал"
                rows="6"
              />
            </div>
          </div>
        ))}

        <button 
          className="next-btn"
          onClick={handleSaveTheory}
          disabled={theoryBlocks.some(block => !block.title || !block.content)}
        >
          Дальше → Конструктор заданий
        </button>
      </div>
    );
  };

  // Шаг 3: Конструктор заданий
  const AssignmentBuilder = () => {
    const currentSections = course.sectionsData || [];
    const currentSection = currentSections[currentSections.length - 1];
    
    if (!currentSection) {
      return <div>Ошибка: раздел не найден</div>;
    }

    const [assignments, setAssignments] = useState(
      Array.from({length: currentSection.tasksCount || 0}, (_, i) => ({
        taskNumber: i + 1,
        title: '',
        description: '',
        answers: []
      }))
    );

    const handleAssignmentChange = (index, field, value) => {
      const newAssignments = [...assignments];
      newAssignments[index] = {...newAssignments[index], [field]: value};
      setAssignments(newAssignments);
    };

    const handleSaveAssignments = () => {
      const updatedSections = [...(course.sectionsData || [])];
      const lastIndex = updatedSections.length - 1;
      
      if (lastIndex >= 0) {
        updatedSections[lastIndex] = {
          ...updatedSections[lastIndex],
          assignments: assignments
        };
      }

      const updatedCourse = {
        ...course,
        sectionsData: updatedSections
      };

      const courses = JSON.parse(localStorage.getItem('tutorit-courses') || '[]');
      const updatedCourses = courses.map(c => 
        c.id === parseInt(courseId) ? updatedCourse : c
      );
      localStorage.setItem('tutorit-courses', JSON.stringify(updatedCourses));
      setCourse(updatedCourse);
      setCurrentStep('answers');
    };

    return (
      <div className="builder-step">
        <h2>Конструктор заданий для раздела: {currentSection.title}</h2>
        <p>Создайте практические задания ({currentSection.tasksCount} задач)</p>

        {assignments.map((assignment, index) => (
          <div key={index} className="assignment-block">
            <h3>Задание {assignment.taskNumber}</h3>
            
            <div className="form-group">
              <label>Название задания *</label>
              <input
                type="text"
                value={assignment.title}
                onChange={(e) => handleAssignmentChange(index, 'title', e.target.value)}
                placeholder="Введите название задания"
              />
            </div>

            <div className="form-group">
              <label>Описание задания *</label>
              <textarea
                value={assignment.description}
                onChange={(e) => handleAssignmentChange(index, 'description', e.target.value)}
                placeholder="Опишите задание"
                rows="4"
              />
            </div>
          </div>
        ))}

        <button 
          className="next-btn"
          onClick={handleSaveAssignments}
          disabled={assignments.some(task => !task.title || !task.description)}
        >
          Дальше → Конструктор ответов
        </button>
      </div>
    );
  };

  // Шаг 4: Конструктор ответов
  const AnswersBuilder = () => {
    const currentSections = course.sectionsData || [];
    const currentSection = currentSections[currentSections.length - 1];
    
    if (!currentSection) {
      return <div>Ошибка: раздел не найден</div>;
    }

    const [answers, setAnswers] = useState(
      (currentSection.assignments || []).map(assignment => ({
        taskId: assignment.taskNumber,
        answers: Array.from({length: 4}, (_, i) => ({
          id: i + 1,
          text: '',
          isCorrect: false
        }))
      }))
    );

    const handleAnswerChange = (taskIndex, answerIndex, value) => {
      const newAnswers = [...answers];
      newAnswers[taskIndex].answers[answerIndex].text = value;
      setAnswers(newAnswers);
    };

    const handleCorrectAnswer = (taskIndex, answerIndex) => {
      const newAnswers = [...answers];
      newAnswers[taskIndex].answers.forEach((answer, idx) => {
        answer.isCorrect = idx === answerIndex;
      });
      setAnswers(newAnswers);
    };

    const handleFinishSection = () => {
      // Сохраняем ответы
      const updatedSections = [...(course.sectionsData || [])];
      const lastIndex = updatedSections.length - 1;
      
      if (lastIndex >= 0) {
        updatedSections[lastIndex] = {
          ...updatedSections[lastIndex],
          assignments: (updatedSections[lastIndex].assignments || []).map((assignment, taskIndex) => ({
            ...assignment,
            answers: answers[taskIndex]?.answers || []
          }))
        };
      }

      const updatedCourse = {
        ...course,
        sectionsData: updatedSections
      };

      const courses = JSON.parse(localStorage.getItem('tutorit-courses') || '[]');
      const updatedCourses = courses.map(c => 
        c.id === parseInt(courseId) ? updatedCourse : c
      );
      localStorage.setItem('tutorit-courses', JSON.stringify(updatedCourses));

      // Проверяем, все ли разделы заполнены
      const completedSections = updatedSections.length;
      const totalSections = course.sections || 0;

      if (completedSections < totalSections) {
        // Переходим к следующему разделу
        setCurrentStep('section');
      } else {
        // Все разделы заполнены
        alert('Все разделы курса успешно созданы!');
        navigate(`/course/${courseId}`);
      }
    };

    return (
      <div className="builder-step">
        <h2>Конструктор ответов для раздела: {currentSection.title}</h2>
        <p>Добавьте варианты ответов для каждого задания</p>

        {answers.map((taskAnswers, taskIndex) => (
          <div key={taskIndex} className="answers-block">
            <h3>Ответы для задания: {currentSection.assignments[taskIndex]?.title}</h3>
            
            {taskAnswers.answers.map((answer, answerIndex) => (
              <div key={answerIndex} className="answer-row">
                <div className="form-group">
                  <label>Ответ {answerIndex + 1} *</label>
                  <input
                    type="text"
                    value={answer.text}
                    onChange={(e) => handleAnswerChange(taskIndex, answerIndex, e.target.value)}
                    placeholder="Введите вариант ответа"
                  />
                </div>
                
                <label className="correct-answer">
                  <input
                    type="radio"
                    name={`correct-${taskIndex}`}
                    checked={answer.isCorrect}
                    onChange={() => handleCorrectAnswer(taskIndex, answerIndex)}
                  />
                  Правильный ответ
                </label>
              </div>
            ))}
          </div>
        ))}

        <div className="completion-section">
          <h3>
            {(course.sectionsData?.length || 0)} из {course.sections} разделов завершено
          </h3>
          
          <button 
            className="finish-btn"
            onClick={handleFinishSection}
            disabled={answers.some(task => 
              task.answers.some(answer => !answer.text) ||
              !task.answers.some(answer => answer.isCorrect)
            )}
          >
            {(course.sectionsData?.length || 0) < course.sections 
              ? 'Следующий раздел →' 
              : 'Завершить создание курса'
            }
          </button>
        </div>
      </div>
    );
  };

  if (!course) return <div>Загрузка...</div>;

  return (
    <div className="course-builder">
      <header className="builder-header">
        <button onClick={() => navigate(`/course/${courseId}`)} className="back-button">
          ← Назад к курсу
        </button>
        <h1>Конструктор курса: {course.title}</h1>
        <div className="progress">
          Раздел {course.sectionsData?.length || 0} из {course.sections}
        </div>
      </header>

      <div className="builder-content">
        {currentStep === 'section' && <SectionBuilder />}
        {currentStep === 'theory' && <TheoryBuilder />}
        {currentStep === 'assignment' && <AssignmentBuilder />}
        {currentStep === 'answers' && <AnswersBuilder />}
      </div>
    </div>
  );
}

export default CourseBuilder;