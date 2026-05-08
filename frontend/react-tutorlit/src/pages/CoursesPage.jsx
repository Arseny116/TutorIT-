import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import './CoursesPage.css';

const API_BASE_URL = 'http://89.110.94.112:8080';

function CoursesPage() {
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [enrollingCourseId, setEnrollingCourseId] = useState(null);
  const [enrolledStatus, setEnrolledStatus] = useState({});
  const [notification, setNotification] = useState({ show: false, message: '', type: 'info' });

  const navigate = useNavigate();

  const programmingLanguages = [
    'JavaScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby',
    'Go', 'Swift', 'Kotlin', 'TypeScript', 'Rust', 'Scala'
  ];

  const showNotification = (message, type = 'info') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'info' }), 3000);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    return `${API_BASE_URL}/${imagePath}`;
  };

  // Функция для парсинга языков из формата ["[\"JavaScript\"]", "[\"Python\"]"]
  const parseLanguages = (languages) => {
    if (!languages) return [];

    // Если уже массив
    if (Array.isArray(languages)) {
      const result = [];
      for (const item of languages) {
        if (typeof item === 'string') {
          try {
            // Пробуем распарсить как JSON
            const parsed = JSON.parse(item);
            if (Array.isArray(parsed)) {
              for (const lang of parsed) {
                if (lang && !result.includes(lang)) {
                  result.push(lang);
                }
              }
            } else if (parsed && !result.includes(parsed)) {
              result.push(parsed);
            }
          } catch {
            // Если не парсится, убираем кавычки и скобки
            let cleaned = item;
            if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
              cleaned = cleaned.slice(1, -1);
            }
            if (cleaned.startsWith('[') && cleaned.endsWith(']')) {
              cleaned = cleaned.slice(1, -1);
            }
            cleaned = cleaned.replace(/\\"/g, '"');
            if (cleaned.includes(',')) {
              const parts = cleaned.split(',').map(l => l.trim().replace(/^["']|["']$/g, ''));
              for (const part of parts) {
                if (part && !result.includes(part)) {
                  result.push(part);
                }
              }
            } else if (cleaned && !result.includes(cleaned)) {
              result.push(cleaned);
            }
          }
        } else if (typeof item === 'object' && item !== null) {
          if (item.name && !result.includes(item.name)) {
            result.push(item.name);
          } else if (item.language && !result.includes(item.language)) {
            result.push(item.language);
          }
        }
      }
      return result;
    }

    // Если строка
    if (typeof languages === 'string') {
      try {
        const parsed = JSON.parse(languages);
        if (Array.isArray(parsed)) {
          return parsed;
        }
        return [languages];
      } catch {
        let cleaned = languages;
        if (cleaned.startsWith('[') && cleaned.endsWith(']')) {
          cleaned = cleaned.slice(1, -1);
        }
        if (cleaned.includes(',')) {
          return cleaned.split(',').map(l => l.trim().replace(/^["']|["']$/g, ''));
        }
        return [cleaned.replace(/^["']|["']$/g, '')];
      }
    }

    return [];
  };

  // Проверка, соответствует ли курс выбранным языкам
  const matchesLanguage = (courseLanguages, selectedLangs) => {
    if (selectedLangs.length === 0) return true;
    const courseLangsArray = parseLanguages(courseLanguages);
    return selectedLangs.some(selectedLang => courseLangsArray.includes(selectedLang));
  };

  // Проверка, полностью ли создан курс
  const isCourseFullyCreated = async (courseId, expectedChapters) => {
    try {
      const token = authService.getToken();
      const headers = { 'accept': 'text/plain' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const chaptersResponse = await fetch(`/api/v1/Chapters/${courseId}`, {
        method: 'GET',
        headers: headers,
        credentials: 'include'
      });

      if (!chaptersResponse.ok) return false;

      let chaptersData = await chaptersResponse.json();
      let chapters = Array.isArray(chaptersData) ? chaptersData : (chaptersData.$values || []);

      if (chapters.length !== expectedChapters) return false;

      for (const chapter of chapters) {
        const chapterId = chapter.id || chapter.$id;

        const theoriesResponse = await fetch(`/api/v1/Theories?CharterId=${chapterId}`, {
          method: 'GET',
          headers: headers,
          credentials: 'include'
        });

        if (!theoriesResponse.ok) return false;

        let theoriesData = await theoriesResponse.json();
        let theories = Array.isArray(theoriesData) ? theoriesData : (theoriesData.$values || []);

        const expectedTheories = chapter.numberTheoryBloks || 0;
        if (theories.length !== expectedTheories) return false;

        for (const theory of theories) {
          if (!theory.article || theory.article.trim() === '') return false;
        }

        const tasksResponse = await fetch(`/api/v1/TasksCreators/${chapterId}`, {
          method: 'GET',
          headers: headers,
          credentials: 'include'
        });

        if (!tasksResponse.ok) return false;

        let tasksData = await tasksResponse.json();
        let tasks = Array.isArray(tasksData) ? tasksData : (tasksData.$values || []);

        const expectedTasks = chapter.numberTasks || 0;
        if (tasks.length !== expectedTasks) return false;

        for (const task of tasks) {
          if (!task.hint || task.hint.trim() === '') return false;

          const questionsResponse = await fetch(`/api/v1/Questions?TaskCreater=${task.id}`, {
            method: 'GET',
            headers: headers,
            credentials: 'include'
          });

          if (!questionsResponse.ok) return false;

          let questionsData = await questionsResponse.json();
          let questions = Array.isArray(questionsData) ? questionsData : (questionsData.$values || []);

          if (questions.length !== 4) return false;

          for (const question of questions) {
            if (!question.name || question.name.trim() === '') return false;
          }

          const hasCorrectAnswer = questions.some(q => q.answer === true);
          if (!hasCorrectAnswer) return false;
        }
      }

      return true;
    } catch (error) {
      return false;
    }
  };

  // Удаление незаполненного курса
  const deleteEmptyCourse = async (courseId) => {
    try {
      const token = authService.getToken();
      const headers = { 'accept': 'text/plain' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      await fetch(`/api/v1/Courses/${courseId}`, {
        method: 'DELETE',
        headers: headers,
        credentials: 'include'
      });
    } catch (error) {
      // Тихо удаляем
    }
  };

  const loadEnrolledStatus = async () => {
    try {
      const token = authService.getToken();
      if (!token) return;

      const userData = await authService.fetchUserData();
      if (userData && userData.enrolledCourseIds) {
        const status = {};
        userData.enrolledCourseIds.forEach(id => {
          status[id] = true;
        });
        setEnrolledStatus(status);
      }
    } catch (error) {
      console.error('Ошибка загрузки статуса записи:', error);
    }
  };

  const handleEnroll = async (courseId) => {
    if (!authService.isAuthenticated()) {
      showNotification('Сначала нужно войти в аккаунт', 'error');
      return;
    }

    if (enrolledStatus[courseId]) {
      showNotification('Вы уже записаны на этот курс', 'info');
      return;
    }

    setEnrollingCourseId(courseId);
    try {
      const result = await authService.enrollToCourse(courseId);
      if (result.success) {
        setEnrolledStatus(prev => ({ ...prev, [courseId]: true }));
        showNotification('✅ Вы успешно записались на курс!', 'success');
      } else {
        showNotification(result.error || '❌ Ошибка при записи на курс', 'error');
      }
    } catch (error) {
      console.error('Ошибка:', error);
      showNotification('Произошла ошибка при записи', 'error');
    } finally {
      setEnrollingCourseId(null);
    }
  };

  const handleGoToCourse = (courseId) => {
    if (!enrolledStatus[courseId]) {
      showNotification('Сначала нужно записаться на курс', 'warning');
      return;
    }
    navigate(`/learn/${courseId}`);
  };

  const handleOpenDescription = (course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
  };

  useEffect(() => {
    loadCourses();
    loadEnrolledStatus();
  }, []);

  const loadCourses = async () => {
    try {
      setIsLoading(true);
      setApiError(null);

      const token = authService.getToken();
      const headers = { 'accept': 'text/plain' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/v1/Courses/GetAllCourses', {
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

      if (response.ok) {
        let coursesData = await response.json();
        let coursesList = Array.isArray(coursesData) ? coursesData : (coursesData.$values || []);

        const validCourses = [];

        for (const course of coursesList) {
          if (!course || !course.id) continue;
          if (!course.title || course.title === 'string') continue;

          const expectedChapters = course.chapters || 0;
          const isFullyCreated = await isCourseFullyCreated(course.id, expectedChapters);

          if (isFullyCreated) {
            validCourses.push(course);
          } else {
            await deleteEmptyCourse(course.id);
          }
        }

        const formattedCourses = validCourses.map(course => {
          // Парсим языки из любого формата
          let languagesArray = [];

          // Проверяем поле pl
          if (course.pl) {
            languagesArray = parseLanguages(course.pl);
          }
          // Проверяем поле languages
          else if (course.languages) {
            languagesArray = parseLanguages(course.languages);
          }

          // Если все еще пусто, проверяем другие возможные поля
          if (languagesArray.length === 0) {
            if (course.programmingLanguage) {
              languagesArray = [course.programmingLanguage];
            } else if (course.language) {
              languagesArray = [course.language];
            }
          }

          console.log(`Курс "${course.title}" - языки:`, languagesArray);

          return {
            id: course.id,
            title: course.title,
            description: course.description || 'Описание отсутствует',
            sections: course.chapters || 0,
            difficulty: course.complexity || 1,
            languagesArray: languagesArray,
            titleImage: getImageUrl(course.titleImage)
          };
        });

        setCourses(formattedCourses);
      } else {
        throw new Error(`API вернул ${response.status}`);
      }

    } catch (error) {
      console.error('Ошибка загрузки курсов:', error);
      setApiError({
        message: 'Не удалось загрузить курсы с сервера',
        details: error.message
      });
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const toggleLanguage = (language) => {
    setSelectedLanguages(prev =>
        prev.includes(language)
            ? prev.filter(l => l !== language)
            : [...prev, language]
    );
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLang = selectedLanguages.length === 0 ||
        selectedLanguages.some(lang => (course.languagesArray || []).includes(lang));
    return matchesSearch && matchesLang;
  });

  if (isLoading) {
    return (
        <div className="courses-page">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Загрузка курсов...</p>
          </div>
        </div>
    );
  }

  return (
      <div className="courses-page">
        <header className="courses-header-nav">
          <button className="back-to-home-btn" onClick={handleBackToHome}>
            ← На главную
          </button>
        </header>

        <div className="courses-layout">
          <aside className="filters-sidebar">
            <div className="filters-section">
              <h3>Фильтры</h3>

              {apiError && (
                  <div className="api-error-banner">
                    <h4>⚠️ {apiError.message}</h4>
                    <p>{apiError.details}</p>
                  </div>
              )}

              <div className="filter-group">
                <label>Поиск по названию</label>
                <input
                    type="text"
                    placeholder="Введите название курса..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
              </div>

              <div className="filter-group">
                <label>Языки программирования</label>
                <div className="languages-list">
                  {programmingLanguages.map(language => (
                      <label key={language} className="language-checkbox">
                        <input
                            type="checkbox"
                            checked={selectedLanguages.includes(language)}
                            onChange={() => toggleLanguage(language)}
                        />
                        <span>{language}</span>
                      </label>
                  ))}
                </div>
              </div>

              <button
                  className="reset-filters-btn"
                  onClick={() => {
                    setSelectedLanguages([]);
                    setSearchTerm('');
                  }}
              >
                Сбросить фильтры
              </button>
            </div>
          </aside>

          <main className="courses-list">
            <div className="courses-header">
              <h1>Доступные курсы ({filteredCourses.length})</h1>
              <p className="courses-subtitle">
                Выберите курс для обучения
              </p>
            </div>

            <div className="courses-grid">
              {filteredCourses.length > 0 ? (
                  filteredCourses.map(course => (
                      <div key={course.id} className="course-card">
                        <div className="course-card-row">
                          {course.titleImage ? (
                              <img
                                  src={course.titleImage}
                                  alt={course.title}
                                  className="course-thumbnail"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.style.display = 'none';
                                    if (e.target.nextSibling) {
                                      e.target.nextSibling.style.display = 'flex';
                                    }
                                  }}
                              />
                          ) : null}
                          <div
                              className="course-thumbnail-placeholder"
                              style={{ display: course.titleImage ? 'none' : 'flex' }}
                          >
                            📚
                          </div>
                          <h3 className="course-title">{course.title}</h3>
                        </div>

                        <div className="course-meta">
                    <span className="language-tag">
                      {(course.languagesArray || []).join(', ') || 'Не указан'}
                    </span>
                          <span className="sections-tag">{course.sections} разделов</span>
                          <span className={`difficulty-tag difficulty-${course.difficulty || 1}`}>
                      Сложность: {course.difficulty || 1}
                    </span>
                          <span className="api-tag">Серверный</span>
                        </div>

                        <p className="course-description-preview">
                          {course.description}
                        </p>

                        <div className="course-actions">
                          <button
                              className="description-btn"
                              onClick={() => handleOpenDescription(course)}
                          >
                            📖 Описание
                          </button>

                          {enrolledStatus[course.id] ? (
                              <button
                                  className="enrolled-btn"
                                  onClick={() => handleGoToCourse(course.id)}
                              >
                                ✅ Пройти курс
                              </button>
                          ) : (
                              <button
                                  className="enroll-btn"
                                  onClick={() => handleEnroll(course.id)}
                                  disabled={enrollingCourseId === course.id}
                              >
                                {enrollingCourseId === course.id ? 'Запись...' : '📝 Записаться'}
                              </button>
                          )}
                        </div>
                      </div>
                  ))
              ) : (
                  <div className="no-courses">
                    <h3>Курсы не найдены</h3>
                    <p>Попробуйте изменить параметры фильтров</p>
                    <button className="back-to-home-btn" onClick={handleBackToHome}>
                      ← Вернуться на главную
                    </button>
                  </div>
              )}
            </div>
          </main>
        </div>

        {isModalOpen && selectedCourse && (
            <div className="course-modal-overlay" onClick={handleCloseModal}>
              <div className="course-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="course-modal-close" onClick={handleCloseModal}>×</button>

                {selectedCourse.titleImage && (
                    <div className="course-modal-image">
                      <img src={selectedCourse.titleImage} alt={selectedCourse.title} />
                    </div>
                )}

                <h2 className="course-modal-title">{selectedCourse.title}</h2>

                <div className="course-modal-meta">
              <span className="modal-language">
                Язык: {(selectedCourse.languagesArray || []).join(', ') || 'Не указан'}
              </span>
                  <span className="modal-sections">
                Разделов: {selectedCourse.sections}
              </span>
                  <span className="modal-difficulty">
                Сложность: {selectedCourse.difficulty || 1}
              </span>
                </div>

                <div className="course-modal-description">
                  <h3>Описание курса:</h3>
                  <p>{selectedCourse.description}</p>
                </div>

                <div className="course-modal-actions">
                  {enrolledStatus[selectedCourse.id] ? (
                      <button
                          className="modal-go-course-btn"
                          onClick={() => {
                            handleCloseModal();
                            handleGoToCourse(selectedCourse.id);
                          }}
                      >
                        ✅ Пройти курс
                      </button>
                  ) : (
                      <button
                          className="modal-enroll-btn"
                          onClick={() => {
                            handleEnroll(selectedCourse.id);
                            handleCloseModal();
                          }}
                          disabled={enrollingCourseId === selectedCourse.id}
                      >
                        {enrollingCourseId === selectedCourse.id ? 'Запись...' : '📝 Записаться на курс'}
                      </button>
                  )}
                </div>
              </div>
            </div>
        )}

        {notification.show && (
            <div className={`notification-toast ${notification.type}`}>
              <div className="notification-content">
            <span className="notification-icon">
              {notification.type === 'error' ? '⚠️' : notification.type === 'success' ? '✅' : 'ℹ️'}
            </span>
                <span className="notification-text">{notification.message}</span>
              </div>
            </div>
        )}
      </div>
  );
}

export default CoursesPage;