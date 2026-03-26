import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import './CreateCoursePage.css';

function CreateCoursePage() {
  const [courseName, setCourseName] = useState('');
  const [description, setDescription] = useState('');
  const [sectionsCount, setSectionsCount] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [programmingLanguage, setProgrammingLanguage] = useState('');
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
    'R', 'MATLAB', 'SQL', 'HTML/CSS', 'Другой (ввести вручную)'
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting.current) {
      console.log('Предыдущий запрос еще выполняется');
      return;
    }

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
    isSubmitting.current = true;

    try {
      const formData = new FormData();
      formData.append('PL', selectedLanguage);
      formData.append('Title', courseName.trim());
      formData.append('Description', description.trim());
      formData.append('Chapters', parseInt(sectionsCount));
      formData.append('Complexity', parseInt(difficulty));

      if (titleImage) {
        formData.append('TitleImage', titleImage);
      }

      console.log('Отправляю данные на API:');
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + (pair[1] instanceof File ? pair[1].name : pair[1]));
      }

      const token = authService.getToken();
      const headers = { 'accept': 'text/plain' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
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



      navigate(`/course/${courseId}`);

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