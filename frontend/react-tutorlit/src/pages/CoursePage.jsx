import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './CoursePage.css';

function CoursePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);

  useEffect(() => {
    const existingCourses = JSON.parse(localStorage.getItem('tutorit-courses') || '[]');
    const foundCourse = existingCourses.find(c => c.id === parseInt(courseId));
    
    if (foundCourse) {
      setCourse(foundCourse);
    } else {
      setCourse({
        title: 'Курс не найден',
        description: 'Запрошенный курс не существует',
        assignments: 0
      });
    }
  }, [courseId]);

  const handleBack = () => {
    navigate('/');
  };

  if (!course) {
    return <div className="loading">Загрузка...</div>;
  }

  return (
    <div className="course-page">
      <header className="course-header">
        <button onClick={handleBack} className="back-button">
          ← Назад
        </button>
        <h1 className="course-title">{course.title}</h1>
      </header>

      <div className="course-layout">
        <aside className="course-sidebar-left">
          <div className="sidebar-section">
            <div className="assignments-count">
              <h3>Количество заданий</h3>
              <span className="count">{course.assignments}</span>
            </div>
            
            <div className="evalution-section">
              <h4>Evalution</h4>
              <p>Текст</p>
            </div>
            
            <div className="subscribe-section">
              <h4>Subscribe</h4>
              <p>Текст</p>
            </div>
          </div>
        </aside>

        <main className="course-main">
          <section className="course-description">
            <h2>Описание курса</h2>
            <p>{course.description}</p>
          </section>

          <section className="reviews-section">
            <h2>Reviews</h2>
            <p>Отзывы о курсе будут здесь</p>
          </section>
        </main>

        <aside className="course-sidebar-right">
          <div className="sidebar-section">
            <div className="name-section">
              <h3>A name</h3>
              <p>Текст</p>
            </div>
            
            <div className="description-section">
              <h4>A description</h4>
              <p>Текст</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default CoursePage;