import { useState } from 'react';
import './CoursesPage.css';

function CoursesPage() {
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');


  const programmingLanguages = [
    'JavaScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby',
    'Go', 'Swift', 'Kotlin', 'TypeScript', 'Rust', 'Scala'
  ];

  const toggleLanguage = (language) => {
    setSelectedLanguages(prev =>
      prev.includes(language)
        ? prev.filter(l => l !== language)
        : [...prev, language]
    );
  };

  const courses = [
    { id: 1, title: 'Введение в JavaScript', language: 'JavaScript' },
    { id: 2, title: 'Python для анализа данных', language: 'Python' },
    { id: 3, title: 'Java Spring Framework', language: 'Java' },
    { id: 4, title: 'C++ для начинающих', language: 'C++' },
    { id: 5, title: 'Веб-разработка на PHP', language: 'PHP' },
    { id: 6, title: 'Мобильная разработка на Swift', language: 'Swift' },
  ];

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
          <h1>Доступные курсы</h1>
          
          <div className="courses-grid">
            {filteredCourses.length > 0 ? (
              filteredCourses.map(course => (
                <div key={course.id} className="course-card">
                  <h3>{course.title}</h3>
                  <div className="course-meta">
                    <span className="language-tag">{course.language}</span>
                  </div>
                  <button className="view-course-btn">
                    Посмотреть курс
                  </button>
                </div>
              ))
            ) : (
              <div className="no-courses">
                <p>Курсы не найдены. Попробуйте изменить фильтры.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default CoursesPage;