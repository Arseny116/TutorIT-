import './Header.css';
import { useState } from 'react';
import { useLocation } from 'react-router-dom'; // Добавлено
import CourseModal from '../CourseModal/CourseModal';
import AuthModal from '../AuthModal/AuthModal';

function Header() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const location = useLocation(); // Получаем текущий путь

    const handleUserClick = () => {
        setIsAuthOpen(true);
    };

    // Проверяем, не на странице ли профиля мы сейчас
    const isProfilePage = location.pathname === '/profile';

    return (
        <>
            <header className="header">
                <div className="header-left">
                    <h1 className="header-title">TutorIT</h1>
                </div>

                <div className="header-right">
                    {/* Кнопка рендерится только если это НЕ страница профиля */}
                    {!isProfilePage && (
                        <button
                            className="header-user-btn"
                            onClick={handleUserClick}
                        >
                            👤 Пользователь
                        </button>
                    )}
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