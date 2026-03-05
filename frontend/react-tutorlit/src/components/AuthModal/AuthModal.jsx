import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthModal.css';

function AuthModal({ isOpen, onClose }) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleAuthSubmit = (e) => {
        e.preventDefault();

        // Сохраняем данные пользователя для профиля
        const userData = {
            name: isLogin ? 'Пользователь' : name,
            email: email
        };
        localStorage.setItem('user-data', JSON.stringify(userData));

        onClose();
        navigate('/profile');
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
                    {!isLogin && (
                        <input
                            type="text"
                            placeholder="Ваше имя"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    )}
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
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