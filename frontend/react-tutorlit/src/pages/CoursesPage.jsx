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

  // Состояния для модального окна описания
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Состояния для записи на курс
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

  const parseLanguages = (languages) => {
    if (!languages) return [];
    if (Array.isArray(languages)) return languages;
    if (typeof languages === 'string') {
      try {
        const parsed = JSON.parse(languages);
        if (Array.isArray(parsed)) return parsed;
        return [languages];
      } catch {
        return [languages];
      }
    }
    return [];
  };

  const formatLanguages = (languages) => {
    const langArray = parseLanguages(languages);
    if (langArray.length === 0) return 'Не указан';
    return langArray.join(', ');
  };

  const matchesLanguage = (courseLanguages, selectedLangs) => {
    if (selectedLangs.length === 0) return true;
    const courseLangsArray = parseLanguages(courseLanguages);
    return selectedLangs.some(selectedLang => courseLangsArray.includes(selectedLang));
  };

  // Загрузка статуса записи для всех курсов
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

  // Запись на курс
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

  // Переход на страницу курса (только для записанных)
  const handleGoToCourse = (courseId) => {
    if (!enrolledStatus[courseId]) {
      showNotification('Сначала нужно записаться на курс', 'warning');
      return;
    }
    navigate(`/learn/${courseId}`);
  };

  // Открыть модальное окно с описанием
  const handleOpenDescription = (course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  // Закрыть модальное окно
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

        const filteredCourses = coursesList.filter(course => {
          if (!course || !course.id) return false;
          if (!course.title) return false;
          if (course.title === 'string') return false;
          return true;
        });

        const formattedCourses = filteredCourses.map(course => ({
          id: course.id,
          title: course.title,
          description: course.description || 'Описание отсутствует',
          sections: course.chapters || 0,
          difficulty: course.complexity || 1,
          languagesRaw: course.pl,
          languages: parseLanguages(course.pl),
          isFromAPI: true,
          titleImage: getImageUrl(course.titleImage)
        }));

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
    const matchesLang = matchesLanguage(course.languagesRaw, selectedLanguages);
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
                Запишитесь на курс, чтобы начать обучение
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
                      {formatLanguages(course.languagesRaw)}
                    </span>
                          <span className="sections-tag">{course.sections} разделов</span>
                          <span className={`difficulty-tag difficulty-${course.difficulty || 1}`}>
                      Сложность: {course.difficulty || 1}
                    </span>
                          <span className="api-tag">Серверный</span>
                        </div>

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

        {/* Модальное окно с описанием курса */}
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
                Язык: {formatLanguages(selectedCourse.languagesRaw)}
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

        {/* Уведомление */}
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