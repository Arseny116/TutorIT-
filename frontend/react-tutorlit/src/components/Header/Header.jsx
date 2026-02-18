import './Header.css';
import { useState } from 'react';
import CourseModal from '../CourseModal/CourseModal';
import AuthModal from '../AuthModal/AuthModal'; // Исправленный путь

function Header() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAuthOpen, setIsAuthOpen] = useState(false);

    const handleUserClick = () => {
        setIsAuthOpen(true);
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

            <AuthModal
                isOpen={isAuthOpen}
                onClose={() => setIsAuthOpen(false)}
            />
        </>
    );
}

export default Header;