import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './CourseBuilder.css';

function CourseBuilder() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cleanedCourseId, setCleanedCourseId] = useState('');
  const [allChapters, setAllChapters] = useState([]);
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

  useEffect(() => {
    const fetchChaptersForCourse = async () => {
      if (!cleanedCourseId) return;
      
      try {
        const response = await fetch(`/api/v1/Chapters/${cleanedCourseId}`, {
          method: 'GET',
          headers: {
            'accept': 'text/plain'
          }
        });
        
        if (response.ok) {
          const chapters = await response.json();
          setAllChapters(chapters);
        } else {
          setAllChapters([]);
        }
      } catch (error) {
        setAllChapters([]);
      }
    };
    
    fetchChaptersForCourse();
  }, [cleanedCourseId]);

  useEffect(() => {
    if (courseId) {
      const cleanId = courseId.replace(/^["']+|["']+$/g, '').trim();
      setCleanedCourseId(cleanId);
    }
  }, [courseId]);

  useEffect(() => {
    if (!cleanedCourseId) return;

    const courses = JSON.parse(localStorage.getItem('tutorit-courses') || '[]');
    
    const foundCourse = courses.find(c => {
      const storedId = String(c.id).replace(/^["']+|["']+$/g, '').trim();
      return storedId === cleanedCourseId;
    });
    
    if (foundCourse) {
      const courseWithSections = {
        ...foundCourse,
        sectionsData: foundCourse.sectionsData || []
      };
      setCourse(courseWithSections);
      
      const totalSections = foundCourse.sections || foundCourse.chapters || 1;
      
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
          apiChapterId: null,
          name: '',
          description: '',
          numberTheoryBloks: 0,
          numberTasks: 0,
          theory: [],
          tasks: [],
          sectionNumber: i + 1,
          isFromAPI: false,
          isFallback: false,
          needsSync: false,
          createdAt: new Date().toISOString()
        }));
        
        setSectionData({
          totalSections: totalSections,
          currentSectionIndex: 0,
          sections: newSections
        });
      }
      
      setStatusMessage(`Курс "${foundCourse.title}" загружен. Создано ${totalSections} разделов.`);
      setTimeout(() => setStatusMessage(''), 3000);
      
    } else {
      navigate(`/course/${courseId}`);
    }
  }, [cleanedCourseId, courseId, navigate]);

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
          throw new Error(`Ошибка создания раздела (${response.status}): ${responseText}`);
        }

        let chapterId = responseText.replace(/["'\s]/g, '').trim();
        
        if (!chapterId || chapterId === '' || chapterId === 'OK' || chapterId === 'true' || 
            chapterId === cleanedCourseId || chapterId.length < 10) {
          
          setDebugInfo('Ищу созданный раздел на сервере...');
          setStatusMessage('Ищу созданный раздел на сервере...');
          
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const chaptersResponse = await fetch(`/api/v1/Chapters/${cleanedCourseId}`, {
            method: 'GET',
            headers: {
              'accept': 'text/plain'
            }
          });
          
          if (chaptersResponse.ok) {
            const chapters = await chaptersResponse.json();
            setAllChapters(chapters);
            
            const foundChapter = chapters.find(chapter => 
              chapter.name === localSectionData.name
            );
            
            if (foundChapter) {
              chapterId = foundChapter.id;
              setDebugInfo(`Раздел найден: ${chapterId}`);
              setStatusMessage(`Раздел найден: ${chapterId}`);
            } else {
              chapterId = `local-${Date.now()}`;
              setDebugInfo('Создаю локальную версию раздела');
              setStatusMessage('Создаю локальную версию раздела');
            }
          } else {
            chapterId = `local-${Date.now()}`;
            setDebugInfo('Не удалось получить список разделов');
            setStatusMessage('Не удалось получить список разделов');
          }
        }
        
        const theoryArray = Array.from({ length: localSectionData.numberTheoryBloks }, (_, i) => ({
          id: null,
          name: '',
          article: '',
          index: i,
          isFromAPI: false,
          isFallback: false,
          needsSync: false
        }));

        const tasksArray = Array.from({ length: localSectionData.numberTasks }, (_, i) => ({
          id: null,
          name: '',
          description: '',
          index: i,
          isFromAPI: false,
          isFallback: false,
          needsSync: false,
          answers: ['', '', '', ''],
          correctAnswerIndex: 0,
          questions: []
        }));

        const updatedSections = [...sectionData.sections];
        updatedSections[sectionData.currentSectionIndex] = {
          ...updatedSections[sectionData.currentSectionIndex],
          id: chapterId,
          apiChapterId: chapterId.startsWith('local-') ? null : chapterId,
          name: localSectionData.name,
          description: localSectionData.description,
          numberTheoryBloks: localSectionData.numberTheoryBloks,
          numberTasks: localSectionData.numberTasks,
          theory: theoryArray,
          tasks: tasksArray,
          isFromAPI: !chapterId.startsWith('local-'),
          isFallback: chapterId.startsWith('local-'),
          needsSync: chapterId.startsWith('local-')
        };

        setSectionData(prev => ({
          ...prev,
          sections: updatedSections
        }));

        const updatedCourse = {
          ...course,
          sectionsData: updatedSections
        };
        
        const courses = JSON.parse(localStorage.getItem('tutorit-courses') || '[]');
        const updatedCourses = courses.map(c => {
          const courseIdClean = String(c.id).replace(/^["']+|["']+$/g, '').trim();
          return courseIdClean === cleanedCourseId ? updatedCourse : c;
        });
        
        localStorage.setItem('tutorit-courses', JSON.stringify(updatedCourses));
        setCourse(updatedCourse);

        if (chapterId.startsWith('local-')) {
          setStatusMessage(`Раздел "${localSectionData.name}" создан локально.`);
        } else if (chapterId === cleanedCourseId) {
          setStatusMessage(`Внимание! ID раздела совпадает с ID курса.`);
        } else {
          setStatusMessage(`Раздел "${localSectionData.name}" успешно создан!`);
        }
        
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
        setDebugInfo(`Ошибка: ${error.message}`);
        setStatusMessage(`Ошибка создания раздела: ${error.message}`);
        setTimeout(() => setStatusMessage(''), 5000);
        
        const localChapterId = `local-${Date.now()}`;
        
        const theoryArray = Array.from({ length: localSectionData.numberTheoryBloks }, (_, i) => ({
          id: null,
          name: '',
          article: '',
          index: i,
          isFromAPI: false,
          isFallback: true,
          needsSync: true
        }));

        const tasksArray = Array.from({ length: localSectionData.numberTasks }, (_, i) => ({
          id: null,
          name: '',
          description: '',
          index: i,
          isFromAPI: false,
          isFallback: true,
          needsSync: true,
          answers: ['', '', '', ''],
          correctAnswerIndex: 0,
          questions: []
        }));

        const updatedSections = [...sectionData.sections];
        updatedSections[sectionData.currentSectionIndex] = {
          ...updatedSections[sectionData.currentSectionIndex],
          id: localChapterId,
          apiChapterId: null,
          name: localSectionData.name,
          description: localSectionData.description,
          numberTheoryBloks: localSectionData.numberTheoryBloks,
          numberTasks: localSectionData.numberTasks,
          theory: theoryArray,
          tasks: tasksArray,
          isFromAPI: false,
          isFallback: true,
          needsSync: true
        };

        setSectionData(prev => ({
          ...prev,
          sections: updatedSections
        }));

        const updatedCourse = {
          ...course,
          sectionsData: updatedSections
        };
        
        const courses = JSON.parse(localStorage.getItem('tutorit-courses') || '[]');
        const updatedCourses = courses.map(c => {
          const courseIdClean = String(c.id).replace(/^["']+|["']+$/g, '').trim();
          return courseIdClean === cleanedCourseId ? updatedCourse : c;
        });
        
        localStorage.setItem('tutorit-courses', JSON.stringify(updatedCourses));
        setCourse(updatedCourse);

        setStatusMessage(`Раздел "${localSectionData.name}" создан локально.`);
        
        if (localSectionData.numberTheoryBloks > 0) {
          setCurrentTheoryIndex(0);
          setCurrentStep('theory');
        } else if (localSectionData.numberTasks > 0) {
          setCurrentTaskIndex(0);
          setCurrentStep('assignment');
        } else {
          handleNextSectionOrFinish();
        }
      } finally {
        setIsLoading(false);
      }
    };

    const handleNextSectionOrFinish = () => {
      if (sectionData.currentSectionIndex < sectionData.totalSections - 1) {
        setSectionData(prev => ({
          ...prev,
          currentSectionIndex: prev.currentSectionIndex + 1
        }));
        setStatusMessage(`Переход к разделу ${sectionData.currentSectionIndex + 2}...`);
      } else {
        setStatusMessage('Все разделы созданы! Перенаправление на главную...');
        setTimeout(() => navigate('/'), 2000);
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
            {isLoading ? 'Создание...' : 
             localSectionData.numberTheoryBloks > 0 
               ? 'Дальше → Конструктор теории' 
               : localSectionData.numberTasks > 0
                 ? 'Дальше → Конструктор заданий'
                 : sectionData.currentSectionIndex < sectionData.totalSections - 1
                   ? 'Дальше → Конструктор теории'
                   : 'Дальше → Конструктор теории'}
          </button>
        </div>
      </div>
    );
  };

  const TheoryBuilder = () => {
    const currentSection = sectionData.sections[sectionData.currentSectionIndex];
    const currentTheory = currentSection?.theory?.[currentTheoryIndex];
    
    const [theoryData, setTheoryData] = useState({
      name: currentTheory?.name || '',
      article: currentTheory?.article || ''
    });

    useEffect(() => {
      if (currentTheory) {
        setTheoryData({
          name: currentTheory.name || '',
          article: currentTheory.article || ''
        });
      }
    }, [currentTheory]);

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
        
        let theoryId;
        let isLocalTheory = false;
        
        if (chapterId.startsWith('local-')) {
          theoryId = `theory-local-${Date.now()}`;
          isLocalTheory = true;
        } else {
          const apiUrl = `/api/v1/Theories?ChapterId=${encodeURIComponent(chapterId)}`;
          
          const requestData = {
            name: theoryData.name,
            article: theoryData.article
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
            throw new Error(`Ошибка сервера (${response.status}): ${responseText.substring(0, 200)}`);
          }

          theoryId = responseText.replace(/["'\s]/g, '').trim();
        }
        
        const updatedSections = [...sectionData.sections];
        updatedSections[sectionData.currentSectionIndex].theory[currentTheoryIndex] = {
          ...updatedSections[sectionData.currentSectionIndex].theory[currentTheoryIndex],
          id: theoryId,
          name: theoryData.name,
          article: theoryData.article,
          isFromAPI: !isLocalTheory,
          isFallback: isLocalTheory,
          needsSync: isLocalTheory,
          savedAt: new Date().toISOString()
        };

        setSectionData(prev => ({
          ...prev,
          sections: updatedSections
        }));

        const updatedCourse = {
          ...course,
          sectionsData: updatedSections
        };
        
        const courses = JSON.parse(localStorage.getItem('tutorit-courses') || '[]');
        const updatedCourses = courses.map(c => {
          const courseIdClean = String(c.id).replace(/^["']+|["']+$/g, '').trim();
          return courseIdClean === cleanedCourseId ? updatedCourse : c;
        });
        
        localStorage.setItem('tutorit-courses', JSON.stringify(updatedCourses));
        setCourse(updatedCourse);

        setStatusMessage('Теория сохранена!');
        
        if (currentTheoryIndex < currentSection.theory.length - 1) {
          setCurrentTheoryIndex(currentTheoryIndex + 1);
          setTheoryData({ name: '', article: '' });
          setStatusMessage(`Переход к блоку теории ${currentTheoryIndex + 2}...`);
        } else if (currentSection.numberTasks > 0) {
          setCurrentTaskIndex(0);
          setCurrentStep('assignment');
          setStatusMessage('Переход к конструктору заданий...');
        } else {
          handleNextSectionOrFinish();
        }

      } catch (error) {
        setStatusMessage(`Ошибка: ${error.message}`);
        setTimeout(() => setStatusMessage(''), 5000);
        
        const theoryId = `theory-local-${Date.now()}`;
        
        const updatedSections = [...sectionData.sections];
        updatedSections[sectionData.currentSectionIndex].theory[currentTheoryIndex] = {
          ...updatedSections[sectionData.currentSectionIndex].theory[currentTheoryIndex],
          id: theoryId,
          name: theoryData.name,
          article: theoryData.article,
          isFromAPI: false,
          isFallback: true,
          needsSync: true,
          savedAt: new Date().toISOString()
        };

        setSectionData(prev => ({
          ...prev,
          sections: updatedSections
        }));

        const updatedCourse = {
          ...course,
          sectionsData: updatedSections
        };
        
        const courses = JSON.parse(localStorage.getItem('tutorit-courses') || '[]');
        const updatedCourses = courses.map(c => {
          const courseIdClean = String(c.id).replace(/^["']+|["']+$/g, '').trim();
          return courseIdClean === cleanedCourseId ? updatedCourse : c;
        });
        
        localStorage.setItem('tutorit-courses', JSON.stringify(updatedCourses));
        setCourse(updatedCourse);

        setStatusMessage('Локальная теория сохранена!');
        
        if (currentTheoryIndex < currentSection.theory.length - 1) {
          setCurrentTheoryIndex(currentTheoryIndex + 1);
          setTheoryData({ name: '', article: '' });
        } else if (currentSection.numberTasks > 0) {
          setCurrentTaskIndex(0);
          setCurrentStep('assignment');
        } else {
          handleNextSectionOrFinish();
        }
      } finally {
        setIsLoading(false);
      }
    };

    const handleNextSectionOrFinish = () => {
      if (sectionData.currentSectionIndex < sectionData.totalSections - 1) {
        setSectionData(prev => ({
          ...prev,
          currentSectionIndex: prev.currentSectionIndex + 1
        }));
        setCurrentTheoryIndex(0);
        setCurrentStep('section-details');
        setStatusMessage(`Переход к разделу ${sectionData.currentSectionIndex + 2}...`);
      } else {
        setStatusMessage('Все разделы созданы! Перенаправление на главную...');
        setTimeout(() => navigate('/'), 2000);
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
            className="next-btn green-btn"
            onClick={handleSaveTheory}
            disabled={!theoryData.name || !theoryData.article || isLoading}
          >
            {isLoading ? 'Сохранение...' : 
             currentTheoryIndex < currentSection.theory.length - 1 
               ? 'Дальше → Конструктор теории' 
               : currentSection.numberTasks > 0
                 ? 'Дальше → Конструктор заданий'
                 : 'Дальше → Конструктор теории'}
          </button>
        </div>
      </div>
    );
  };

  const AssignmentBuilder = () => {
    const currentSection = sectionData.sections[sectionData.currentSectionIndex];
    const currentTask = currentSection?.tasks?.[currentTaskIndex];
    
    const [taskData, setTaskData] = useState({
      name: currentTask?.name || '',
      description: currentTask?.description || ''
    });

    useEffect(() => {
      if (currentTask) {
        setTaskData({
          name: currentTask.name || '',
          description: currentTask.description || ''
        });
      }
    }, [currentTask]);

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
        
        let taskId;
        let isLocalTask = false;
        
        if (chapterId.startsWith('local-')) {
          taskId = `task-local-${Date.now()}`;
          isLocalTask = true;
        } else {
          const apiUrl = `/api/v1/TasksCreators?ChapterId=${encodeURIComponent(chapterId)}`;
          
          const requestData = {
            name: taskData.name,
            description: taskData.description
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
            throw new Error(`Ошибка создания задания (${response.status}): ${responseText.substring(0, 200)}`);
          }

          taskId = responseText.replace(/["'\s]/g, '').trim();
        }
        
        const updatedSections = [...sectionData.sections];
        updatedSections[sectionData.currentSectionIndex].tasks[currentTaskIndex] = {
          ...updatedSections[sectionData.currentSectionIndex].tasks[currentTaskIndex],
          id: taskId,
          name: taskData.name,
          description: taskData.description,
          isFromAPI: !isLocalTask,
          isFallback: isLocalTask,
          needsSync: isLocalTask,
          savedAt: new Date().toISOString()
        };

        setSectionData(prev => ({
          ...prev,
          sections: updatedSections
        }));

        const updatedCourse = {
          ...course,
          sectionsData: updatedSections
        };
        
        const courses = JSON.parse(localStorage.getItem('tutorit-courses') || '[]');
        const updatedCourses = courses.map(c => {
          const courseIdClean = String(c.id).replace(/^["']+|["']+$/g, '').trim();
          return courseIdClean === cleanedCourseId ? updatedCourse : c;
        });
        
        localStorage.setItem('tutorit-courses', JSON.stringify(updatedCourses));
        setCourse(updatedCourse);

        setStatusMessage('Задание сохранено!');
        
        setCurrentStep('answers');

      } catch (error) {
        setStatusMessage(`Ошибка: ${error.message}`);
        setTimeout(() => setStatusMessage(''), 5000);
        
        const taskId = `task-local-${Date.now()}`;
        
        const updatedSections = [...sectionData.sections];
        updatedSections[sectionData.currentSectionIndex].tasks[currentTaskIndex] = {
          ...updatedSections[sectionData.currentSectionIndex].tasks[currentTaskIndex],
          id: taskId,
          name: taskData.name,
          description: taskData.description,
          isFromAPI: false,
          isFallback: true,
          needsSync: true,
          savedAt: new Date().toISOString()
        };

        setSectionData(prev => ({
          ...prev,
          sections: updatedSections
        }));

        const updatedCourse = {
          ...course,
          sectionsData: updatedSections
        };
        
        const courses = JSON.parse(localStorage.getItem('tutorit-courses') || '[]');
        const updatedCourses = courses.map(c => {
          const courseIdClean = String(c.id).replace(/^["']+|["']+$/g, '').trim();
          return courseIdClean === cleanedCourseId ? updatedCourse : c;
        });
        
        localStorage.setItem('tutorit-courses', JSON.stringify(updatedCourses));
        setCourse(updatedCourse);

        setStatusMessage('Локальное задание сохранено!');
        setCurrentStep('answers');
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

          <div className="navigation-buttons">
            <button 
              className="next-btn green-btn"
              onClick={handleSaveAssignment}
              disabled={!taskData.name || !taskData.description || isLoading}
            >
              {isLoading ? 'Создание...' : 'Дальше → Конструктор ответов'}
            </button>
          </div>
        </div>
      </div>
    );
  };

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
        throw new Error(`Ошибка создания вопроса (${response.status}): ${responseText}`);
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
        
        const questions = [];
        
        for (let i = 0; i < answers.length; i++) {
          const questionName = answers[i];
          const isCorrect = i === correctAnswerIndex;
          
          try {
            if (taskId.startsWith('local-')) {
              questions.push({
                id: `question-local-${Date.now()}-${i}`,
                name: questionName,
                answer: isCorrect,
                isFromAPI: false,
                isFallback: true,
                needsSync: true
              });
            } else {
              const questionId = await createQuestion(taskId, questionName, isCorrect);
              
              questions.push({
                id: questionId,
                name: questionName,
                answer: isCorrect,
                isFromAPI: true,
                savedAt: new Date().toISOString()
              });
            }
          } catch (error) {
            questions.push({
              id: `question-local-${Date.now()}-${i}`,
              name: questionName,
              answer: isCorrect,
              isFallback: true,
              needsSync: true,
              error: error.message,
              savedAt: new Date().toISOString()
            });
          }
        }
        
        const updatedSections = [...sectionData.sections];
        updatedSections[sectionData.currentSectionIndex].tasks[currentTaskIndex] = {
          ...updatedSections[sectionData.currentSectionIndex].tasks[currentTaskIndex],
          answers: answers,
          correctAnswerIndex: correctAnswerIndex,
          questions: questions,
          hasQuestions: true,
          questionsSavedAt: new Date().toISOString()
        };

        setSectionData(prev => ({
          ...prev,
          sections: updatedSections
        }));

        const updatedCourse = {
          ...course,
          sectionsData: updatedSections
        };
        
        const courses = JSON.parse(localStorage.getItem('tutorit-courses') || '[]');
        const updatedCourses = courses.map(c => {
          const courseIdClean = String(c.id).replace(/^["']+|["']+$/g, '').trim();
          return courseIdClean === cleanedCourseId ? updatedCourse : c;
        });
        
        localStorage.setItem('tutorit-courses', JSON.stringify(updatedCourses));
        setCourse(updatedCourse);

        setStatusMessage('Ответы сохранены!');
        
        if (currentTaskIndex < currentSection.tasks.length - 1) {
          setCurrentTaskIndex(currentTaskIndex + 1);
          setCurrentStep('assignment');
          setStatusMessage(`Переход к заданию ${currentTaskIndex + 2}...`);
        } else {
          handleNextSectionOrFinish();
        }

      } catch (error) {
        setStatusMessage(`Ошибка: ${error.message}`);
        setTimeout(() => setStatusMessage(''), 5000);
        
        const questions = answers.map((answer, index) => ({
          id: `question-local-${Date.now()}-${index}`,
          name: answer,
          answer: index === correctAnswerIndex,
          isFallback: true,
          needsSync: true
        }));
        
        const updatedSections = [...sectionData.sections];
        updatedSections[sectionData.currentSectionIndex].tasks[currentTaskIndex] = {
          ...updatedSections[sectionData.currentSectionIndex].tasks[currentTaskIndex],
          answers: answers,
          correctAnswerIndex: correctAnswerIndex,
          questions: questions,
          hasQuestions: true,
          isFallback: true,
          questionsSavedAt: new Date().toISOString()
        };

        setSectionData(prev => ({
          ...prev,
          sections: updatedSections
        }));

        const updatedCourse = {
          ...course,
          sectionsData: updatedSections
        };
        
        const courses = JSON.parse(localStorage.getItem('tutorit-courses') || '[]');
        const updatedCourses = courses.map(c => {
          const courseIdClean = String(c.id).replace(/^["']+|["']+$/g, '').trim();
          return courseIdClean === cleanedCourseId ? updatedCourse : c;
        });
        
        localStorage.setItem('tutorit-courses', JSON.stringify(updatedCourses));
        setCourse(updatedCourse);

        setStatusMessage('Локальные ответы сохранены!');
        
        if (currentTaskIndex < currentSection.tasks.length - 1) {
          setCurrentTaskIndex(currentTaskIndex + 1);
          setCurrentStep('assignment');
        } else {
          handleNextSectionOrFinish();
        }
      } finally {
        setIsLoading(false);
      }
    };

    const handleNextSectionOrFinish = () => {
      if (sectionData.currentSectionIndex < sectionData.totalSections - 1) {
        setSectionData(prev => ({
          ...prev,
          currentSectionIndex: prev.currentSectionIndex + 1
        }));
        setCurrentTaskIndex(0);
        setCurrentTheoryIndex(0);
        setCurrentStep('section-details');
        setStatusMessage(`Переход к разделу ${sectionData.currentSectionIndex + 2}...`);
      } else {
        setStatusMessage('Поздравляем! Курс полностью создан! Перенаправление на главную...');
        setTimeout(() => navigate('/'), 2000);
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
          {currentTask?.id?.startsWith('local-') && (
            <p className="task-local-badge">⚠️ Локальное задание</p>
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
            className="next-btn green-btn"
            onClick={handleSaveAnswers}
            disabled={answers.some(answer => !answer.trim()) || isLoading}
          >
            {isLoading ? 'Сохранение...' : 
             currentTaskIndex < currentSection.tasks.length - 1 
               ? 'Дальше → Конструктор заданий' 
               : sectionData.currentSectionIndex < sectionData.totalSections - 1
                 ? 'Дальше → Конструктор раздела'
                 : 'Дальше → Завершить курс'}
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
    </div>
  );
}

export default CourseBuilder;