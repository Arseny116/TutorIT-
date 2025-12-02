import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './CoursePage.css';

function CoursePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCourse = async () => {
      setIsLoading(true);
      
      const existingCourses = JSON.parse(localStorage.getItem('tutorit-courses') || '[]');
      const foundCourse = existingCourses.find(c => c.id == courseId);
      
      if (foundCourse) {
        setCourse(foundCourse);
      } else {
        try {
          const response = await fetch(`/api/v1/Courses/${courseId}`);
          if (response.ok) {
            const apiCourse = await response.json();
            const formattedCourse = {
              id: apiCourse.id,
              title: apiCourse.title,
              description: apiCourse.description,
              sections: apiCourse.chapters || apiCourse.numberChapters?.length || 0,
              difficulty: apiCourse.complexity || 1,
              isFromAPI: true
            };
            setCourse(formattedCourse);
          } else {
            setCourse({
              title: 'Курс не найден',
              description: 'Запрошенный курс не существует',
              sections: 0
            });
          }
        } catch (error) {
          console.error('Ошибка загрузки курса:', error);
          setCourse({
            title: 'Курс не найден',
            description: 'Ошибка загрузки курса',
            sections: 0
          });
        }
      }
      
      setIsLoading(false);
    };

    loadCourse();
  }, [courseId]);

  const handleBack = () => {
    navigate('/');
  };

  if (isLoading) {
    return <div className="loading">Загрузка курса...</div>;
  }

  if (!course) {
    return <div className="loading">Курс не найден</div>;
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
              <h3>Количество разделов</h3>
              <span className="count">{course.sections || course.chapters || 0}</span>
            </div>
            
            <div className="evalution-section">
              <h4>Evalution</h4>
              <p>Текст evalution будет здесь</p>
            </div>
            
            <div className="subscribe-section">
              <h4>Subscribe</h4>
              <p>Текст subscribe будет здесь</p>
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

          <div className="next-section">
            <button 
              className="next-button" 
              onClick={() => navigate(`/course/${courseId}/builder`)}
            >
              Дальше → Конструктор раздела
            </button>
            <p className="next-hint">
              Перейдите к наполнению курса контентом: разделы, теория, задания
            </p>
          </div>
        </main>

        <aside className="course-sidebar-right">
          <div className="info-section">
            <h3>A name</h3>
            <p>Текст для A name будет здесь</p>
            
            <div className="description-section">
              <h4>A description</h4>
              <p>Текст для A description будет здесь</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default CoursePage;