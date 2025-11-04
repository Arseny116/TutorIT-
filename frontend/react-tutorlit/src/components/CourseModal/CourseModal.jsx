import { useNavigate } from 'react-router-dom';
import './CourseModal.css';

function CourseModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  const handleViewCourses = () => {
    navigate('/courses');
    onClose();
  };

  const handleCreateCourse = () => {
    navigate('/create-course');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Действие с курсами</h2>
        <div className="modal-actions">
          <button className="modal-btn view-courses-btn" onClick={handleViewCourses}>
            Смотреть курсы
          </button>
          <button className="modal-btn create-course-btn" onClick={handleCreateCourse}>
            Создать курс
          </button>
        </div>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
    </div>
  );
}

export default CourseModal;