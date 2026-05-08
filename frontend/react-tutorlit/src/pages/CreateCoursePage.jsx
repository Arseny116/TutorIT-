import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import './CreateCoursePage.css';

function CreateCoursePage() {
  const [courseName, setCourseName] = useState('');
  const [description, setDescription] = useState('');
  const [sectionsCount, setSectionsCount] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [customLanguage, setCustomLanguage] = useState('');
  const [titleImage, setTitleImage] = useState(null);
  const [titleImagePreview, setTitleImagePreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const isSubmitting = useRef(false);

  const programmingLanguages = [
    'JavaScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby',
    'Go', 'Swift', 'Kotlin', 'TypeScript', 'Rust', 'Scala',
    'R', 'MATLAB', 'SQL', 'HTML/CSS', 'Другой'
  ];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTitleImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setTitleImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleLanguage = (language) => {
    if (language === 'Другой') {
      const input = prompt('Введите язык программирования:');
      if (input && input.trim() && !selectedLanguages.includes(input.trim())) {
        setSelectedLanguages([...selectedLanguages, input.trim()]);
      }
      return;
    }

    setSelectedLanguages(prev =>
        prev.includes(language)
            ? prev.filter(l => l !== language)
            : [...prev, language]
    );
  };

  const removeLanguage = (languageToRemove) => {
    setSelectedLanguages(prev => prev.filter(l => l !== languageToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting.current) {
      console.log('Предыдущий запрос еще выполняется');
      return;
    }

    setError('');

    if (selectedLanguages.length === 0) {
      setError('Выберите хотя бы один язык программирования');
      return;
    }

    if (!courseName.trim() || !description.trim() || !sectionsCount || !difficulty) {
      setError('Заполните все поля');
      return;
    }

    if (courseName.trim().length > 300) {
      setError('Название курса не должно превышать 300 символов');
      return;
    }

    if (parseInt(sectionsCount) <= 0) {
      setError('Количество разделов должно быть больше 0');
      return;
    }

    setIsLoading(true);
    isSubmitting.current = true;

    try {
      const token = authService.getToken();
      const headers = { 'accept': 'text/plain' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const formData = new FormData();
      formData.append('PL', JSON.stringify(selectedLanguages));
      formData.append('Title', courseName.trim());
      formData.append('Description', description.trim());
      formData.append('Chapters', parseInt(sectionsCount));
      formData.append('Complexity', parseInt(difficulty));

      if (titleImage) {
        formData.append('TitleImage', titleImage);
      }

      console.log('Отправляю данные через FormData:');
      console.log('PL (языки):', selectedLanguages);
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + (pair[1] instanceof File ? pair[1].name : pair[1]));
      }

      const response = await fetch('/api/v1/Courses', {
        method: 'POST',
        headers: headers,
        body: formData,
        credentials: 'include'
      });

      const responseText = await response.text();
      console.log('Ответ сервера:', response.status, responseText);

      if (response.status === 401) {
        authService.logout();
        alert('Сессия истекла. Пожалуйста, войдите заново.');
        navigate('/');
        return;
      }

      if (!response.ok) {
        throw new Error(`Ошибка сервера: ${response.status} - ${responseText}`);
      }

      const courseId = responseText.replace(/["'\s]/g, '').trim();
      console.log('Курс создан на сервере, ID курса:', courseId);

      navigate(`/course/${courseId}/builder`);

    } catch (error) {
      console.error('Ошибка создания курса:', error);
      setError(`Ошибка создания курса: ${error.message}`);

    } finally {
      setIsLoading(false);
      setTimeout(() => {
        isSubmitting.current = false;
      }, 1000);
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
                maxLength="300"
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
            <label>Языки программирования *</label>
            <div className="languages-selector">
              <div className="languages-buttons">
                {programmingLanguages.map(lang => (
                    <button
                        key={lang}
                        type="button"
                        className={`language-btn ${selectedLanguages.includes(lang) ? 'active' : ''}`}
                        onClick={() => toggleLanguage(lang)}
                        disabled={isLoading}
                    >
                      {lang}
                    </button>
                ))}
              </div>
              {selectedLanguages.length > 0 && (
                  <div className="selected-languages">
                    <span className="selected-label">Выбрано:</span>
                    <div className="selected-languages-list">
                      {selectedLanguages.map(lang => (
                          <span key={lang} className="selected-language-tag">
                        {lang}
                            <button
                                type="button"
                                className="remove-language"
                                onClick={() => removeLanguage(lang)}
                                disabled={isLoading}
                            >
                          ×
                        </button>
                      </span>
                      ))}
                    </div>
                  </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="titleImage">Титульная картинка</label>
            <input
                id="titleImage"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isLoading}
            />
            {titleImagePreview && (
                <div style={{ marginTop: '10px' }}>
                  <img src={titleImagePreview} alt="Предпросмотр" style={{ maxWidth: '200px', maxHeight: '150px', borderRadius: '8px' }} />
                </div>
            )}
          </div>

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