import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import './AuthModal.css';

function AuthModal({ isOpen, onClose, onSuccess }) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleAuthSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (isLogin) {
            // Вход
            const result = await authService.login(email, password);
            if (result.success) {
                const userData = {
                    name: authService.getUserName(),
                    email: authService.getUserEmail()
                };
                localStorage.setItem('user-data', JSON.stringify(userData));

                if (onSuccess) onSuccess();
                onClose();
                navigate('/profile');
            } else {
                setError(result.error || 'Ошибка входа');
            }
        } else {
            // Регистрация
            if (!name.trim()) {
                setError('Введите ваше имя');
                setIsLoading(false);
                return;
            }

            const result = await authService.register(name, email, password);

            if (result.success) {
                // Регистрация успешна - теперь входим
                const loginResult = await authService.login(email, password);
                if (loginResult.success) {
                    const userData = { name, email };
                    localStorage.setItem('user-data', JSON.stringify(userData));

                    if (onSuccess) onSuccess();
                    onClose();
                    navigate('/profile');
                } else {
                    setError('Регистрация успешна, но не удалось войти. Пожалуйста, войдите вручную.');
                    // Переключаем на форму входа
                    setIsLogin(true);
                }
            } else {
                setError(result.error || 'Ошибка регистрации');
            }
        }

        setIsLoading(false);
    };

    return (
        <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && onClose()}>
            <div className="modal-content">
                <button className="close-modal" onClick={onClose}>×</button>
                <div className="auth-tabs">
                    <button className={`auth-tab ${isLogin ? 'active' : ''}`} onClick={() => { setIsLogin(true); setError(''); }}>
                        Вход
                    </button>
                    <button className={`auth-tab ${!isLogin ? 'active' : ''}`} onClick={() => { setIsLogin(false); setError(''); }}>
                        Регистрация
                    </button>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <form className="auth-form" onSubmit={handleAuthSubmit}>
                    {!isLogin && (
                        <input
                            type="text"
                            placeholder="Ваше имя"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    )}
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                    <input
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                    <button type="submit" className="auth-submit" disabled={isLoading}>
                        {isLoading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AuthModal;