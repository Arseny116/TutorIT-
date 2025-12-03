import './Header.css';
import { useState } from 'react';
import CourseModal from '../CourseModal/CourseModal';

function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleUserClick = () => {
  };

  return (
    <>
      <header className="header">
        <div className="header-left">
          <h1 className="header-title">TutorIT</h1>
        </div>
        
        <div className="header-right">
          <button 
            className="header-user-btn"
            onClick={handleUserClick}
          >
            👤 Пользователь
          </button>
        </div>
      </header>

      <CourseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}

export default Header;