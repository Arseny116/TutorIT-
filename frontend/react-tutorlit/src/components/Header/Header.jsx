import './Header.css';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CourseModal from '../CourseModal/CourseModal';
import AuthModal from '../AuthModal/AuthModal';
import authService from '../../services/authService';

function Header() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [userName, setUserName] = useState('');
    const location = useLocation();
    const navigate = useNavigate();

    const isCourseBuilder = location.pathname.includes('/builder');
    const isProfilePage = location.pathname === '/profile';

    useEffect(() => {
        const updateUserName = () => {
            try {
                if (authService.isAuthenticated && authService.isAuthenticated()) {
                    setUserName(authService.getUserName());
                } else {
                    setUserName('');
                }
            } catch (error) {
                console.error('Ошибка в Header:', error);
                setUserName('');
            }
        };

        updateUserName();

        const handleAuthChange = () => updateUserName();
        window.addEventListener('authChange', handleAuthChange);

        return () => {
            window.removeEventListener('authChange', handleAuthChange);
        };
    }, []);

    const handleLogoClick = (e) => {
        if (isCourseBuilder) {
            e.preventDefault();
            return;
        }
        navigate('/');
    };

    const handleUserClick = () => {
        try {
            if (authService.isAuthenticated && authService.isAuthenticated()) {
                navigate('/profile');
            } else {
                setIsAuthOpen(true);
            }
        } catch (error) {
            console.error('Ошибка при клике на пользователя:', error);
            setIsAuthOpen(true);
        }
    };

    const handleCoursesClick = () => {
        try {
            if (authService.isAuthenticated && authService.isAuthenticated()) {
                setIsModalOpen(true);
            } else {
                alert('Сначала нужно зарегистрироваться или войти в аккаунт');
                setIsAuthOpen(true);
            }
        } catch (error) {
            console.error('Ошибка при клике на курсы:', error);
            setIsAuthOpen(true);
        }
    };

    const handleCreateCourse = () => {
        try {
            if (authService.isAuthenticated && authService.isAuthenticated()) {
                navigate('/create-course');
            } else {
                alert('Сначала нужно зарегистрироваться или войти в аккаунт');
                setIsAuthOpen(true);
            }
        } catch (error) {
            console.error('Ошибка при клике на создание курса:', error);
            setIsAuthOpen(true);
        }
    };

    const handleLogout = () => {
        try {
            if (authService.logout) {
                authService.logout();
            }
            setUserName('');
            window.dispatchEvent(new Event('authChange'));
            navigate('/');
        } catch (error) {
            console.error('Ошибка при выходе:', error);
            navigate('/');
        }
    };

    const handleAuthSuccess = () => {
        try {
            if (authService.getUserName) {
                setUserName(authService.getUserName());
            }
            window.dispatchEvent(new Event('authChange'));
        } catch (error) {
            console.error('Ошибка при успешной авторизации:', error);
        }
    };

    return (
        <>
            <header className="header">
                <div className="header-left">
                    <h1
                        className="header-title"
                        onClick={handleLogoClick}
                        style={{
                            cursor: isCourseBuilder ? 'default' : 'pointer',
                            opacity: isCourseBuilder ? 0.7 : 1
                        }}
                    >
                        TutorIT
                    </h1>
                    {isProfilePage && (
                        <button className="header-back-btn" onClick={() => navigate('/')}>
                            ← На главную
                        </button>
                    )}
                </div>

                <div className="header-right">
                    {!isCourseBuilder && !isProfilePage && (
                        <button
                            className="header-user-btn"
                            onClick={handleUserClick}
                        >
                            👤 {userName || 'Пользователь'}
                        </button>
                    )}

                    {isProfilePage && (
                        <button
                            className="header-logout-btn"
                            onClick={handleLogout}
                        >
                            Выйти из аккаунта
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
                onSuccess={handleAuthSuccess}
            />
        </>
    );
}

export default Header;