import { useState, useEffect } from 'react';
import './CoursesPage.css';

function CoursesPage() {
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [courses, setCourses] = useState([]);

  const programmingLanguages = [
    'JavaScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby',
    'Go', 'Swift', 'Kotlin', 'TypeScript', 'Rust', 'Scala'
  ];

  useEffect(() => {
    const savedCourses = JSON.parse(localStorage.getItem('tutorit-courses') || '[]');
    
    const defaultCourses = [
      { id: 1, title: 'Введение в JavaScript', language: 'JavaScript', sections: 5 },
      { id: 2, title: 'Python для анализа данных', language: 'Python', sections: 8 },
      { id: 3, title: 'Java Spring Framework', language: 'Java', sections: 10 },
      { id: 4, title: 'C++ для начинающих', language: 'C++', sections: 6 },
      { id: 5, title: 'Веб-разработка на PHP', language: 'PHP', sections: 7 },
      { id: 6, title: 'Мобильная разработка на Swift', language: 'Swift', sections: 9 },
    ];

    setCourses([...defaultCourses, ...savedCourses]);
  }, []);

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

  return (
    <div className="courses-page">
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
          </div>
        </aside>

        <main className="courses-list">
          <div className="courses-header">
            <h1>Доступные курсы ({filteredCourses.length})</h1>
            <p className="courses-subtitle">
              Изучайте программирование с помощью наших курсов
            </p>
          </div>
          
          <div className="courses-grid">
            {filteredCourses.length > 0 ? (
              filteredCourses.map(course => (
                <div key={course.id} className="course-card">
                  <h3>{course.title}</h3>
                  
                  <div className="course-meta">
                    <span className="language-tag">{course.language}</span>
                    <span className="sections-tag">{course.sections} разделов</span>
                  </div>

                  <p className="course-description-preview">
                    {course.description || 'Описание курса будет добавлено позже...'}
                  </p>

                  {/* ✅ КНОПКА "ПОСМОТРЕТЬ КУРС" ПОЛНОСТЬЮ УБРАНА */}
                  
                </div>
              ))
            ) : (
              <div className="no-courses">
                <h3>Курсы не найдены</h3>
                <p>Попробуйте изменить параметры фильтров или очистить поиск</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default CoursesPage;