import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './CourseBuilder.css';

function CourseBuilder() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [currentStep, setCurrentStep] = useState('section');
  const [isLoading, setIsLoading] = useState(false);
  const [cleanedCourseId, setCleanedCourseId] = useState('');
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [allChapters, setAllChapters] = useState([]);
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    const fetchChaptersForCourse = async () => {
      if (!cleanedCourseId) return;
      
      try {
        console.log('Загружаю Chapters для курса...', cleanedCourseId);
        const response = await fetch(`/api/v1/Chapters/${cleanedCourseId}`, {
          method: 'GET',
          headers: {
            'accept': 'text/plain'
          }
        });
        
        if (response.ok) {
          const chapters = await response.json();
          setAllChapters(chapters);
          console.log('Chapters загружены:', chapters.length);
        } else {
          console.log('Chapters не найдены или курс пустой');
          setAllChapters([]);
        }
      } catch (error) {
        console.error('Ошибка загрузки Chapters:', error);
        setAllChapters([]);
      }
    };
    
    fetchChaptersForCourse();
  }, [cleanedCourseId]);

  useEffect(() => {
    if (courseId) {
      const cleanId = courseId.replace(/^["']+|["']+$/g, '').trim();
      setCleanedCourseId(cleanId);
      console.log('CourseId очищен:', cleanId);
    }
  }, [courseId]);

  useEffect(() => {
    if (!cleanedCourseId) return;

    console.log('Загружаю курс с ID:', cleanedCourseId);
    
    const courses = JSON.parse(localStorage.getItem('tutorit-courses') || '[]');
    
    const foundCourse = courses.find(c => {
      const storedId = String(c.id).replace(/^["']+|["']+$/g, '').trim();
      return storedId === cleanedCourseId;
    });
    
    if (foundCourse) {
      console.log('Курс найден:', foundCourse.title);
      
      const courseWithSections = {
        ...foundCourse,
        sectionsData: foundCourse.sectionsData || []
      };
      setCourse(courseWithSections);
      
      if (courseWithSections.sectionsData.length > 0) {
        setCurrentSectionIndex(courseWithSections.sectionsData.length - 1);
      }
    } else {
      console.log('Курс не найден в localStorage');
      navigate(`/course/${courseId}`);
    }
  }, [cleanedCourseId, courseId, navigate]);

  const checkChapterExists = (chapterId) => {
    if (!chapterId || chapterId.startsWith('local-')) {
      return false;
    }
    
    return allChapters.some(chapter => {
      const cleanChapterId = String(chapter.id).trim();
      const cleanSearchId = String(chapterId).trim();
      return cleanChapterId === cleanSearchId;
    });
  };

  const findChapterByName = (chapterName) => {
    return allChapters.find(chapter => 
      chapter.name.toLowerCase() === chapterName.toLowerCase()
    );
  };

  const SectionBuilder = () => {
    const [sectionData, setSectionData] = useState({
      name: '',
      description: '',
      numberTheoryBloks: 0,
      numberTasks: 0
    });

    const handleSaveSection = async () => {
      if (!sectionData.name || !sectionData.description) {
        alert('Заполните название и описание раздела');
        return;
      }

      setIsLoading(true);
      setDebugInfo('Создание раздела...');

      try {
        console.log('Создание раздела');
        
        if (!cleanedCourseId) {
          throw new Error('CourseId не определен');
        }

        const apiUrl = `/api/v1/Chapters/${cleanedCourseId}`;
        console.log('Создаю Chapter для курса:', cleanedCourseId);
        
        const requestData = {
          name: sectionData.name,
          description: sectionData.description,
          numberTheoryBloks: parseInt(sectionData.numberTheoryBloks) || 0,
          numberTasks: parseInt(sectionData.numberTasks) || 0
        };
        
        console.log('Отправляю данные:', requestData);
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'accept': 'text/plain'
          },
          body: JSON.stringify(requestData)
        });

        const responseText = await response.text();
        console.log('Ответ от API создания Chapter:', {
          status: response.status,
          ok: response.ok,
          text: responseText
        });

        if (!response.ok) {
          throw new Error(`Ошибка создания раздела (${response.status}): ${responseText}`);
        }

        let chapterId = responseText.replace(/["'\s]/g, '').trim();
        console.log('Ответ от API (ChapterId):', chapterId);
        
        if (!chapterId || chapterId === '' || chapterId === 'OK' || chapterId === 'true' || 
            chapterId === cleanedCourseId || chapterId.length < 10) {
          
          console.log('API вернул некорректный ответ, ищу Chapter в списке...');
          setDebugInfo('Ищу созданный раздел на сервере...');
          
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
              chapter.name === sectionData.name
            );
            
            if (foundChapter) {
              chapterId = foundChapter.id;
              console.log('Chapter найден по имени, ID:', chapterId);
              setDebugInfo(`Раздел найден: ${chapterId}`);
            } else {
              console.log('Chapter не найден по имени, создаю локальный');
              chapterId = `local-${Date.now()}`;
              setDebugInfo('Создаю локальную версию раздела');
            }
          } else {
            console.log('Не удалось получить список Chapters');
            chapterId = `local-${Date.now()}`;
            setDebugInfo('Не удалось получить список разделов');
          }
        }
        
        console.log('Final Chapter ID:', chapterId);
        
        const currentSections = course?.sectionsData || [];
        const newSection = {
          ...sectionData,
          id: chapterId,
          apiChapterId: chapterId.startsWith('local-') ? null : chapterId,
          courseId: cleanedCourseId,
          sectionNumber: currentSections.length + 1,
          theory: null,
          tasks: [],
          createdAt: new Date().toISOString(),
          isFromAPI: !chapterId.startsWith('local-'),
          isFallback: chapterId.startsWith('local-'),
          needsSync: chapterId.startsWith('local-')
        };

        const updatedCourse = {
          ...course,
          sectionsData: [...currentSections, newSection]
        };
        
        const courses = JSON.parse(localStorage.getItem('tutorit-courses') || '[]');
        const updatedCourses = courses.map(c => {
          const courseIdClean = String(c.id).replace(/^["']+|["']+$/g, '').trim();
          return courseIdClean === cleanedCourseId ? updatedCourse : c;
        });
        
        localStorage.setItem('tutorit-courses', JSON.stringify(updatedCourses));
        setCourse(updatedCourse);
        setCurrentSectionIndex(updatedCourse.sectionsData.length - 1);
        
        if (chapterId.startsWith('local-')) {
          alert(`Раздел "${sectionData.name}" создан локально. Вы сможете синхронизировать его позже.`);
        } else if (chapterId === cleanedCourseId) {
          alert(`Внимание! ID раздела совпадает с ID курса. Это может вызвать проблемы при создании теории.`);
        } else {
          alert(`Раздел "${sectionData.name}" успешно создан! ID раздела: ${chapterId}`);
        }
        
        setCurrentStep('theory');

      } catch (error) {
        console.error('Ошибка создания раздела:', error);
        setDebugInfo(`Ошибка: ${error.message}`);
        
        const currentSections = course?.sectionsData || [];
        const localChapterId = `local-${Date.now()}`;
        const newSection = {
          ...sectionData,
          id: localChapterId,
          apiChapterId: null,
          courseId: cleanedCourseId,
          sectionNumber: currentSections.length + 1,
          theory: null,
          tasks: [],
          createdAt: new Date().toISOString(),
          isFallback: true,
          needsSync: true
        };

        const updatedCourse = {
          ...course,
          sectionsData: [...currentSections, newSection]
        };
        
        const courses = JSON.parse(localStorage.getItem('tutorit-courses') || '[]');
        const updatedCourses = courses.map(c => {
          const courseIdClean = String(c.id).replace(/^["']+|["']+$/g, '').trim();
          return courseIdClean === cleanedCourseId ? updatedCourse : c;
        });
        
        localStorage.setItem('tutorit-courses', JSON.stringify(updatedCourses));
        setCourse(updatedCourse);
        setCurrentSectionIndex(updatedCourse.sectionsData.length - 1);
        setCurrentStep('theory');
        
        alert(`Раздел "${sectionData.name}" создан локально.`);
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="builder-step">
        <h2>Шаг 1: Создание раздела</h2>
        {debugInfo && <div className="debug-info">{debugInfo}</div>}
        <p className="step-info">
          Создайте новый раздел для курса<br />
          <small>ID курса: {cleanedCourseId}</small>
        </p>
        
        <div className="form-group">
          <label>Название раздела *</label>
          <input
            type="text"
            value={sectionData.name}
            onChange={(e) => setSectionData(prev => ({...prev, name: e.target.value}))}
            placeholder="Введите название раздела"
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label>Описание раздела *</label>
          <textarea
            value={sectionData.description}
            onChange={(e) => setSectionData(prev => ({...prev, description: e.target.value}))}
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
              value={sectionData.numberTheoryBloks}
              onChange={(e) => setSectionData(prev => ({...prev, numberTheoryBloks: parseInt(e.target.value) || 0}))}
              min="0"
              max="10"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label>Количество заданий</label>
            <input
              type="number"
              value={sectionData.numberTasks}
              onChange={(e) => setSectionData(prev => ({...prev, numberTasks: parseInt(e.target.value) || 0}))}
              min="0"
              max="10"
              disabled={isLoading}
            />
          </div>
        </div>

        <button 
          className="next-btn"
          onClick={handleSaveSection}
          disabled={!sectionData.name || !sectionData.description || isLoading}
        >
          {isLoading ? 'Создание...' : 'Дальше → Конструктор теории'}
        </button>
      </div>
    );
  };

  const TheoryBuilder = () => {
    const currentSection = course?.sectionsData?.[currentSectionIndex];
    const [theoryData, setTheoryData] = useState({
      name: '',
      article: ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [theoryDebugInfo, setTheoryDebugInfo] = useState('');

    useEffect(() => {
      if (currentSection?.id) {
        console.log('Текущий раздел для теории:', {
          sectionId: currentSection.id,
          sectionName: currentSection.name,
          courseId: currentSection.courseId,
          isFallback: currentSection.isFallback
        });
        
        if (currentSection.id === cleanedCourseId) {
          console.error('КРИТИЧЕСКАЯ ОШИБКА: В section.id сохранен ID курса вместо ID раздела!');
        }
        
        if (currentSection?.theory) {
          setTheoryData({
            name: currentSection.theory.name || '',
            article: currentSection.theory.article || ''
          });
        } else {
          setTheoryData({
            name: '',
            article: ''
          });
        }
      }
    }, [currentSection, cleanedCourseId]);

    const handleSaveTheory = async () => {
      if (!theoryData.name || !theoryData.article) {
        alert('Заполните название и содержание теории');
        return;
      }

      if (!currentSection?.id) {
        alert('Ошибка: ID раздела не найден');
        return;
      }

      setIsSaving(true);
      setTheoryDebugInfo('Создание теории...');

      try {
        console.log('Создание теории');
        
        let chapterId = currentSection.id;
        const chapterName = currentSection.name;
        
        if (chapterId === cleanedCourseId) {
          console.warn('Обнаружен ID курса вместо ID раздела, ищу правильный Chapter...');
          
          const correctChapter = findChapterByName(chapterName);
          
          if (correctChapter) {
            chapterId = correctChapter.id;
            console.log('Исправлен ChapterId:', chapterId);
            setTheoryDebugInfo(`Исправлен ID раздела: ${chapterId}`);
            
            const updatedSections = [...course.sectionsData];
            updatedSections[currentSectionIndex] = {
              ...updatedSections[currentSectionIndex],
              id: chapterId,
              apiChapterId: chapterId
            };
            
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
          } else {
            throw new Error(
              `Не могу найти раздел "${chapterName}" на сервере.\n\n` +
              `Возможно, раздел не был создан или был удален.\n` +
              `Попробуйте создать раздел заново.`
            );
          }
        }
        
        console.log('Используем ChapterId:', chapterId);
        console.log('Название раздела:', chapterName);
        
        if (chapterId.startsWith('local-')) {
          console.log('Локальный Chapter, создаю локальную теорию');
          const localTheoryId = `theory-local-${Date.now()}`;
          
          const updatedSections = [...course.sectionsData];
          updatedSections[currentSectionIndex] = {
            ...updatedSections[currentSectionIndex],
            theory: {
              ...theoryData,
              id: localTheoryId,
              chapterId: chapterId,
              isFromAPI: false,
              isFallback: true,
              needsSync: true,
              savedAt: new Date().toISOString()
            },
            hasTheory: true
          };

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
          
          alert('Теория сохранена локально!');
          setCurrentStep('assignment');
          return;
        }
        
        const chapterExists = checkChapterExists(chapterId);
        
        if (!chapterExists) {
          console.log('Chapter не найден по ID, проверяю по имени...');
          const foundChapter = findChapterByName(chapterName);
          
          if (foundChapter) {
            chapterId = foundChapter.id;
            console.log('Найден Chapter по имени:', chapterId);
          } else {
            throw new Error(
              `Раздел "${chapterName}" не найден на сервере.\n\n` +
              `Проверьте:\n` +
              `1. Раздел создан на сервере\n` +
              `2. Название раздела правильное\n` +
              `3. Список разделов загружен`
            );
          }
        }
        
        const apiUrl = `/api/v1/Theories?ChapterId=${encodeURIComponent(chapterId)}`;
        console.log('URL для создания теории:', apiUrl);
        
        const requestData = {
          name: theoryData.name,
          article: theoryData.article
        };
        
        console.log('Отправляю данные:', requestData);
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'accept': 'text/plain'
          },
          body: JSON.stringify(requestData)
        });

        const responseText = await response.text();
        console.log('Ответ сервера:', {
          status: response.status,
          ok: response.ok,
          text: responseText.substring(0, 100)
        });

        if (!response.ok) {
          throw new Error(`Ошибка сервера (${response.status}): ${responseText.substring(0, 200)}`);
        }

        const theoryId = responseText.replace(/["'\s]/g, '').trim();
        console.log('Теория создана! ID:', theoryId);
        
        const updatedSections = [...course.sectionsData];
        updatedSections[currentSectionIndex] = {
          ...updatedSections[currentSectionIndex],
          theory: {
            ...theoryData,
            id: theoryId,
            chapterId: chapterId,
            isFromAPI: true,
            savedAt: new Date().toISOString()
          },
          hasTheory: true
        };

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
        
        alert('Теория успешно создана!');
        setCurrentStep('assignment');

      } catch (error) {
        console.error('Ошибка создания теории:', error);
        setTheoryDebugInfo(`Ошибка: ${error.message}`);
        
        const userConfirmed = window.confirm(
          `${error.message}\n\n` +
          `Создать локальную версию теории?\n` +
          `Вы сможете синхронизировать её позже.`
        );
        
        if (userConfirmed) {
          const chapterId = currentSection.id === cleanedCourseId ? 
            `local-${Date.now()}` : currentSection.id;
          
          const localTheoryId = `theory-local-${Date.now()}`;
          const updatedSections = [...course.sectionsData];
          updatedSections[currentSectionIndex] = {
            ...updatedSections[currentSectionIndex],
            theory: {
              ...theoryData,
              id: localTheoryId,
              chapterId: chapterId,
              isFallback: true,
              needsSync: true,
              savedAt: new Date().toISOString()
            },
            hasTheory: true
          };

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
          setCurrentStep('assignment');
          
          alert('Локальная теория сохранена!');
        }
      } finally {
        setIsSaving(false);
      }
    };

    return (
      <div className="builder-step">
        <h2>Шаг 2: Конструктор теории</h2>
        {theoryDebugInfo && <div className="debug-info">{theoryDebugInfo}</div>}
        <p className="step-info">
          Раздел: <strong>{currentSection?.name}</strong>
          {currentSection?.isFallback && (
            <span className="warning-badge"> (локальный)</span>
          )}
          <br />
          <small>
            ID раздела: {currentSection?.id}<br />
            ID курса: {cleanedCourseId}
            {currentSection?.id === cleanedCourseId && (
              <span style={{color: 'red', fontWeight: 'bold'}}> ОШИБКА: Это ID курса!</span>
            )}
          </small>
        </p>
        
        <div className="form-group">
          <label>Название теории *</label>
          <input
            type="text"
            value={theoryData.name}
            onChange={(e) => setTheoryData(prev => ({...prev, name: e.target.value}))}
            placeholder="Введите название теории"
            disabled={isSaving}
          />
        </div>

        <div className="form-group">
          <label>Теоретические материалы *</label>
          <textarea
            value={theoryData.article}
            onChange={(e) => setTheoryData(prev => ({...prev, article: e.target.value}))}
            placeholder="Введите теоретические материалы..."
            rows="10"
            disabled={isSaving}
          />
        </div>

        <div className="navigation-buttons">
          <button 
            className="btn-back"
            onClick={() => setCurrentStep('section')}
            disabled={isSaving}
          >
            ← Назад к разделу
          </button>
          <button 
            className="next-btn"
            onClick={handleSaveTheory}
            disabled={!theoryData.name || !theoryData.article || isSaving}
          >
            {isSaving ? 'Сохранение...' : 'Дальше → Конструктор заданий'}
          </button>
        </div>
      </div>
    );
  };

  const AssignmentBuilder = () => {
    const currentSection = course?.sectionsData?.[currentSectionIndex];
    const [tasks, setTasks] = useState(
      currentSection?.tasks || []
    );
    const [newTask, setNewTask] = useState({
      name: '',
      description: ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [tasksDebugInfo, setTasksDebugInfo] = useState('');

    useEffect(() => {
      if (currentSection?.tasks) {
        setTasks(currentSection.tasks);
      }
    }, [currentSection]);

    const handleAddTask = () => {
      if (!newTask.name || !newTask.description) {
        alert('Заполните название и описание задания');
        return;
      }

      const updatedTasks = [...tasks, { 
        ...newTask, 
        id: `temp-${Date.now()}`,
        questions: []
      }];
      setTasks(updatedTasks);
      setNewTask({ name: '', description: '' });
    };

    const handleRemoveTask = (index) => {
      const updatedTasks = tasks.filter((_, i) => i !== index);
      setTasks(updatedTasks);
    };

    const handleSaveAssignments = async () => {
      if (tasks.length === 0) {
        alert('Добавьте хотя бы одно задание');
        return;
      }

      setIsSaving(true);
      setTasksDebugInfo('Сохранение заданий...');

      try {
        console.log('Сохранение заданий');
        
        if (!currentSection?.id) {
          throw new Error('ID раздела не найден');
        }

        let chapterId = currentSection.id;
        const chapterName = currentSection.name;
        
        if (chapterId === cleanedCourseId) {
          console.warn('Обнаружен ID курса вместо ID раздела, ищу правильный Chapter...');
          const correctChapter = findChapterByName(chapterName);
          
          if (correctChapter) {
            chapterId = correctChapter.id;
            console.log('Исправлен ChapterId для заданий:', chapterId);
          } else {
            throw new Error(`Не могу найти раздел "${chapterName}" на сервере.`);
          }
        }
        
        console.log('Используем ChapterId для заданий:', chapterId);
        
        const savedTasks = [];
        
        for (let i = 0; i < tasks.length; i++) {
          const task = tasks[i];
          setTasksDebugInfo(`Создание задания ${i + 1} из ${tasks.length}...`);
          
          try {
            if (chapterId.startsWith('local-')) {
              console.log('Локальный Chapter, создаю локальное задание');
              savedTasks.push({
                ...task,
                id: `task-local-${Date.now()}-${i}`,
                isFallback: true,
                needsSync: true
              });
              continue;
            }
            
            const apiUrl = `/api/v1/TasksCreators?ChapterId=${encodeURIComponent(chapterId)}`;
            console.log(`Создаю задание ${i + 1}:`, apiUrl);
            
            const requestData = {
              name: task.name,
              description: task.description
            };
            
            console.log('Отправляю данные задания:', requestData);
            
            const response = await fetch(apiUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'accept': 'text/plain'
              },
              body: JSON.stringify(requestData)
            });

            const responseText = await response.text();
            console.log(`Ответ для задания ${i + 1}:`, {
              status: response.status,
              ok: response.ok,
              text: responseText.substring(0, 100)
            });

            if (!response.ok) {
              throw new Error(`Ошибка создания задания (${response.status}): ${responseText.substring(0, 200)}`);
            }

            const taskId = responseText.replace(/["'\s]/g, '').trim();
            console.log(`Задание ${i + 1} создано! ID:`, taskId);
            
            savedTasks.push({
              ...task,
              id: taskId,
              apiTaskId: taskId,
              isFromAPI: true
            });
            
          } catch (taskError) {
            console.error(`Ошибка создания задания ${i + 1}:`, taskError);
            
            const localTaskId = `task-local-${Date.now()}-${i}`;
            savedTasks.push({
              ...task,
              id: localTaskId,
              isFallback: true,
              needsSync: true,
              error: taskError.message
            });
          }
        }
        
        console.log('Все задания обработаны:', savedTasks.length);
        
        const updatedSections = [...course.sectionsData];
        updatedSections[currentSectionIndex] = {
          ...updatedSections[currentSectionIndex],
          tasks: savedTasks
        };

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
        
        const hasLocalTasks = savedTasks.some(task => task.isFallback);
        
        if (hasLocalTasks) {
          alert(`Задания сохранены!\n\n` +
                `Некоторые задания сохранены локально.\n` +
                `Синхронизируйте их с сервером позже.`);
        } else {
          alert('Все задания успешно созданы на сервере!');
        }
        
        setCurrentTaskIndex(0);
        setCurrentStep('answers');

      } catch (error) {
        console.error('Ошибка сохранения заданий:', error);
        setTasksDebugInfo(`Ошибка: ${error.message}`);
        
        const userConfirmed = window.confirm(
          `${error.message}\n\n` +
          `Сохранить задания локально?\n` +
          `Вы сможете синхронизировать их позже.`
        );
        
        if (userConfirmed) {
          const localTasks = tasks.map((task, index) => ({
            ...task,
            id: `task-local-${Date.now()}-${index}`,
            isFallback: true,
            needsSync: true
          }));
          
          const updatedSections = [...course.sectionsData];
          updatedSections[currentSectionIndex] = {
            ...updatedSections[currentSectionIndex],
            tasks: localTasks
          };

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
          
          setCurrentTaskIndex(0);
          setCurrentStep('answers');
          
          alert('Задания сохранены локально!');
        }
      } finally {
        setIsSaving(false);
      }
    };

    return (
      <div className="builder-step">
        <h2>Шаг 3: Конструктор заданий</h2>
        {tasksDebugInfo && <div className="debug-info">{tasksDebugInfo}</div>}
        <p className="step-info">
          Раздел: <strong>{currentSection?.name}</strong> | 
          Заданий: {tasks.length}
        </p>
        
        <div className="task-form">
          <h3>Добавить задание</h3>
          
          <div className="form-group">
            <label>Название задания *</label>
            <input
              type="text"
              value={newTask.name}
              onChange={(e) => setNewTask(prev => ({...prev, name: e.target.value}))}
              placeholder="Введите название задания"
              disabled={isSaving}
            />
          </div>

          <div className="form-group">
            <label>Описание задания *</label>
            <textarea
              value={newTask.description}
              onChange={(e) => setNewTask(prev => ({...prev, description: e.target.value}))}
              placeholder="Опишите задание..."
              rows="4"
              disabled={isSaving}
            />
          </div>

          <button 
            className="btn-add-task"
            onClick={handleAddTask}
            disabled={!newTask.name || !newTask.description || isSaving}
          >
            + Добавить задание
          </button>
        </div>

        <div className="tasks-list">
          <h3>Созданные задания ({tasks.length})</h3>
          
          {tasks.length === 0 ? (
            <div className="empty-tasks">
              <p>Пока нет созданных заданий</p>
            </div>
          ) : (
            <div className="tasks-container">
              {tasks.map((task, index) => (
                <div key={index} className="task-card">
                  <div className="task-header">
                    <h4>{task.name}</h4>
                    <button 
                      className="btn-remove-task"
                      onClick={() => handleRemoveTask(index)}
                      title="Удалить задание"
                      disabled={isSaving}
                    >
                      ×
                    </button>
                  </div>
                  <p className="task-description">{task.description}</p>
                  <div className="task-meta">
                    <span>Задание {index + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="navigation-buttons">
          <button 
            className="btn-back"
            onClick={() => setCurrentStep('theory')}
            disabled={isSaving}
          >
            ← Назад к теории
          </button>
          <button 
            className="next-btn"
            onClick={handleSaveAssignments}
            disabled={tasks.length === 0 || isSaving}
          >
            {isSaving ? 'Сохранение...' : 'Дальше → Конструктор ответов'}
          </button>
        </div>
      </div>
    );
  };

  const AnswersBuilder = () => {
    const currentSection = course?.sectionsData?.[currentSectionIndex];
    const currentTask = currentSection?.tasks?.[currentTaskIndex];
    const [answers, setAnswers] = useState(
      currentTask?.answers || ['', '', '', '']
    );
    const [correctAnswerIndex, setCorrectAnswerIndex] = useState(
      currentTask?.correctAnswerIndex || 0
    );
    const [isSaving, setIsSaving] = useState(false);
    const [answersDebugInfo, setAnswersDebugInfo] = useState('');

    useEffect(() => {
      if (currentTask?.answers) {
        setAnswers(currentTask.answers);
      }
      if (currentTask?.correctAnswerIndex !== undefined) {
        setCorrectAnswerIndex(currentTask.correctAnswerIndex);
      }
    }, [currentTask]);

    const handleAnswerChange = (index, value) => {
      const newAnswers = [...answers];
      newAnswers[index] = value;
      setAnswers(newAnswers);
    };

    const createQuestion = async (taskId, questionName, isCorrect) => {
      console.log('Создаю вопрос через API:', { taskId, questionName, isCorrect });
      
      const apiUrl = `/api/v1/Questions?TaskCreatorId=${encodeURIComponent(taskId)}`;
      console.log('API URL для создания вопроса:', apiUrl);
      
      const requestData = {
        name: questionName,
        answer: isCorrect
      };
      
      console.log('Отправляю данные вопроса:', requestData);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'text/plain'
        },
        body: JSON.stringify(requestData)
      });

      const responseText = await response.text();
      console.log('Ответ от API создания вопроса:', {
        status: response.status,
        ok: response.ok,
        text: responseText
      });

      if (!response.ok) {
        throw new Error(`Ошибка создания вопроса (${response.status}): ${responseText}`);
      }

      const questionId = responseText.replace(/["'\s]/g, '').trim();
      console.log('Вопрос создан! ID:', questionId);
      
      return questionId;
    };

    const handleSaveAnswers = async () => {
      if (answers.some(answer => !answer.trim())) {
        alert('Заполните все варианты ответов');
        return;
      }

      setIsSaving(true);
      setAnswersDebugInfo('Сохранение ответов...');

      try {
        console.log('Сохранение ответов');
        
        const taskId = currentTask.id;
        const taskName = currentTask.name;
        
        console.log('Текущее задание для ответов:', { taskId, taskName });
        
        if (taskId.startsWith('task-local-') || taskId.startsWith('temp-')) {
          console.log('Локальное задание, сохраняю ответы локально');
          
          const updatedTasks = [...currentSection.tasks];
          updatedTasks[currentTaskIndex] = {
            ...updatedTasks[currentTaskIndex],
            answers: answers,
            correctAnswerIndex: correctAnswerIndex,
            questions: answers.map((answer, index) => ({
              id: `question-local-${Date.now()}-${index}`,
              name: answer,
              answer: index === correctAnswerIndex,
              isFallback: true,
              needsSync: true
            }))
          };

          const updatedSections = [...course.sectionsData];
          updatedSections[currentSectionIndex] = {
            ...updatedSections[currentSectionIndex],
            tasks: updatedTasks
          };

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
          
        } else {
          console.log('Создаю вопросы для задания через API');
          setAnswersDebugInfo('Создаю вопросы через API...');
          
          const questions = [];
          
          for (let i = 0; i < answers.length; i++) {
            const questionName = answers[i];
            const isCorrect = i === correctAnswerIndex;
            
            try {
              setAnswersDebugInfo(`Создаю вопрос ${i + 1} из ${answers.length}...`);
              
              const questionId = await createQuestion(taskId, questionName, isCorrect);
              
              questions.push({
                id: questionId,
                name: questionName,
                answer: isCorrect,
                isFromAPI: true,
                savedAt: new Date().toISOString()
              });
              
              console.log(`Вопрос ${i + 1} создан:`, questionId);
              
            } catch (error) {
              console.error(`Ошибка создания вопроса ${i + 1}:`, error);
              
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
          
          console.log('Все вопросы обработаны:', questions.length);
          
          const hasLocalQuestions = questions.some(q => q.isFallback);
          
          const updatedTasks = [...currentSection.tasks];
          updatedTasks[currentTaskIndex] = {
            ...updatedTasks[currentTaskIndex],
            answers: answers,
            correctAnswerIndex: correctAnswerIndex,
            questions: questions,
            hasQuestions: true,
            questionsSavedAt: new Date().toISOString()
          };

          const updatedSections = [...course.sectionsData];
          updatedSections[currentSectionIndex] = {
            ...updatedSections[currentSectionIndex],
            tasks: updatedTasks
          };

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
          
          if (hasLocalQuestions) {
            setAnswersDebugInfo('Некоторые вопросы сохранены локально');
          } else {
            setAnswersDebugInfo('Все вопросы созданы на сервере');
          }
        }
        
        if (currentTaskIndex < currentSection.tasks.length - 1) {
          setCurrentTaskIndex(currentTaskIndex + 1);
          setAnswers(['', '', '', '']);
          setCorrectAnswerIndex(0);
          setAnswersDebugInfo(`Перехожу к заданию ${currentTaskIndex + 2}`);
          
          await new Promise(resolve => setTimeout(resolve, 500));
        } else {
          const allTasks = currentSection.tasks;
          const hasLocalData = allTasks.some(task => 
            task.isFallback || 
            (task.questions && task.questions.some(q => q.isFallback))
          );
          
          if (hasLocalData) {
            alert('Все задания и ответы сохранены!\n\n' +
                  'Некоторые данные сохранены локально.\n' +
                  'Синхронизируйте их с сервером позже.');
          } else {
            alert('Поздравляем! Раздел полностью создан!\n\n' +
                  'Все данные успешно сохранены на сервере.');
          }
          
          navigate(`/course/${courseId}`);
        }

      } catch (error) {
        console.error('Ошибка сохранения ответов:', error);
        setAnswersDebugInfo(`Ошибка: ${error.message}`);
        
        const userConfirmed = window.confirm(
          `${error.message}\n\n` +
          `Сохранить ответы локально?\n` +
          `Вы сможете синхронизировать их позже.`
        );
        
        if (userConfirmed) {
          const questions = answers.map((answer, index) => ({
            id: `question-local-${Date.now()}-${index}`,
            name: answer,
            answer: index === correctAnswerIndex,
            isFallback: true,
            needsSync: true
          }));
          
          const updatedTasks = [...currentSection.tasks];
          updatedTasks[currentTaskIndex] = {
            ...updatedTasks[currentTaskIndex],
            answers: answers,
            correctAnswerIndex: correctAnswerIndex,
            questions: questions,
            hasQuestions: true,
            isFallback: true
          };

          const updatedSections = [...course.sectionsData];
          updatedSections[currentSectionIndex] = {
            ...updatedSections[currentSectionIndex],
            tasks: updatedTasks
          };

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
          
          if (currentTaskIndex < currentSection.tasks.length - 1) {
            setCurrentTaskIndex(currentTaskIndex + 1);
            setAnswers(['', '', '', '']);
            setCorrectAnswerIndex(0);
            setAnswersDebugInfo('Ответы сохранены локально, перехожу к следующему заданию');
          } else {
            alert('Все ответы сохранены локально!');
            navigate(`/course/${courseId}`);
          }
        }
      } finally {
        setIsSaving(false);
      }
    };

    const handleBackToTask = () => {
      if (currentTaskIndex > 0) {
        setCurrentTaskIndex(currentTaskIndex - 1);
      } else {
        setCurrentStep('assignment');
      }
    };

    if (!currentTask) {
      return (
        <div className="builder-step">
          <h2>Шаг 4: Конструктор ответов</h2>
          <div className="error-message">
            Задание не найдено. Пожалуйста, вернитесь и создайте задания.
          </div>
          <button 
            className="btn-back"
            onClick={() => setCurrentStep('assignment')}
          >
            ← Назад к заданиям
          </button>
        </div>
      );
    }

    return (
      <div className="builder-step">
        <h2>Шаг 4: Конструктор ответов</h2>
        {answersDebugInfo && <div className="debug-info">{answersDebugInfo}</div>}
        <p className="step-info">
          Раздел: <strong>{currentSection?.name}</strong> | 
          Задание {currentTaskIndex + 1} из {currentSection?.tasks?.length}
        </p>
        
        <div className="current-task-info">
          <h3>Задание: {currentTask.name}</h3>
          <p className="task-description-preview">{currentTask.description}</p>
          {currentTask.id?.startsWith('local-') && (
            <p className="task-local-badge">⚠️ Локальное задание</p>
          )}
        </div>

        <div className="answers-container">
          <h3>Добавьте варианты ответов</h3>
          <p className="hint">Отметьте правильный ответ (может быть только один)</p>
          
          {answers.map((answer, index) => (
            <div key={index} className="answer-item">
              <div className="answer-header">
                <label className="answer-label">Вариант {index + 1} *</label>
                <div className="correct-radio-container">
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={correctAnswerIndex === index}
                    onChange={() => setCorrectAnswerIndex(index)}
                    id={`answer-${index}`}
                    className="correct-radio"
                    disabled={isSaving}
                  />
                  <label 
                    htmlFor={`answer-${index}`}
                    className="correct-label"
                  >
                    Правильный ответ
                  </label>
                </div>
              </div>
              <input
                type="text"
                value={answer}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                placeholder={`Введите текст варианта ${index + 1}`}
                className="answer-input"
                disabled={isSaving}
              />
            </div>
          ))}
        </div>

        <div className="navigation-buttons">
          <button 
            className="btn-back"
            onClick={handleBackToTask}
            disabled={isSaving}
          >
            {currentTaskIndex > 0 ? '← Предыдущее задание' : '← Назад к заданиям'}
          </button>
          <button 
            className="next-btn"
            onClick={handleSaveAnswers}
            disabled={answers.some(answer => !answer.trim()) || isSaving}
          >
            {isSaving ? 'Сохранение...' : 
             currentTaskIndex < currentSection.tasks.length - 1 
              ? 'Сохранить и перейти к следующему заданию →' 
              : 'Завершить создание раздела'}
          </button>
        </div>
      </div>
    );
  };

  if (!course) {
    return (
      <div className="loading-container">
        <p>Загрузка курса...</p>
        <p>ID курса: {courseId}</p>
        <p>Очищенный ID: {cleanedCourseId}</p>
      </div>
    );
  }

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