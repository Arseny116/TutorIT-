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
  const [isEditMode, setIsEditMode] = useState(false);

  const [isCourseFullyCompleted, setIsCourseFullyCompleted] = useState(false);

  const [currentStep, setCurrentStep] = useState('section-details');
  const [sectionData, setSectionData] = useState({
    totalSections: 0,
    currentSectionIndex: 0,
    sections: []
  });

  const [currentTheoryIndex, setCurrentTheoryIndex] = useState(0);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);

  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('error');

  const [showExitWarning, setShowExitWarning] = useState(false);

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

  const showNotificationMessage = (message, type = 'error') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 4000);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    return `http://89.110.94.112:8080/${imagePath}`;
  };

  const checkIfCourseFullyCompleted = (sections) => {
    if (!sections || sections.length === 0) return false;
    return sections.every(section => section.id !== null);
  };

  const handleBeforeUnload = (e) => {
    if (!isCourseFullyCompleted && !isEditMode) {
      e.preventDefault();
      e.returnValue = 'Вы не завершили создание курса. Уверены, что хотите уйти?';
      return e.returnValue;
    }
  };

  const handlePopState = (e) => {
    if (!isCourseFullyCompleted && !isEditMode) {
      setShowExitWarning(true);
      window.history.pushState(null, '', window.location.href);
    }
  };

  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isCourseFullyCompleted, isEditMode]);

  const confirmExit = () => {
    setShowExitWarning(false);
    navigate('/profile');
  };

  const cancelExit = () => {
    setShowExitWarning(false);
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

          const chaptersResponse = await fetch(`/api/v1/Chapters/${cleanedCourseId}`, {
            method: 'GET',
            headers: headers,
            credentials: 'include'
          });

          if (chaptersResponse.ok) {
            let chaptersData = await chaptersResponse.json();
            let chapters = Array.isArray(chaptersData) ? chaptersData : (chaptersData.$values || chaptersData);

            if (chapters && chapters.length > 0) {
              setIsEditMode(true);
              console.log('Режим редактирования: найдено разделов:', chapters.length);

              const loadedSections = [];

              for (const chapter of chapters) {
                const chapterId = chapter.id || chapter.$id;

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

                    theoriesArray = theories.map((theory, idx) => ({
                      id: theory.id || theory.$id,
                      name: theory.name || `Теория ${idx + 1}`,
                      article: theory.article || '',
                      image: null,
                      imagePreview: theory.titleImage ? getImageUrl(theory.titleImage) : '',
                      index: idx
                    }));
                  }
                } catch (err) {
                  console.error('Ошибка загрузки теорий:', err);
                }

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
                      let questions = [];

                      try {
                        const questionsResponse = await fetch(`/api/v1/Questions?TaskCreater=${task.id}`, {
                          method: 'GET',
                          headers: headers,
                          credentials: 'include'
                        });

                        if (questionsResponse.ok) {
                          let questionsData = await questionsResponse.json();
                          let questionsList = Array.isArray(questionsData) ? questionsData : (questionsData.$values || []);

                          questions = questionsList.map((q, idx) => ({
                            id: q.id || q.$id,
                            name: q.name,
                            answer: q.answer
                          }));

                          answers = questionsList.map(q => q.name);
                          correctAnswerIndex = questionsList.findIndex(q => q.answer === true);
                          if (correctAnswerIndex === -1) correctAnswerIndex = 0;
                        }
                      } catch (err) {
                        console.error('Ошибка загрузки вопросов:', err);
                      }

                      tasksArray.push({
                        id: task.id || task.$id,
                        name: task.name || `Задание ${tasksArray.length + 1}`,
                        description: task.description || '',
                        hint: task.hint || '',
                        image: null,
                        imagePreview: task.titleImage ? getImageUrl(task.titleImage) : '',
                        index: tasksArray.length,
                        answers: answers,
                        correctAnswerIndex: correctAnswerIndex,
                        questions: questions
                      });
                    }
                  }
                } catch (err) {
                  console.error('Ошибка загрузки заданий:', err);
                }

                loadedSections.push({
                  id: chapterId,
                  name: chapter.name || `Раздел ${loadedSections.length + 1}`,
                  description: chapter.description || '',
                  numberTheoryBloks: theoriesArray.length,
                  numberTasks: tasksArray.length,
                  theory: theoriesArray,
                  tasks: tasksArray,
                  sectionNumber: loadedSections.length + 1
                });
              }

              for (let i = loadedSections.length; i < totalSections; i++) {
                loadedSections.push({
                  id: null,
                  name: '',
                  description: '',
                  numberTheoryBloks: 0,
                  numberTasks: 0,
                  theory: [],
                  tasks: [],
                  sectionNumber: i + 1
                });
              }

              setSectionData({
                totalSections: totalSections,
                currentSectionIndex: 0,
                sections: loadedSections
              });

              setIsCourseFullyCompleted(checkIfCourseFullyCompleted(loadedSections));

              return;
            }
          }

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

          setIsCourseFullyCompleted(false);

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

  const handleSimpleBack = () => {
    switch (currentStep) {
      case 'theory':
        if (currentTheoryIndex > 0) {
          setCurrentTheoryIndex(currentTheoryIndex - 1);
        } else {
          setCurrentStep('section-details');
        }
        break;

      case 'assignment':
        if (currentTaskIndex > 0) {
          setCurrentTaskIndex(currentTaskIndex - 1);
        } else if (sectionData.sections[sectionData.currentSectionIndex]?.theory?.length > 0) {
          setCurrentStep('theory');
          setCurrentTheoryIndex(sectionData.sections[sectionData.currentSectionIndex].theory.length - 1);
        } else {
          setCurrentStep('section-details');
        }
        break;

      case 'answers':
        setCurrentStep('assignment');
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
      setIsCourseFullyCompleted(true);
      setStatusMessage('Все разделы созданы! Перенаправление на главную...');
      setTimeout(() => navigate('/'), 2000);
    }
  };

  // SectionDetailsBuilder
  const SectionDetailsBuilder = () => {
    const currentSection = sectionData.sections[sectionData.currentSectionIndex];

    const [localSectionData, setLocalSectionData] = useState({
      name: currentSection?.name || '',
      description: currentSection?.description || '',
      numberTheoryBloks: currentSection?.numberTheoryBloks || 0,
      numberTasks: currentSection?.numberTasks || 0
    });

    const [errors, setErrors] = useState({
      name: '',
      description: '',
      numberTheoryBloks: '',
      numberTasks: ''
    });

    useEffect(() => {
      if (currentSection) {
        setLocalSectionData({
          name: currentSection.name || '',
          description: currentSection.description || '',
          numberTheoryBloks: currentSection.numberTheoryBloks || 0,
          numberTasks: currentSection.numberTasks || 0
        });
      }
    }, [currentSection]);

    const isFormValid = () => {
      return localSectionData.name.trim() !== '' &&
          localSectionData.name.length <= 50 &&
          localSectionData.description.trim() !== '';
    };

    const validateForm = () => {
      let isValid = true;
      const newErrors = { name: '', description: '', numberTheoryBloks: '', numberTasks: '' };

      if (!localSectionData.name.trim()) {
        newErrors.name = 'Название раздела обязательно';
        isValid = false;
      } else if (localSectionData.name.length > 50) {
        newErrors.name = 'Название не должно превышать 50 символов';
        isValid = false;
      }

      if (!localSectionData.description.trim()) {
        newErrors.description = 'Описание раздела обязательно';
        isValid = false;
      }

      setErrors(newErrors);
      return isValid;
    };

    const handleSaveSectionDetails = async () => {
      if (!validateForm()) {
        setStatusMessage('Заполните все поля корректно');
        setTimeout(() => setStatusMessage(''), 3000);
        return;
      }

      setIsLoading(true);
      setDebugInfo('Сохранение раздела...');
      setStatusMessage('Сохранение раздела...');

      try {
        if (!cleanedCourseId) {
          throw new Error('CourseId не определен');
        }

        const token = authService.getToken();
        const headers = {
          'Content-Type': 'application/json',
          'accept': 'text/plain'
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        let chapterId = currentSection?.id;
        let response;

        if (chapterId && isEditMode) {
          const updateData = {
            id: chapterId,
            name: localSectionData.name,
            description: localSectionData.description,
            numberTheoryBloks: parseInt(localSectionData.numberTheoryBloks) || 0,
            numberTasks: parseInt(localSectionData.numberTasks) || 0
          };

          response = await fetch(`/api/v1/Chapters/${chapterId}`, {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify(updateData),
            credentials: 'include'
          });
        } else {
          const requestData = {
            name: localSectionData.name,
            description: localSectionData.description,
            numberTheoryBloks: parseInt(localSectionData.numberTheoryBloks) || 0,
            numberTasks: parseInt(localSectionData.numberTasks) || 0
          };

          response = await fetch(`/api/v1/Chapters/${cleanedCourseId}`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestData),
            credentials: 'include'
          });
        }

        const responseText = await response.text();
        console.log('Ответ сервера:', response.status, responseText);

        if (response.status === 401) {
          authService.logout();
          alert('Сессия истекла. Пожалуйста, войдите заново.');
          navigate('/');
          return;
        }

        if (!response.ok) {
          throw new Error(`Ошибка сохранения раздела (${response.status})`);
        }

        if (!chapterId) {
          chapterId = responseText.replace(/["'\s]/g, '').trim();
        }

        const theoryArray = Array.from({ length: localSectionData.numberTheoryBloks }, (_, i) => {
          const existingTheory = currentSection?.theory?.[i];
          return {
            id: existingTheory?.id || null,
            name: existingTheory?.name || '',
            article: existingTheory?.article || '',
            image: null,
            imagePreview: existingTheory?.imagePreview || '',
            index: i
          };
        });

        const tasksArray = Array.from({ length: localSectionData.numberTasks }, (_, i) => {
          const existingTask = currentSection?.tasks?.[i];
          return {
            id: existingTask?.id || null,
            name: existingTask?.name || '',
            description: existingTask?.description || '',
            hint: existingTask?.hint || '',
            image: null,
            imagePreview: existingTask?.imagePreview || '',
            index: i,
            answers: existingTask?.answers || ['', '', '', ''],
            correctAnswerIndex: existingTask?.correctAnswerIndex || 0,
            questions: existingTask?.questions || []
          };
        });

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

        setStatusMessage(`Раздел "${localSectionData.name}" успешно сохранен!`);

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
        console.error('Ошибка сохранения раздела:', error);
        setDebugInfo(`Ошибка: ${error.message}`);
        setStatusMessage(`Ошибка сохранения раздела: ${error.message}`);
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
            <label>Название раздела * (макс. 50 символов)</label>
            <input
                type="text"
                value={localSectionData.name}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 50) {
                    setLocalSectionData(prev => ({...prev, name: value}));
                    setErrors(prev => ({...prev, name: ''}));
                  } else {
                    setErrors(prev => ({...prev, name: 'Название не должно превышать 50 символов'}));
                  }
                }}
                placeholder="Введите название раздела"
                disabled={isLoading}
                className={errors.name ? 'error-input' : ''}
            />
            <div className="char-counter">
              {localSectionData.name.length}/50 символов
            </div>
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label>Описание раздела *</label>
            <textarea
                value={localSectionData.description}
                onChange={(e) => setLocalSectionData(prev => ({...prev, description: e.target.value}))}
                placeholder="Опишите содержание раздела"
                rows="3"
                disabled={isLoading}
                className={errors.description ? 'error-input' : ''}
            />
            {errors.description && <span className="error-text">{errors.description}</span>}
          </div>

          <div className="counters-row">
            <div className="form-group">
              <label>Количество блоков теории</label>
              <input
                  type="number"
                  value={localSectionData.numberTheoryBloks}
                  onChange={(e) => setLocalSectionData(prev => ({...prev, numberTheoryBloks: parseInt(e.target.value) || 0}))}
                  min="0"
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
                  disabled={isLoading}
              />
            </div>
          </div>

          <div className="navigation-buttons">
            <button
                className="next-btn green-btn"
                onClick={handleSaveSectionDetails}
                disabled={!isFormValid() || isLoading}
            >
              {isLoading ? 'Сохранение...' : 'Далее →'}
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
      image: null,
      imagePreview: currentTheory?.imagePreview || ''
    });

    const [errors, setErrors] = useState({
      name: '',
      article: ''
    });

    useEffect(() => {
      if (currentTheory) {
        setTheoryData({
          name: currentTheory.name || '',
          article: currentTheory.article || '',
          image: null,
          imagePreview: currentTheory.imagePreview || ''
        });
      }
    }, [currentTheory]);

    const isFormValid = () => {
      return theoryData.name.trim() !== '' &&
          theoryData.name.length <= 50 &&
          theoryData.article.trim() !== '';
    };

    const validateForm = () => {
      let isValid = true;
      const newErrors = { name: '', article: '' };

      if (!theoryData.name.trim()) {
        newErrors.name = 'Название теории обязательно';
        isValid = false;
      } else if (theoryData.name.length > 50) {
        newErrors.name = 'Название не должно превышать 50 символов';
        isValid = false;
      }

      if (!theoryData.article.trim()) {
        newErrors.article = 'Содержание теории обязательно';
        isValid = false;
      }

      setErrors(newErrors);
      return isValid;
    };

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
      if (!validateForm()) {
        setStatusMessage('Заполните обязательные поля');
        setTimeout(() => setStatusMessage(''), 3000);
        return;
      }

      setIsLoading(true);
      setStatusMessage('Сохранение теории...');

      try {
        const chapterId = currentSection.id;
        const token = authService.getToken();
        const existingTheoryId = currentTheory?.id;

        let response;
        let theoryId = existingTheoryId;

        // Для существующей теории (редактирование) - отправляем JSON
        if (existingTheoryId && isEditMode) {
          const theoryDataJson = {
            id: existingTheoryId,
            name: theoryData.name,
            article: theoryData.article,
            chapterId: chapterId
          };

          const headers = {
            'Content-Type': 'application/json',
            'accept': 'text/plain'
          };
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }

          console.log('Обновление теории (JSON):', theoryDataJson);

          response = await fetch(`/api/v1/Theories/${existingTheoryId}`, {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify(theoryDataJson),
            credentials: 'include'
          });
        }
        // Для новой теории - отправляем FormData
        else {
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

          console.log('Создание теории (FormData)');

          response = await fetch(`/api/v1/Theories?ChapterId=${chapterId}`, {
            method: 'POST',
            headers: headers,
            body: formData,
            credentials: 'include'
          });
        }

        const responseText = await response.text();
        console.log('Ответ сервера:', response.status, responseText);

        if (response.status === 401) {
          authService.logout();
          alert('Сессия истекла. Пожалуйста, войдите заново.');
          navigate('/');
          return;
        }

        if (!response.ok) {
          throw new Error(`Ошибка сохранения теории (${response.status}): ${responseText}`);
        }

        if (!existingTheoryId) {
          theoryId = responseText.replace(/["'\s]/g, '').trim();
        }

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

        setStatusMessage('Теория сохранена!');

        if (currentTheoryIndex < currentSection.theory.length - 1) {
          setCurrentTheoryIndex(currentTheoryIndex + 1);
          setTheoryData({ name: '', article: '', image: null, imagePreview: '' });
          setErrors({ name: '', article: '' });
          setStatusMessage(`Переход к блоку теории ${currentTheoryIndex + 2}...`);
        } else if (currentSection.numberTasks > 0) {
          setCurrentTaskIndex(0);
          setCurrentStep('assignment');
          setStatusMessage('Переход к конструктору заданий...');
        } else {
          handleNextSectionOrFinish();
        }

      } catch (error) {
        console.error('Ошибка сохранения теории:', error);
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
            <label>Название теории * (макс. 50 символов)</label>
            <input
                type="text"
                value={theoryData.name}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 50) {
                    setTheoryData(prev => ({...prev, name: value}));
                    setErrors(prev => ({...prev, name: ''}));
                  } else {
                    setErrors(prev => ({...prev, name: 'Название не должно превышать 50 символов'}));
                  }
                }}
                placeholder="Введите название теории"
                disabled={isLoading}
                className={errors.name ? 'error-input' : ''}
            />
            <div className="char-counter">
              {theoryData.name.length}/50 символов
            </div>
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label>Изображение (необязательно)</label>
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
                className={errors.article ? 'error-input' : ''}
            />
            {errors.article && <span className="error-text">{errors.article}</span>}
          </div>

          <div className="navigation-buttons">
            <button className="btn-back" onClick={handleSimpleBack} disabled={isLoading}>
              ← Назад
            </button>
            <button
                className="next-btn green-btn"
                onClick={handleSaveTheory}
                disabled={!isFormValid() || isLoading}
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
      image: null,
      imagePreview: currentTask?.imagePreview || ''
    });

    const [errors, setErrors] = useState({
      name: '',
      description: '',
      hint: ''
    });

    useEffect(() => {
      if (currentTask) {
        setTaskData({
          name: currentTask.name || '',
          description: currentTask.description || '',
          hint: currentTask.hint || '',
          image: null,
          imagePreview: currentTask.imagePreview || ''
        });
      }
    }, [currentTask]);

    const isFormValid = () => {
      return taskData.name.trim() !== '' &&
          taskData.name.length <= 50 &&
          taskData.description.trim() !== '' &&
          taskData.hint.trim() !== '' &&
          taskData.hint.length <= 100;
    };

    const validateForm = () => {
      let isValid = true;
      const newErrors = { name: '', description: '', hint: '' };

      if (!taskData.name.trim()) {
        newErrors.name = 'Название задания обязательно';
        isValid = false;
      } else if (taskData.name.length > 50) {
        newErrors.name = 'Название не должно превышать 50 символов';
        isValid = false;
      }

      if (!taskData.description.trim()) {
        newErrors.description = 'Описание задания обязательно';
        isValid = false;
      }

      if (!taskData.hint.trim()) {
        newErrors.hint = 'Подсказка обязательна для заполнения';
        isValid = false;
      } else if (taskData.hint.length > 100) {
        newErrors.hint = 'Подсказка не должна превышать 100 символов';
        isValid = false;
      }

      setErrors(newErrors);
      return isValid;
    };

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
      if (!validateForm()) {
        setStatusMessage('Заполните все обязательные поля');
        setTimeout(() => setStatusMessage(''), 3000);
        return;
      }

      setIsLoading(true);
      setStatusMessage('Сохранение задания...');

      try {
        const chapterId = currentSection.id;
        const token = authService.getToken();
        const existingTaskId = currentTask?.id;

        let response;
        let taskId = existingTaskId;

        // Для существующего задания (редактирование) - отправляем JSON
        if (existingTaskId && isEditMode) {
          const taskDataJson = {
            id: existingTaskId,
            name: taskData.name,
            description: taskData.description,
            hint: taskData.hint,
            chapterCreatorId: chapterId
          };

          const headers = {
            'Content-Type': 'application/json',
            'accept': 'text/plain'
          };
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }

          console.log('Обновление задания (JSON):', taskDataJson);

          response = await fetch(`/api/v1/TasksCreators/${existingTaskId}`, {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify(taskDataJson),
            credentials: 'include'
          });
        }
        // Для нового задания - отправляем FormData
        else {
          const formData = new FormData();
          formData.append('Name', taskData.name);
          formData.append('Description', taskData.description);
          formData.append('Hint', taskData.hint);
          if (taskData.image) {
            formData.append('TitleImage', taskData.image);
          }

          const headers = {};
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }

          console.log('Создание задания (FormData)');

          response = await fetch(`/api/v1/TasksCreators?ChapterId=${chapterId}`, {
            method: 'POST',
            headers: headers,
            body: formData,
            credentials: 'include'
          });
        }

        const responseText = await response.text();
        console.log('Ответ сервера:', response.status, responseText);

        if (response.status === 401) {
          authService.logout();
          alert('Сессия истекла. Пожалуйста, войдите заново.');
          navigate('/');
          return;
        }

        if (!response.ok) {
          throw new Error(`Ошибка сохранения задания (${response.status}): ${responseText}`);
        }

        if (!existingTaskId) {
          taskId = responseText.replace(/["'\s]/g, '').trim();
        }

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

        setStatusMessage('Задание сохранено!');
        setCurrentStep('answers');

      } catch (error) {
        console.error('Ошибка сохранения задания:', error);
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
              <label>Название задания * (макс. 50 символов)</label>
              <input
                  type="text"
                  value={taskData.name}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 50) {
                      setTaskData(prev => ({...prev, name: value}));
                      setErrors(prev => ({...prev, name: ''}));
                    } else {
                      setErrors(prev => ({...prev, name: 'Название не должно превышать 50 символов'}));
                    }
                  }}
                  placeholder="Введите название задания"
                  disabled={isLoading}
                  className={errors.name ? 'error-input' : ''}
              />
              <div className="char-counter">
                {taskData.name.length}/50 символов
              </div>
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label>Описание задания *</label>
              <textarea
                  value={taskData.description}
                  onChange={(e) => setTaskData(prev => ({...prev, description: e.target.value}))}
                  placeholder="Опишите задание..."
                  rows="4"
                  disabled={isLoading}
                  className={errors.description ? 'error-input' : ''}
              />
              {errors.description && <span className="error-text">{errors.description}</span>}
            </div>

            <div className="form-group">
              <label>Изображение (необязательно)</label>
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
              <label>Подсказка * (макс. 100 символов)</label>
              <textarea
                  value={taskData.hint}
                  onChange={(e) => setTaskData(prev => ({...prev, hint: e.target.value}))}
                  placeholder="Добавьте подсказку для решения задания..."
                  rows="2"
                  disabled={isLoading}
                  style={{ resize: 'vertical' }}
                  className={errors.hint ? 'error-input' : ''}
              />
              <div className="char-counter">
                {taskData.hint.length}/100 символов
              </div>
              {errors.hint && <span className="error-text">{errors.hint}</span>}
            </div>

            <div className="navigation-buttons">
              <button className="btn-back" onClick={handleSimpleBack} disabled={isLoading}>
                ← Назад
              </button>
              <button
                  className="next-btn green-btn"
                  onClick={handleSaveAssignment}
                  disabled={!isFormValid() || isLoading}
              >
                {isLoading ? 'Сохранение...' : 'Далее →'}
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
    const [errors, setErrors] = useState({});

    useEffect(() => {
      if (currentTask) {
        setAnswers(currentTask.answers || ['', '', '', '']);
        setCorrectAnswerIndex(currentTask.correctAnswerIndex || 0);
      }
    }, [currentTask]);

    const isFormValid = () => {
      return answers.every(answer => answer.trim() !== '');
    };

    const validateAnswers = () => {
      const newErrors = {};
      let isValid = true;

      answers.forEach((answer, index) => {
        if (!answer.trim()) {
          newErrors[`answer_${index}`] = `Вариант ответа ${index + 1} обязателен`;
          isValid = false;
        }
      });

      const lowerAnswers = answers.map(a => a.trim().toLowerCase());
      const duplicates = lowerAnswers.filter((item, index) => lowerAnswers.indexOf(item) !== index);
      if (duplicates.length > 0) {
        const duplicateValues = [...new Set(duplicates)];
        newErrors.duplicates = `Варианты ответов не должны повторяться: "${duplicateValues.join('", "')}"`;
        isValid = false;
      }

      setErrors(newErrors);
      return isValid;
    };

    const createOrUpdateQuestion = async (taskId, questionId, questionName, isCorrect) => {
      const token = authService.getToken();
      const headers = {
        'Content-Type': 'application/json',
        'accept': 'text/plain'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const requestData = {
        name: questionName,
        answer: isCorrect
      };

      let url, method;
      if (questionId && isEditMode) {
        url = `/api/v1/Questions/${questionId}`;
        method = 'PUT';
      } else {
        url = `/api/v1/Questions?TaskCreatorId=${taskId}`;
        method = 'POST';
      }

      const response = await fetch(url, {
        method: method,
        headers: headers,
        body: JSON.stringify(requestData),
        credentials: 'include'
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(`Ошибка ${method === 'PUT' ? 'обновления' : 'создания'} вопроса (${response.status}): ${responseText}`);
      }

      return questionId || responseText.replace(/["'\s]/g, '').trim();
    };

    const deleteQuestion = async (questionId) => {
      if (!questionId) return;

      const token = authService.getToken();
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      try {
        await fetch(`/api/v1/Questions/${questionId}`, {
          method: 'DELETE',
          headers: headers,
          credentials: 'include'
        });
      } catch (err) {
        console.warn('Ошибка удаления вопроса:', err);
      }
    };

    const handleSaveAnswers = async () => {
      if (!validateAnswers()) {
        showNotificationMessage('Заполните все варианты ответов и устраните дубликаты', 'warning');
        return;
      }

      setIsLoading(true);
      setStatusMessage('Сохранение ответов...');

      try {
        const taskId = currentTask.id;
        const existingQuestions = currentTask?.questions || [];

        for (const existingQuestion of existingQuestions) {
          await deleteQuestion(existingQuestion.id);
        }

        const questions = [];

        for (let i = 0; i < answers.length; i++) {
          const questionName = answers[i];
          const isCorrect = i === correctAnswerIndex;

          const questionId = await createOrUpdateQuestion(taskId, null, questionName, isCorrect);

          questions.push({
            id: questionId,
            name: questionName,
            answer: isCorrect
          });

          console.log(`Вопрос ${i + 1} сохранен, ID:`, questionId);
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

        showNotificationMessage('Все ответы успешно сохранены!', 'success');

        if (currentTaskIndex < currentSection.tasks.length - 1) {
          setCurrentTaskIndex(currentTaskIndex + 1);
          setCurrentStep('assignment');
          setStatusMessage(`Переход к заданию ${currentTaskIndex + 2}...`);
        } else {
          handleNextSectionOrFinish();
        }

      } catch (error) {
        console.error('Ошибка сохранения ответов:', error);
        showNotificationMessage(`Ошибка: ${error.message}`, 'error');
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
            <h3>Добавьте варианты ответов *</h3>
            <p className="hint">Отметьте правильный ответ (может быть только один)</p>

            <p style={{ color: '#ff9800', fontSize: '12px', marginBottom: '15px' }}>
              ⚠️ Все варианты ответов обязательны для заполнения и должны быть уникальными
            </p>

            {errors.duplicates && (
                <div className="error-message" style={{ marginBottom: '15px' }}>
                  {errors.duplicates}
                </div>
            )}

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
                        <label htmlFor={`answer-${index}`} className="correct-label-vertical">
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
                        setErrors(prev => ({ ...prev, [`answer_${index}`]: '' }));
                      }}
                      placeholder={`Введите текст ответа ${index + 1} здесь...`}
                      className={`answer-textarea ${errors[`answer_${index}`] ? 'error-input' : ''}`}
                      disabled={isLoading}
                      rows="4"
                  />
                  {errors[`answer_${index}`] && (
                      <span className="error-text">{errors[`answer_${index}`]}</span>
                  )}
                </div>
            ))}
          </div>

          <div className="navigation-buttons">
            <button className="btn-back" onClick={handleSimpleBack} disabled={isLoading}>
              ← Назад
            </button>
            <button
                className="next-btn green-btn"
                onClick={handleSaveAnswers}
                disabled={!isFormValid() || isLoading}
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
          <h1>{isEditMode ? '✏️ Редактирование курса:' : '📝 Конструктор курса:'} {course.title}</h1>
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

        {showExitWarning && (
            <div className="confirm-modal-overlay" onClick={cancelExit}>
              <div className="confirm-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="confirm-icon">⚠️</div>
                <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Вы не завершили создание курса</h3>
                <p className="confirm-message">
                  Вы не сохранили все разделы курса. Если вы уйдете сейчас, курс останется незаполненным.
                </p>
                <p style={{ fontSize: '14px', color: '#28a745', marginBottom: '20px' }}>
                  Вы можете продолжить редактирование позже через личный кабинет.
                </p>
                <div className="confirm-buttons">
                  <button className="confirm-cancel" onClick={cancelExit}>
                    Продолжить редактирование
                  </button>
                  <button className="confirm-ok" onClick={confirmExit}>
                    Выйти
                  </button>
                </div>
              </div>
            </div>
        )}

        {showNotification && (
            <div className={`notification-toast ${notificationType}`}>
              <div className="notification-content">
            <span className="notification-icon">
              {notificationType === 'error' ? '⚠️' : notificationType === 'warning' ? 'ℹ️' : '✅'}
            </span>
                <span className="notification-text">{notificationMessage}</span>
              </div>
            </div>
        )}
      </div>
  );
}

export default CourseBuilder;