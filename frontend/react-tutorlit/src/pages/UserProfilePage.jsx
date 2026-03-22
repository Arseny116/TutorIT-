import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserProfilePage.css';

function UserProfilePage() {
    const [myCourses, setMyCourses] = useState([]);
    const [user, setUser] = useState({ name: 'Гость', email: '-' });
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Загружаем курсы
        const savedCourses = JSON.parse(localStorage.getItem('tutorit-courses') || '[]');
        setMyCourses(savedCourses);

        // Загружаем данные пользователя
        const savedUser = JSON.parse(localStorage.getItem('user-data'));
        if (savedUser) {
            setUser(savedUser);
        }

        // Загружаем аватар
        const savedAvatar = localStorage.getItem('user-avatar');
        if (savedAvatar) {
            setAvatarPreview(savedAvatar);
        }
    }, []);

    const handleLogout = () => {
        navigate('/');
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarImageClick = (e) => {
        e.stopPropagation();
        if (avatarPreview) {
            setIsModalOpen(true);
        }
    };

    const handleAvatarChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Проверка типа файла
        if (!file.type.startsWith('image/')) {
            alert('Пожалуйста, выберите изображение');
            return;
        }

        // Проверка размера (максимум 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Размер изображения не должен превышать 5MB');
            return;
        }

        setIsUploading(true);

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result;
            setAvatarPreview(base64String);

            // Сохраняем аватар в localStorage
            localStorage.setItem('user-avatar', base64String);

            // Обновляем данные пользователя с аватаром
            const updatedUser = { ...user, avatar: base64String };
            localStorage.setItem('user-data', JSON.stringify(updatedUser));

            setIsUploading(false);
        };

        reader.onerror = () => {
            alert('Ошибка загрузки изображения');
            setIsUploading(false);
        };

        reader.readAsDataURL(file);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    // Закрытие по клавише Escape
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        };
        if (isModalOpen) {
            document.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isModalOpen]);

    const getInitials = (name) => {
        return name.charAt(0).toUpperCase();
    };

    const handleContinueCourse = (courseId) => {
        navigate(`/learn/${courseId}`);
    };

    return (
        <div className="user-profile-page">
            <div className="profile-header">
                <h1>Личный кабинет</h1>
                <button className="btn-logout" onClick={handleLogout}>Выйти на главную</button>
            </div>

            <section className="avatar-section">
                <div className="avatar-container">
                    {avatarPreview ? (
                        <div className="avatar-wrapper">
                            <img
                                src={avatarPreview}
                                alt="Аватар"
                                className="avatar-image"
                                onClick={handleAvatarImageClick}
                                style={{ cursor: 'pointer' }}
                            />
                        </div>
                    ) : (
                        <div className="avatar-placeholder" onClick={handleAvatarClick}>
                            <span className="avatar-initials">{getInitials(user.name)}</span>
                            <div className="avatar-overlay">
                                <span>📷</span>
                            </div>
                        </div>
                    )}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleAvatarChange}
                        accept="image/*"
                        style={{ display: 'none' }}
                    />
                </div>
                <div className="avatar-actions">
                    <button className="avatar-change-btn" onClick={handleAvatarClick}>
                        {avatarPreview ? 'Изменить фото' : 'Загрузить фото'}
                    </button>
                    {isUploading && <span className="uploading-text">Загрузка...</span>}
                </div>
                <p className="avatar-hint">
                    {avatarPreview ? 'Нажмите на фото для увеличения' : 'Нажмите на плейсхолдер, чтобы загрузить фото'}
                </p>
            </section>

            <section className="personal-data">
                <h2>Персональные данные</h2>
                <div className="data-card">
                    <p><strong>Имя:</strong> {user.name}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                </div>
            </section>

            <section className="my-courses">
                <h2>Мои созданные курсы</h2>
                {myCourses.length > 0 ? (
                    <div className="courses-grid">
                        {myCourses.map(course => (
                            <div key={course.id} className="course-card-mini created">
                                <h3>{course.title}</h3>
                                <p>{course.pl}</p>
                                <button
                                    className="btn-continue"
                                    onClick={() => handleContinueCourse(course.id)}
                                >
                                    Продолжить
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="empty-text">Вы еще не создали ни одного курса.</p>
                )}
            </section>

            <section className="enrolled-courses">
                <h2>Курсы, на которые я записан</h2>
                <p className="empty-text">Вы еще не записаны на курсы.</p>
            </section>

            {/* Модальное окно для увеличенного просмотра аватара */}
            {isModalOpen && (
                <div className="avatar-modal" onClick={closeModal}>
                    <div className="avatar-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="avatar-modal-close" onClick={closeModal}>×</button>
                        <img
                            src={avatarPreview}
                            alt="Увеличенный аватар"
                            className="avatar-modal-image"
                        />
                        <p className="avatar-modal-name">{user.name}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserProfilePage;