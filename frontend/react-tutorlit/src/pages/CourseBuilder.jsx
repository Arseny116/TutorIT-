import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import './CourseBuilder.css';

function CourseBuilder() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cleanedCourseId, setCleanedCourseId] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const [currentStep, setCurrentStep] = useState('section-details');
  const [sectionData, setSectionData] = useState({
    totalSections: 0,
    currentSectionIndex: 0,
    sections: []
  });

  const [currentTheoryIndex, setCurrentTheoryIndex] = useState(0);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);

  // Состояния для модального окна подтверждения
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);

  const showConfirm = (message, onConfirm) => {
    setConfirmMessage(message);
    setConfirmAction(() => onConfirm);
    setShowConfirmModal(true);
  };

  const handleConfirm = () => {
    if (confirmAction) {
      confirmAction();
    }
    setShowConfirmModal(false);
    setConfirmAction(null);
  };

  const handleCancelConfirm = () => {
    setShowConfirmModal(false);
    setConfirmAction(null);
  };

  useEffect(() => {
    if (courseId) {
      const cleanId = courseId.replace(/^["']+|["']+$/g, '').trim();
      setCleanedCourseId(cleanId);
    }
  }, [courseId]);

  useEffect(() => {
    if (!cleanedCourseId) return;

    const loadCourseFromServer = async () => {
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

        if (response.ok) {
          const courseData = await response.json();
          const courseWithSections = {
            id: courseData.id,
            title: courseData.title,
            description: courseData.description,
            sections: courseData.chapters || 1,
            difficulty: courseData.complexity,
            language: courseData.pl,
            sectionsData: courseData.numberChapters || []
          };
          setCourse(courseWithSections);

          const totalSections = courseData.chapters || 1;

          if (courseWithSections.sectionsData.length > 0) {
            setSectionData({
              totalSections: totalSections,
              sections: courseWithSections.sectionsData,
              currentSectionIndex: courseWithSections.sectionsData.length < totalSections
                  ? courseWithSections.sectionsData.length
                  : 0
            });
          } else {
            const newSections = Array.from({ length: totalSections }, (_, i) => ({
              id: null,
              name: '',
              description: '',
              numberTheoryBloks: 0,
              numberTasks: 0,
              theory: [],
              tasks: [],
              sectionNumber: i + 1
            }));

            setSectionData({
              totalSections: totalSections,
              currentSectionIndex: 0,
              sections: newSections
            });
          }
        } else {
          setStatusMessage('Не удалось загрузить курс');
          setTimeout(() => navigate('/courses'), 2000);
        }
      } catch (error) {
        console.error('Ошибка загрузки курса:', error);
        setStatusMessage('Ошибка загрузки курса');
        setTimeout(() => navigate('/courses'), 2000);
      }
    };

    loadCourseFromServer();
  }, [cleanedCourseId, navigate]);

  const handleGoBack = () => {
    const currentSection = sectionData.sections[sectionData.currentSectionIndex];

    switch (currentStep) {
      case 'theory':
        if (currentTheoryIndex > 0) {
          setCurrentTheoryIndex(currentTheoryIndex - 1);
        } else {
          showConfirm('Все несохраненные изменения в текущем разделе будут потеряны. Продолжить?', () => {
            setCurrentStep('section-details');
          });
        }
        break;

      case 'assignment':
        if (currentTaskIndex > 0) {
          setCurrentTaskIndex(currentTaskIndex - 1);
        } else if (currentSection?.theory?.length > 0) {
          showConfirm('Все несохраненные изменения в текущем задании будут потеряны. Продолжить?', () => {
            setCurrentStep('theory');
            setCurrentTheoryIndex(currentSection.theory.length - 1);
          });
        } else {
          showConfirm('Все несохраненные изменения в текущем разделе будут потеряны. Продолжить?', () => {
            setCurrentStep('section-details');
          });
        }
        break;

      case 'answers':
        showConfirm('Все несохраненные изменения в ответах будут потеряны. Продолжить?', () => {
          setCurrentStep('assignment');
        });
        break;

      case 'section-details':
        // Кнопка "Назад" в разделе удалена, этот код не используется
        break;

      default:
        break;
    }
  };

  const handleNextSectionOrFinish = () => {
    if (sectionData.currentSectionIndex < sectionData.totalSections - 1) {
      setSectionData(prev => ({
        ...prev,
        currentSectionIndex: prev.currentSectionIndex + 1
      }));
      setCurrentTheoryIndex(0);
      setCurrentTaskIndex(0);
      setCurrentStep('section-details');
      setStatusMessage(`Переход к разделу ${sectionData.currentSectionIndex + 2}...`);
    } else {
      setStatusMessage('Все разделы созданы! Перенаправление на главную...');
      setTimeout(() => navigate('/'), 2000);
    }
  };

  // SectionDetailsBuilder (без кнопки "Назад")
  const SectionDetailsBuilder = () => {
    const currentSection = sectionData.sections[sectionData.currentSectionIndex];

    const [localSectionData, setLocalSectionData] = useState({
      name: currentSection?.name || '',
      description: currentSection?.description || '',
      numberTheoryBloks: currentSection?.numberTheoryBloks || 0,
      numberTasks: currentSection?.numberTasks || 0
    });

    const handleSaveSectionDetails = async () => {
      if (!localSectionData.name || !localSectionData.description) {
        setStatusMessage('Заполните название и описание раздела');
        setTimeout(() => setStatusMessage(''), 3000);
        return;
      }

      if (localSectionData.numberTheoryBloks < 0 || localSectionData.numberTasks < 0) {
        setStatusMessage('Количество блоков теории и заданий должно быть не менее 0');
        setTimeout(() => setStatusMessage(''), 3000);
        return;
      }

      setIsLoading(true);
      setDebugInfo('Создание раздела...');
      setStatusMessage('Создание раздела...');

      try {
        if (!cleanedCourseId) {
          throw new Error('CourseId не определен');
        }

        const apiUrl = `/api/v1/Chapters/${cleanedCourseId}`;

        const requestData = {
          name: localSectionData.name,
          description: localSectionData.description,
          numberTheoryBloks: parseInt(localSectionData.numberTheoryBloks) || 0,
          numberTasks: parseInt(localSectionData.numberTasks) || 0
        };

        const token = authService.getToken();
        const headers = {
          'Content-Type': 'application/json',
          'accept': 'text/plain'
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(requestData),
          credentials: 'include'
        });

        const responseText = await response.text();
        console.log('Ответ сервера:', response.status, responseText);

        if (response.status === 401) {
          authService.logout();
          alert('Сессия истекла. Пожалуйста, войдите заново.');
          navigate('/');
          return;
        }

        if (!response.ok) {
          throw new Error(`Ошибка создания раздела (${response.status})`);
        }

        const chapterId = responseText.replace(/["'\s]/g, '').trim();
        console.log('Раздел создан, ID:', chapterId);

        const theoryArray = Array.from({ length: localSectionData.numberTheoryBloks }, (_, i) => ({
          id: null,
          name: '',
          article: '',
          image: null,
          imagePreview: '',
          index: i
        }));

        const tasksArray = Array.from({ length: localSectionData.numberTasks }, (_, i) => ({
          id: null,
          name: '',
          description: '',
          hint: '',
          image: null,
          imagePreview: '',
          index: i,
          answers: ['', '', '', ''],
          correctAnswerIndex: 0,
          questions: []
        }));

        const updatedSections = [...sectionData.sections];
        updatedSections[sectionData.currentSectionIndex] = {
          ...updatedSections[sectionData.currentSectionIndex],
          id: chapterId,
          name: localSectionData.name,
          description: localSectionData.description,
          numberTheoryBloks: localSectionData.numberTheoryBloks,
          numberTasks: localSectionData.numberTasks,
          theory: theoryArray,
          tasks: tasksArray
        };

        setSectionData(prev => ({
          ...prev,
          sections: updatedSections
        }));

        setStatusMessage(`Раздел "${localSectionData.name}" успешно создан!`);

        if (localSectionData.numberTheoryBloks > 0) {
          setCurrentTheoryIndex(0);
          setCurrentStep('theory');
        } else if (localSectionData.numberTasks > 0) {
          setCurrentTaskIndex(0);
          setCurrentStep('assignment');
        } else {
          handleNextSectionOrFinish();
        }

      } catch (error) {
        console.error('Ошибка создания раздела:', error);
        setDebugInfo(`Ошибка: ${error.message}`);
        setStatusMessage(`Ошибка создания раздела: ${error.message}`);
        setTimeout(() => setStatusMessage(''), 5000);
      } finally {
        setIsLoading(false);
      }
    };

    return (
        <div className="builder-step">
          <h2>Раздел {sectionData.currentSectionIndex + 1} из {sectionData.totalSections}</h2>
          {debugInfo && <div className="debug-info">{debugInfo}</div>}
          {statusMessage && <div className="status-message">{statusMessage}</div>}

          <div className="form-group">
            <label>Название раздела *</label>
            <input
                type="text"
                value={localSectionData.name}
                onChange={(e) => setLocalSectionData(prev => ({...prev, name: e.target.value}))}
                placeholder="Введите название раздела"
                disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label>Описание раздела *</label>
            <textarea
                value={localSectionData.description}
                onChange={(e) => setLocalSectionData(prev => ({...prev, description: e.target.value}))}
                placeholder="Опишите содержание раздела"
                rows="3"
                disabled={isLoading}
            />
          </div>

          <div className="counters-row">
            <div className="form-group">
              <label>Количество блоков теории</label>
              <input
                  type="number"
                  value={localSectionData.numberTheoryBloks}
                  onChange={(e) => setLocalSectionData(prev => ({...prev, numberTheoryBloks: parseInt(e.target.value) || 0}))}
                  min="0"
                  max="10"
                  disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label>Количество заданий</label>
              <input
                  type="number"
                  value={localSectionData.numberTasks}
                  onChange={(e) => setLocalSectionData(prev => ({...prev, numberTasks: parseInt(e.target.value) || 0}))}
                  min="0"
                  max="10"
                  disabled={isLoading}
              />
            </div>
          </div>

          <div className="navigation-buttons">
            <button
                className="next-btn green-btn"
                onClick={handleSaveSectionDetails}
                disabled={!localSectionData.name || !localSectionData.description || isLoading}
            >
              {isLoading ? 'Создание...' : 'Далее →'}
            </button>
          </div>
        </div>
    );
  };

  // TheoryBuilder
  const TheoryBuilder = () => {
    const currentSection = sectionData.sections[sectionData.currentSectionIndex];
    const currentTheory = currentSection?.theory?.[currentTheoryIndex];

    const [theoryData, setTheoryData] = useState({
      name: currentTheory?.name || '',
      article: currentTheory?.article || '',
      image: currentTheory?.image || null,
      imagePreview: currentTheory?.imagePreview || ''
    });

    useEffect(() => {
      if (currentTheory) {
        setTheoryData({
          name: currentTheory.name || '',
          article: currentTheory.article || '',
          image: currentTheory.image || null,
          imagePreview: currentTheory.imagePreview || ''
        });
      }
    }, [currentTheory]);

    const handleImageChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setTheoryData(prev => ({
            ...prev,
            image: file,
            imagePreview: reader.result
          }));
        };
        reader.readAsDataURL(file);
      }
    };

    const handleSaveTheory = async () => {
      if (!theoryData.name || !theoryData.article) {
        setStatusMessage('Заполните название и содержание теории');
        setTimeout(() => setStatusMessage(''), 3000);
        return;
      }

      setIsLoading(true);
      setStatusMessage('Создание теории...');

      try {
        const chapterId = currentSection.id;

        const token = authService.getToken();
        const formData = new FormData();
        formData.append('Name', theoryData.name);
        formData.append('Article', theoryData.article);

        if (theoryData.image) {
          formData.append('TitleImage', theoryData.image);
        }

        const headers = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`/api/v1/Theories?ChapterId=${chapterId}`, {
          method: 'POST',
          headers: headers,
          body: formData,
          credentials: 'include'
        });

        const responseText = await response.text();
        console.log('Ответ сервера:', response.status, responseText);

        if (response.status === 401) {
          authService.logout();
          alert('Сессия истекла. Пожалуйста, войдите заново.');
          navigate('/');
          return;
        }

        if (!response.ok) {
          throw new Error(`Ошибка создания теории (${response.status})`);
        }

        const theoryId = responseText.replace(/["'\s]/g, '').trim();
        console.log('Теория создана, ID:', theoryId);

        const updatedSections = [...sectionData.sections];
        updatedSections[sectionData.currentSectionIndex].theory[currentTheoryIndex] = {
          ...updatedSections[sectionData.currentSectionIndex].theory[currentTheoryIndex],
          id: theoryId,
          name: theoryData.name,
          article: theoryData.article,
          image: theoryData.image,
          imagePreview: theoryData.imagePreview
        };

        setSectionData(prev => ({
          ...prev,
          sections: updatedSections
        }));

        setStatusMessage('Теория сохранена на сервере!');

        if (currentTheoryIndex < currentSection.theory.length - 1) {
          setCurrentTheoryIndex(currentTheoryIndex + 1);
          setTheoryData({ name: '', article: '', image: null, imagePreview: '' });
          setStatusMessage(`Переход к блоку теории ${currentTheoryIndex + 2}...`);
        } else if (currentSection.numberTasks > 0) {
          setCurrentTaskIndex(0);
          setCurrentStep('assignment');
          setStatusMessage('Переход к конструктору заданий...');
        } else {
          handleNextSectionOrFinish();
        }

      } catch (error) {
        console.error('Ошибка создания теории:', error);
        setStatusMessage(`Ошибка: ${error.message}`);
        setTimeout(() => setStatusMessage(''), 5000);
      } finally {
        setIsLoading(false);
      }
    };

    return (
        <div className="builder-step">
          <h2>Конструктор теории</h2>
          {statusMessage && <div className="status-message">{statusMessage}</div>}
          <p className="step-info">
            Раздел {sectionData.currentSectionIndex + 1}: <strong>{currentSection?.name}</strong> |
            Блок теории {currentTheoryIndex + 1} из {currentSection?.theory?.length}
          </p>

          <div className="form-group">
            <label>Название теории *</label>
            <input
                type="text"
                value={theoryData.name}
                onChange={(e) => setTheoryData(prev => ({...prev, name: e.target.value}))}
                placeholder="Введите название теории"
                disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label>Изображение</label>
            <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isLoading}
            />
            {theoryData.imagePreview && (
                <div style={{ marginTop: '10px' }}>
                  <img
                      src={theoryData.imagePreview}
                      alt="Предпросмотр"
                      style={{ maxWidth: '200px', maxHeight: '150px', borderRadius: '8px', border: '1px solid #ddd' }}
                  />
                  <button
                      type="button"
                      onClick={() => setTheoryData(prev => ({ ...prev, image: null, imagePreview: '' }))}
                      style={{
                        display: 'block',
                        marginTop: '5px',
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                  >
                    Удалить
                  </button>
                </div>
            )}
          </div>

          <div className="form-group">
            <label>Теоретические материалы *</label>
            <textarea
                value={theoryData.article}
                onChange={(e) => setTheoryData(prev => ({...prev, article: e.target.value}))}
                placeholder="Введите теоретические материалы..."
                rows="10"
                disabled={isLoading}
            />
          </div>

          <div className="navigation-buttons">
            <button
                className="btn-back"
                onClick={handleGoBack}
                disabled={isLoading}
            >
              ← Назад
            </button>
            <button
                className="next-btn green-btn"
                onClick={handleSaveTheory}
                disabled={!theoryData.name || !theoryData.article || isLoading}
            >
              {isLoading ? 'Сохранение...' : 'Далее →'}
            </button>
          </div>
        </div>
    );
  };

  // AssignmentBuilder
  const AssignmentBuilder = () => {
    const currentSection = sectionData.sections[sectionData.currentSectionIndex];
    const currentTask = currentSection?.tasks?.[currentTaskIndex];

    const [taskData, setTaskData] = useState({
      name: currentTask?.name || '',
      description: currentTask?.description || '',
      hint: currentTask?.hint || '',
      image: currentTask?.image || null,
      imagePreview: currentTask?.imagePreview || ''
    });

    useEffect(() => {
      if (currentTask) {
        setTaskData({
          name: currentTask.name || '',
          description: currentTask.description || '',
          hint: currentTask.hint || '',
          image: currentTask.image || null,
          imagePreview: currentTask.imagePreview || ''
        });
      }
    }, [currentTask]);

    const handleImageChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setTaskData(prev => ({
            ...prev,
            image: file,
            imagePreview: reader.result
          }));
        };
        reader.readAsDataURL(file);
      }
    };

    const handleSaveAssignment = async () => {
      if (!taskData.name || !taskData.description) {
        setStatusMessage('Заполните название и описание задания');
        setTimeout(() => setStatusMessage(''), 3000);
        return;
      }

      setIsLoading(true);
      setStatusMessage('Создание задания...');

      try {
        const chapterId = currentSection.id;

        const token = authService.getToken();
        const formData = new FormData();
        formData.append('Name', taskData.name);
        formData.append('Description', taskData.description);

        if (taskData.hint) {
          formData.append('Hint', taskData.hint);
        }

        if (taskData.image) {
          formData.append('TitleImage', taskData.image);
        }

        const headers = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`/api/v1/TasksCreators?ChapterId=${chapterId}`, {
          method: 'POST',
          headers: headers,
          body: formData,
          credentials: 'include'
        });

        const responseText = await response.text();
        console.log('Ответ сервера:', response.status, responseText);

        if (response.status === 401) {
          authService.logout();
          alert('Сессия истекла. Пожалуйста, войдите заново.');
          navigate('/');
          return;
        }

        if (!response.ok) {
          throw new Error(`Ошибка создания задания (${response.status})`);
        }

        const taskId = responseText.replace(/["'\s]/g, '').trim();
        console.log('Задание создано, ID:', taskId);

        const updatedSections = [...sectionData.sections];
        updatedSections[sectionData.currentSectionIndex].tasks[currentTaskIndex] = {
          ...updatedSections[sectionData.currentSectionIndex].tasks[currentTaskIndex],
          id: taskId,
          name: taskData.name,
          description: taskData.description,
          hint: taskData.hint,
          image: taskData.image,
          imagePreview: taskData.imagePreview
        };

        setSectionData(prev => ({
          ...prev,
          sections: updatedSections
        }));

        setStatusMessage('Задание сохранено на сервере!');
        setCurrentStep('answers');

      } catch (error) {
        console.error('Ошибка создания задания:', error);
        setStatusMessage(`Ошибка: ${error.message}`);
        setTimeout(() => setStatusMessage(''), 5000);
      } finally {
        setIsLoading(false);
      }
    };

    return (
        <div className="builder-step">
          <h2>Конструктор заданий</h2>
          {statusMessage && <div className="status-message">{statusMessage}</div>}
          <p className="step-info">
            Раздел {sectionData.currentSectionIndex + 1}: <strong>{currentSection?.name}</strong> |
            Задание {currentTaskIndex + 1} из {currentSection?.tasks?.length}
          </p>

          <div className="task-form">
            <div className="form-group">
              <label>Название задания *</label>
              <input
                  type="text"
                  value={taskData.name}
                  onChange={(e) => setTaskData(prev => ({...prev, name: e.target.value}))}
                  placeholder="Введите название задания"
                  disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label>Описание задания *</label>
              <textarea
                  value={taskData.description}
                  onChange={(e) => setTaskData(prev => ({...prev, description: e.target.value}))}
                  placeholder="Опишите задание..."
                  rows="4"
                  disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label>Изображение</label>
              <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isLoading}
              />
              {taskData.imagePreview && (
                  <div style={{ marginTop: '10px' }}>
                    <img
                        src={taskData.imagePreview}
                        alt="Предпросмотр"
                        style={{ maxWidth: '200px', maxHeight: '150px', borderRadius: '8px', border: '1px solid #ddd' }}
                    />
                    <button
                        type="button"
                        onClick={() => setTaskData(prev => ({ ...prev, image: null, imagePreview: '' }))}
                        style={{
                          display: 'block',
                          marginTop: '5px',
                          background: '#dc3545',
                          color: 'white',
                          border: 'none',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                    >
                      Удалить
                    </button>
                  </div>
              )}
            </div>

            <div className="form-group">
              <label>Подсказка</label>
              <textarea
                  value={taskData.hint}
                  onChange={(e) => setTaskData(prev => ({...prev, hint: e.target.value}))}
                  placeholder="Добавьте подсказку для решения задания..."
                  rows="2"
                  disabled={isLoading}
                  style={{ resize: 'vertical' }}
              />
            </div>

            <div className="navigation-buttons">
              <button
                  className="btn-back"
                  onClick={handleGoBack}
                  disabled={isLoading}
              >
                ← Назад
              </button>
              <button
                  className="next-btn green-btn"
                  onClick={handleSaveAssignment}
                  disabled={!taskData.name || !taskData.description || isLoading}
              >
                {isLoading ? 'Создание...' : 'Далее →'}
              </button>
            </div>
          </div>
        </div>
    );
  };

  // AnswersBuilder
  const AnswersBuilder = () => {
    const currentSection = sectionData.sections[sectionData.currentSectionIndex];
    const currentTask = currentSection?.tasks?.[currentTaskIndex];

    const [answers, setAnswers] = useState(currentTask?.answers || ['', '', '', '']);
    const [correctAnswerIndex, setCorrectAnswerIndex] = useState(currentTask?.correctAnswerIndex || 0);

    useEffect(() => {
      if (currentTask) {
        setAnswers(currentTask.answers || ['', '', '', '']);
        setCorrectAnswerIndex(currentTask.correctAnswerIndex || 0);
      }
    }, [currentTask]);

    const createQuestion = async (taskId, questionName, isCorrect) => {
      const apiUrl = `/api/v1/Questions?TaskCreatorId=${encodeURIComponent(taskId)}`;

      const requestData = {
        name: questionName,
        answer: isCorrect
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'text/plain'
        },
        body: JSON.stringify(requestData)
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(`Ошибка создания вопроса (${response.status})`);
      }

      return responseText.replace(/["'\s]/g, '').trim();
    };

    const handleSaveAnswers = async () => {
      if (answers.some(answer => !answer.trim())) {
        setStatusMessage('Заполните все варианты ответов');
        setTimeout(() => setStatusMessage(''), 3000);
        return;
      }

      setIsLoading(true);
      setStatusMessage('Сохранение ответов...');

      try {
        const taskId = currentTask.id;

        const token = authService.getToken();
        const headers = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const questions = [];

        for (let i = 0; i < answers.length; i++) {
          const questionName = answers[i];
          const isCorrect = i === correctAnswerIndex;

          try {
            const questionId = await createQuestion(taskId, questionName, isCorrect);

            questions.push({
              id: questionId,
              name: questionName,
              answer: isCorrect
            });

            console.log(`Вопрос ${i + 1} создан, ID:`, questionId);
          } catch (error) {
            console.error(`Ошибка создания вопроса ${i + 1}:`, error);
            throw error;
          }
        }

        const updatedSections = [...sectionData.sections];
        updatedSections[sectionData.currentSectionIndex].tasks[currentTaskIndex] = {
          ...updatedSections[sectionData.currentSectionIndex].tasks[currentTaskIndex],
          answers: answers,
          correctAnswerIndex: correctAnswerIndex,
          questions: questions,
          hasQuestions: true
        };

        setSectionData(prev => ({
          ...prev,
          sections: updatedSections
        }));

        setStatusMessage('Все ответы успешно сохранены на сервере!');

        if (currentTaskIndex < currentSection.tasks.length - 1) {
          setCurrentTaskIndex(currentTaskIndex + 1);
          setCurrentStep('assignment');
          setStatusMessage(`Переход к заданию ${currentTaskIndex + 2}...`);
        } else {
          handleNextSectionOrFinish();
        }

      } catch (error) {
        console.error('Ошибка сохранения ответов:', error);
        setStatusMessage(`Ошибка: ${error.message}`);
        setTimeout(() => setStatusMessage(''), 5000);
      } finally {
        setIsLoading(false);
      }
    };

    return (
        <div className="builder-step">
          <h2>Конструктор ответов</h2>
          {statusMessage && <div className="status-message">{statusMessage}</div>}
          <p className="step-info">
            Раздел {sectionData.currentSectionIndex + 1}: <strong>{currentSection?.name}</strong> |
            Задание {currentTaskIndex + 1} из {currentSection?.tasks?.length}
          </p>

          <div className="current-task-info">
            <h3>Задание: {currentTask?.name}</h3>
            <p className="task-description-preview">{currentTask?.description}</p>
            {currentTask?.hint && (
                <p className="task-hint-preview">💡 Подсказка: {currentTask.hint}</p>
            )}
            {currentTask?.imagePreview && (
                <div style={{ marginTop: '10px' }}>
                  <img
                      src={currentTask.imagePreview}
                      alt="Изображение задания"
                      style={{ maxWidth: '200px', maxHeight: '150px', borderRadius: '8px' }}
                  />
                </div>
            )}
          </div>

          <div className="answers-container">
            <h3>Добавьте варианты ответов</h3>
            <p className="hint">Отметьте правильный ответ (может быть только один)</p>

            {answers.map((answer, index) => (
                <div key={index} className="answer-item-vertical">
                  <div className="answer-header-vertical">
                    <div className="answer-top-row">
                      <label className="answer-label-vertical">{index + 1} *</label>
                      <div className="correct-radio-container-vertical">
                        <input
                            type="radio"
                            name="correctAnswer"
                            checked={correctAnswerIndex === index}
                            onChange={() => setCorrectAnswerIndex(index)}
                            id={`answer-${index}`}
                            className="correct-radio-vertical"
                            disabled={isLoading}
                        />
                        <label
                            htmlFor={`answer-${index}`}
                            className="correct-label-vertical"
                        >
                          Правильный ответ
                        </label>
                      </div>
                    </div>
                  </div>
                  <textarea
                      value={answer}
                      onChange={(e) => {
                        const newAnswers = [...answers];
                        newAnswers[index] = e.target.value;
                        setAnswers(newAnswers);
                      }}
                      placeholder={`Введите текст ответа ${index + 1} здесь...`}
                      className="answer-textarea"
                      disabled={isLoading}
                      rows="4"
                  />
                </div>
            ))}
          </div>

          <div className="navigation-buttons">
            <button
                className="btn-back"
                onClick={handleGoBack}
                disabled={isLoading}
            >
              ← Назад
            </button>
            <button
                className="next-btn green-btn"
                onClick={handleSaveAnswers}
                disabled={answers.some(answer => !answer.trim()) || isLoading}
            >
              {isLoading ? 'Сохранение...' :
                  currentTaskIndex < currentSection.tasks.length - 1
                      ? 'Далее → Следующее задание'
                      : sectionData.currentSectionIndex < sectionData.totalSections - 1
                          ? 'Далее → Следующий раздел'
                          : 'Далее → Завершить курс'}
            </button>
          </div>
        </div>
    );
  };

  if (!course) {
    return (
        <div className="loading-container">
          <p>Загрузка курса...</p>
        </div>
    );
  }

  return (
      <div className="course-builder">
        <header className="builder-header">
          <h1>Конструктор курса: {course.title}</h1>
          <div className="progress">
            {currentStep === 'section-details' && `Раздел ${sectionData.currentSectionIndex + 1} из ${sectionData.totalSections}`}
            {currentStep === 'theory' && `Теория для раздела ${sectionData.currentSectionIndex + 1}`}
            {currentStep === 'assignment' && `Задания для раздела ${sectionData.currentSectionIndex + 1}`}
            {currentStep === 'answers' && `Ответы для раздела ${sectionData.currentSectionIndex + 1}`}
          </div>
        </header>

        <div className="builder-content-centered">
          {currentStep === 'section-details' && <SectionDetailsBuilder />}
          {currentStep === 'theory' && <TheoryBuilder />}
          {currentStep === 'assignment' && <AssignmentBuilder />}
          {currentStep === 'answers' && <AnswersBuilder />}
        </div>

        {/* Модальное окно подтверждения */}
        {showConfirmModal && (
            <div className="confirm-modal-overlay" onClick={handleCancelConfirm}>
              <div className="confirm-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="confirm-icon">⚠️</div>
                <p className="confirm-message">{confirmMessage}</p>
                <div className="confirm-buttons">
                  <button className="confirm-cancel" onClick={handleCancelConfirm}>Отмена</button>
                  <button className="confirm-ok" onClick={handleConfirm}>Да, продолжить</button>
                </div>
              </div>
            </div>
        )}
      </div>
  );
}

export default CourseBuilder;