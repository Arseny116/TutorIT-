import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateCoursePage.css';

function CreateCoursePage() {
  const [courseName, setCourseName] = useState('');
  const [description, setDescription] = useState('');
  const [sectionsCount, setSectionsCount] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!courseName.trim() || !description.trim() || !sectionsCount) {
      alert('Заполните все поля');
      return;
    }

    const newCourse = {
      id: Date.now(),
      title: courseName,
      description: description,
      sections: parseInt(sectionsCount),
      // ✅ ДОБАВЛЯЕМ ПУСТОЙ МАССИВ ДЛЯ РАЗДЕЛОВ
      sectionsData: [],
      createdAt: new Date().toISOString()
    };

    const existingCourses = JSON.parse(localStorage.getItem('tutorit-courses') || '[]');
    existingCourses.push(newCourse);
    localStorage.setItem('tutorit-courses', JSON.stringify(existingCourses));

    navigate(`/course/${newCourse.id}`);
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="create-course-page">
      <h1>Создание нового курса</h1>
      
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
          />
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
          />
        </div>

        <div className="form-actions">
          <button type="button" onClick={handleCancel} className="btn-cancel">
            Отмена
          </button>
          <button type="submit" className="btn-submit">
            Создать курс
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateCoursePage;