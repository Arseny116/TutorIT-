import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Импортируем navigate
import './AuthModal.css';

function AuthModal({ isOpen, onClose }) {
    const [isLogin, setIsLogin] = useState(true);
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleAuthSubmit = (e) => {
        e.preventDefault();
        onClose(); // Закрываем модалку
        navigate('/profile'); // Перекидываем в профиль
    };

    return (
        <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && onClose()}>
            <div className="modal-content">
                <button className="close-modal" onClick={onClose}>×</button>
                <div className="auth-tabs">
                    <button className={`auth-tab ${isLogin ? 'active' : ''}`} onClick={() => setIsLogin(true)}>Вход</button>
                    <button className={`auth-tab ${!isLogin ? 'active' : ''}`} onClick={() => setIsLogin(false)}>Регистрация</button>
                </div>

                <form className="auth-form" onSubmit={handleAuthSubmit}>
                    {!isLogin && <input type="text" placeholder="Ваше имя" required />}
                    <input type="email" placeholder="Email" required />
                    <input type="password" placeholder="Пароль" required />
                    <button type="submit" className="auth-submit">
                        {isLogin ? 'Войти' : 'Зарегистрироваться'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AuthModal;