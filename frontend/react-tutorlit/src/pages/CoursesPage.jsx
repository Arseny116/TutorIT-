import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import './CoursesPage.css';

const API_BASE_URL = 'http://94.103.85.168:8080';

function CoursesPage() {
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const navigate = useNavigate();

  const programmingLanguages = [
    'JavaScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby',
    'Go', 'Swift', 'Kotlin', 'TypeScript', 'Rust', 'Scala'
  ];

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    return `${API_BASE_URL}/${imagePath}`;
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setIsLoading(true);
      setApiError(null);

      console.log('Загружаем курсы с API...');

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
        console.log('Загружены курсы (сырые):', coursesData);

        let coursesList = Array.isArray(coursesData) ? coursesData : (coursesData.$values || []);

        const filteredCourses = coursesList.filter(course => {
          if (!course || !course.id) return false;
          if (!course.title) return false;
          if (course.title === 'string') return false;
          if (course.pl === 'string') return false;
          return true;
        });

        console.log(`Курсы после фильтрации: ${filteredCourses.length}`);

        const formattedCourses = filteredCourses.map(course => ({
          id: course.id,
          title: course.title,
          description: course.description || 'Описание отсутствует',
          sections: course.chapters || 0,
          difficulty: course.complexity || 1,
          language: course.pl,
          isFromAPI: true,
          titleImage: getImageUrl(course.titleImage)
        }));

        setCourses(formattedCourses);
        console.log(`✅ Отображается ${formattedCourses.length} курсов`);
      } else {
        throw new Error(`API вернул ${response.status}`);
      }

    } catch (error) {
      console.error('❌ Ошибка загрузки курсов:', error);
      setApiError({
        message: 'Не удалось загрузить курсы с сервера',
        details: error.message
      });
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    try {
      const token = authService.getToken();
      const headers = { 'accept': 'text/plain' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/v1/Courses/${courseId}`, {
        method: 'DELETE',
        headers: headers,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Ошибка удаления: ${response.status}`);
      }

      console.log('Курс удален с сервера');

      // После успешного удаления перезагружаем список курсов
      await loadCourses();

    } catch (error) {
      console.error('Ошибка удаления курса:', error);
      alert('Ошибка при удалении курса с сервера');
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

  const handleTakeCourse = (courseId) => {
    navigate(`/learn/${courseId}`);
  };

  const filteredCourses = courses.filter(course => {
    const matchesLanguage = selectedLanguages.length === 0 || selectedLanguages.includes(course.language);
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesLanguage && matchesSearch;
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
                              />
                          ) : (
                              <div className="course-thumbnail-placeholder">
                                📚
                              </div>
                          )}
                          <h3 className="course-title">{course.title}</h3>
                          <button
                              className="delete-course-btn"
                              onClick={() => handleDeleteCourse(course.id)}
                              title="Удалить курс"
                          >
                            ×
                          </button>
                        </div>

                        <div className="course-meta">
                          <span className="language-tag">{course.language}</span>
                          <span className="sections-tag">{course.sections} разделов</span>
                          <span className={`difficulty-tag difficulty-${course.difficulty || 1}`}>
                      Сложность: {course.difficulty || 1}
                    </span>
                          <span className="api-tag">Серверный</span>
                        </div>

                        <p className="course-description-preview">
                          {course.description || 'Описание курса будет добавлено позже...'}
                        </p>

                        <div className="course-actions">
                          <button
                              className="take-course-btn"
                              onClick={() => handleTakeCourse(course.id)}
                          >
                            🚀 Пройти курс
                          </button>
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
      </div>
  );
}

export default CoursesPage;