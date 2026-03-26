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

    useEffect(() => {
        const updateUserName = () => {
            if (authService.isAuthenticated()) {
                setUserName(authService.getUserName());
            } else {
                setUserName('');
            }
        };

        updateUserName();
        window.addEventListener('authChange', updateUserName);

        return () => {
            window.removeEventListener('authChange', updateUserName);
        };
    }, []);

    const handleUserClick = () => {
        if (authService.isAuthenticated()) {
            navigate('/profile');
        } else {
            setIsAuthOpen(true);
        }
    };

    const handleLogout = () => {
        authService.logout();
        setUserName('');
        window.dispatchEvent(new Event('authChange'));
        navigate('/');
    };

    const handleAuthSuccess = () => {
        setUserName(authService.getUserName());
        window.dispatchEvent(new Event('authChange'));
    };

    const isProfilePage = location.pathname === '/profile';

    return (
        <>
            <header className="header">
                <div className="header-left">
                    <h1 className="header-title" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                        TutorIT
                    </h1>
                    {isProfilePage && (
                        <button className="header-back-btn" onClick={() => navigate('/')}>
                            ← На главную
                        </button>
                    )}
                </div>

                <div className="header-right">
                    {!isProfilePage && (
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