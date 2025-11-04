import './Header.css';
import { useState } from 'react';
import CourseModal from '../CourseModal/CourseModal';

function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <header className="header">
        <div className="header-left">
          <button className="header-btn header-btn-disabled" title="В разработке">
            CP
          </button>
          
   
          <button 
            className="header-btn"
            onClick={() => setIsModalOpen(true)}
          >
            Курсы
          </button>
        </div>
        
        <div className="header-right">
          <button className="header-btn">Вход</button>
          <button className="header-btn">Регистрация</button>
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