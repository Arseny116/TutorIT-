import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateCoursePage.css';

function CreateCoursePage() {
  const [courseName, setCourseName] = useState('');
  const [description, setDescription] = useState('');
  const [sectionsCount, setSectionsCount] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [programmingLanguage, setProgrammingLanguage] = useState('');
  const [customLanguage, setCustomLanguage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const programmingLanguages = [
    'JavaScript',
    'Python', 
    'Java',
    'C++',
    'C#',
    'PHP',
    'Ruby',
    'Go',
    'Swift',
    'Kotlin',
    'TypeScript',
    'Rust',
    'Scala',
    'R',
    'MATLAB',
    'SQL',
    'HTML/CSS',
    'Другой (ввести вручную)'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    let selectedLanguage = programmingLanguage;
    if (programmingLanguage === 'Другой (ввести вручную)' && customLanguage.trim()) {
      selectedLanguage = customLanguage.trim();
    }
    
    if (!courseName.trim() || !description.trim() || !sectionsCount || !difficulty || !selectedLanguage) {
      setError('Заполните все поля');
      return;
    }

    if (parseInt(sectionsCount) <= 0) {
      setError('Количество разделов должно быть больше 0');
      return;
    }

    setIsLoading(true);

    try {
      const courseData = {
        pl: selectedLanguage,
        title: courseName.trim(),
        description: description.trim(),
        chapters: parseInt(sectionsCount),
        complexity: parseInt(difficulty)
      };

      console.log('Отправляю данные на API:', courseData);

      const response = await fetch('/api/v1/Courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'text/plain'
        },
        body: JSON.stringify(courseData)
      });

      console.log('Ответ сервера:', {
        status: response.status,
        ok: response.ok
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ошибка сервера: ${errorText || response.status}`);
      }

      const courseId = await response.text();
      console.log('Курс создан, ID:', courseId);
      
      const newCourse = {
        id: courseId,
        pl: selectedLanguage,
        title: courseData.title,
        description: courseData.description,
        sections: courseData.chapters,
        difficulty: courseData.complexity,
        language: selectedLanguage,
        sectionsData: [],
        createdAt: new Date().toISOString(),
        isFromAPI: true
      };

      const existingCourses = JSON.parse(localStorage.getItem('tutorit-courses') || '[]');
      existingCourses.push(newCourse);
      localStorage.setItem('tutorit-courses', JSON.stringify(existingCourses));

      
      navigate(`/course/${courseId}`);

    } catch (error) {
      console.error('Ошибка создания курса:', error);
      setError(`Ошибка создания курса: ${error.message}`);
 
      
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="create-course-page">
      <h1>Создание нового курса</h1>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="course-form">
        <div className="form-group">
          <label htmlFor="courseName">Название курса *</label>
          <input
            id="courseName"
            type="text"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            placeholder="Введите название курса"
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Описание курса *</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Опишите содержание курса"
            rows="4"
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="programmingLanguage">Язык программирования *</label>
          <select
            id="programmingLanguage"
            value={programmingLanguage}
            onChange={(e) => setProgrammingLanguage(e.target.value)}
            required
            disabled={isLoading}
          >
            <option value="">Выберите язык программирования</option>
            {programmingLanguages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>

        {programmingLanguage === 'Другой (ввести вручную)' && (
          <div className="form-group">
            <label htmlFor="customLanguage">Введите язык программирования *</label>
            <input
              id="customLanguage"
              type="text"
              value={customLanguage}
              onChange={(e) => setCustomLanguage(e.target.value)}
              placeholder="Например: Pascal, Delphi, Lua, Perl..."
              required
              disabled={isLoading}
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="sectionsCount">Количество разделов *</label>
          <input
            id="sectionsCount"
            type="number"
            value={sectionsCount}
            onChange={(e) => setSectionsCount(e.target.value)}
            placeholder="Введите количество разделов"
            min="1"
            max="20"
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="difficulty">Сложность курса *</label>
          <select
            id="difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            required
            disabled={isLoading}
          >
            <option value="">Выберите сложность</option>
            <option value="1">1 — Начальный уровень</option>
            <option value="2">2 — Средний уровень</option>
            <option value="3">3 — Продвинутый уровень</option>
          </select>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={handleCancel} 
            className="btn-cancel"
            disabled={isLoading}
          >
            Отмена
          </button>
          <button 
            type="submit" 
            className="btn-submit"
            disabled={isLoading}
          >
            {isLoading ? 'Создание...' : 'Создать курс'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateCoursePage;