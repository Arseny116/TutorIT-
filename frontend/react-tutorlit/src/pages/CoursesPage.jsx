import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CoursesPage.css';

function CoursesPage() {
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
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
      
      console.log('Загружаем курсы с API...');
      
      const response = await fetch('/api/v1/Courses');
      
      if (response.ok) {
        const apiCourses = await response.json();
        console.log('Курсы загружены с API:', apiCourses);
        
        const formattedCourses = apiCourses.map(course => ({
          id: course.id,
          title: course.title,
          description: course.description,
          sections: course.chapters || 0,
          difficulty: course.complexity || 1,
          language: getLanguageFromTitle(course.title),
          isFromAPI: true,
          createdAt: new Date().toISOString()
        }));

        const localCourses = JSON.parse(localStorage.getItem('tutorit-courses') || '[]')
          .filter(course => !course.isFromAPI);

        setCourses([...formattedCourses, ...localCourses]);
        
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

    } catch (error) {
      console.error('Ошибка загрузки с API:', error);
      
      const savedCourses = JSON.parse(localStorage.getItem('tutorit-courses') || '[]');
      const defaultCourses = [
        { id: 1, title: 'Введение в JavaScript', language: 'JavaScript', sections: 5, difficulty: 1, isDefault: true },
        { id: 2, title: 'Python для анализа данных', language: 'Python', sections: 8, difficulty: 2, isDefault: true },
        { id: 3, title: 'Java Spring Framework', language: 'Java', sections: 10, difficulty: 3, isDefault: true },
        { id: 4, title: 'C++ для начинающих', language: 'C++', sections: 6, difficulty: 1, isDefault: true },
        { id: 5, title: 'Веб-разработка на PHP', language: 'PHP', sections: 7, difficulty: 2, isDefault: true },
        { id: 6, title: 'Мобильная разработка на Swift', language: 'Swift', sections: 9, difficulty: 2, isDefault: true },
      ];

      setCourses([...defaultCourses, ...savedCourses]);
    } finally {
      setIsLoading(false);
    }
  };

  const getLanguageFromTitle = (title) => {
    const lowerTitle = title.toLowerCase();
    for (const lang of programmingLanguages) {
      if (lowerTitle.includes(lang.toLowerCase())) {
        return lang;
      }
    }
    return 'Other';
  };

  const handleDeleteCourse = async (courseId, isDefault = false, isFromAPI = false) => {
    if (isDefault) {
      alert('Системные курсы нельзя удалить');
      return;
    }

    if (window.confirm('Вы уверены, что хотите удалить этот курс?')) {
      if (isFromAPI) {
        try {
          const response = await fetch(`/api/v1/Courses/${courseId}`, {
            method: 'DELETE'
          });
          
          if (!response.ok) {
            throw new Error('Ошибка при удалении курса с сервера');
          }
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
      
      alert('Курс успешно удален');
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
    const matchesLanguage = selectedLanguages.length === 0 || selectedLanguages.includes(course.language);
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesLanguage && matchesSearch;
  });

  if (isLoading) {
    return <div className="courses-page"><div className="loading">Загрузка курсов...</div></div>;
  }

  return (
    <div className="courses-page">
      <header className="courses-header-nav">
        <button 
          className="back-to-home-btn"
          onClick={handleBackToHome}
        >
          ← Назад на главную
        </button>
      </header>

      <div className="courses-layout">
        <aside className="filters-sidebar">
          <div className="filters-section">
            <h3>Фильтры</h3>
            
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

            <button 
              className="refresh-courses-btn"
              onClick={loadCourses}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginTop: '1rem'
              }}
            >
              {isLoading ? 'Обновление...' : '🔄 Обновить с сервера'}
            </button>
          </div>
        </aside>

        <main className="courses-list">
          <div className="courses-header">
            <h1>Доступные курсы ({filteredCourses.length})</h1>
            <p className="courses-subtitle">
              {filteredCourses.some(course => !course.isDefault) && 
                'Ваши созданные курсы можно удалить'
              }
            </p>
          </div>
          
          <div className="courses-grid">
            {filteredCourses.length > 0 ? (
              filteredCourses.map(course => (
                <div key={course.id} className="course-card">
                  <div className="course-header">
                    <h3>{course.title}</h3>
                    {!course.isDefault && (
                      <button 
                        className="delete-course-btn"
                        onClick={() => handleDeleteCourse(course.id, course.isDefault, course.isFromAPI)}
                        title="Удалить курс"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  
                  <div className="course-meta">
                    <span className="language-tag">{course.language}</span>
                    <span className="sections-tag">{course.sections} разделов</span>
                    <span className={`difficulty-tag difficulty-${course.difficulty || 1}`}>
                      Сложность: {course.difficulty || 1}
                    </span>
                    {course.isDefault ? (
                      <span className="system-tag">Системный</span>
                    ) : course.isFromAPI ? (
                      <span className="api-tag">Серверный</span>
                    ) : (
                      <span className="user-tag">Ваш курс</span>
                    )}
                  </div>

                  <p className="course-description-preview">
                    {course.description || 'Описание курса будет добавлено позже...'}
                  </p>

                  <div className="course-date">
                    {course.isFromAPI ? (
                      <span>Загружено с сервера</span>
                    ) : !course.isDefault && course.createdAt ? (
                      <span>Создан: {new Date(course.createdAt).toLocaleDateString()}</span>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-courses">
                <h3>Курсы не найдены</h3>
                <p>Попробуйте изменить параметры фильтров или очистить поиск</p>
                <button 
                  className="back-to-home-btn empty-state-btn"
                  onClick={handleBackToHome}
                >
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