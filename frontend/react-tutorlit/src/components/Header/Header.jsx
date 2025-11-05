import './Header.css';
import { useState } from 'react';
import CourseModal from '../CourseModal/CourseModal';

function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <header className="header">
        
        <button 
          className="header-btn"
          onClick={() => setIsModalOpen(true)}
        >
          Курсы
        </button>
      </header>

      <CourseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}

export default Header;