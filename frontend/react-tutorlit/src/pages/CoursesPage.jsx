import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CoursesPage.css';

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

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setIsLoading(true);
      setApiError(null);

      console.log('Загружаем курсы с API...');

      let apiCourses = [];

      try {
        const response = await fetch('/api/v1/Courses/GetAllCourses', {
          method: 'GET',
          headers: {
            'accept': 'text/plain'
          }
        });

        if (response.ok) {
          const coursesData = await response.json();
          if (Array.isArray(coursesData)) {
            apiCourses = coursesData;
            console.log(`✅ Успешно загружено ${apiCourses.length} курсов`);
          } else {
            throw new Error('API вернул некорректный формат данных');
          }
        } else {
          throw new Error(`API вернул ${response.status}`);
        }
      } catch (error) {
        console.log('Ошибка загрузки с API:', error.message);
        setApiError({
          message: 'Не удалось загрузить курсы с сервера',
          details: error.message
        });
      }

      const formattedCourses = apiCourses
          .filter(course => course && course.id)
          .map(course => ({
            id: course.id,
            title: course.title || 'Без названия',
            description: course.description || 'Описание отсутствует',
            sections: course.chapters || 0,
            difficulty: course.complexity || 1,
            language: course.pl || 'Не указан',
            pl: course.pl,
            isFromAPI: true,
            titleImage: course.titleImage || null,
            evaluation: course.evaluation || 0,
            subscribe: course.subscribe || 0,
            reviews: course.reviews || []
          }));

      const localCourses = JSON.parse(localStorage.getItem('tutorit-courses') || '[]')
          .filter(course => !course.isFromAPI)
          .map(course => ({
            ...course,
            isFromAPI: false
          }));

      const allCourses = [...formattedCourses, ...localCourses];

      setCourses(allCourses);

    } catch (error) {
      console.error('❌ Ошибка загрузки курсов:', error);

      const savedCourses = JSON.parse(localStorage.getItem('tutorit-courses') || '[]')
          .filter(course => !course.isFromAPI);

      setCourses(savedCourses);

      setApiError({
        message: 'Не удалось загрузить курсы с сервера',
        details: 'Используются локальные курсы'
      });

    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId, isFromAPI = false) => {
    if (isFromAPI) {
      try {
        const response = await fetch(`/api/v1/Courses/${courseId}`, {
          method: 'DELETE',
          headers: {
            'accept': 'text/plain'
          }
        });

        if (!response.ok) {
          throw new Error(`Ошибка удаления: ${response.status}`);
        }

        console.log('Курс удален с сервера');
      } catch (error) {
        console.error('Ошибка удаления курса:', error);
        alert('Ошибка при удалении курса с сервера');
        return;
      }
    }

    if (!isFromAPI) {
      const existingCourses = JSON.parse(localStorage.getItem('tutorit-courses') || '[]');
      const updatedCourses = existingCourses.filter(course => course.id !== courseId);
      localStorage.setItem('tutorit-courses', JSON.stringify(updatedCourses));
    }

    setCourses(prev => prev.filter(course => course.id !== courseId));
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
          <button className="refresh-courses-btn" onClick={loadCourses} disabled={isLoading}>
            🔄 Обновить
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
                              onClick={() => handleDeleteCourse(course.id, course.isFromAPI)}
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

                          {course.isFromAPI ? (
                              <span className="api-tag">Серверный</span>
                          ) : (
                              <span className="user-tag">Ваш курс</span>
                          )}
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