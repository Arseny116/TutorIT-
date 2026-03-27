import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import './UserProfilePage.css';

const API_BASE_URL = 'http://94.103.85.168:8080';

function UserProfilePage() {
    const [myCourses, setMyCourses] = useState([]);
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [user, setUser] = useState({ name: 'Гость', email: '-', id: null });
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadUserData();
    }, []);

    const showNotificationMessage = (message) => {
        setNotificationMessage(message);
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
    };

    const loadUserData = async () => {
        setIsLoading(true);

        try {
            const token = authService.getToken();
            const headers = { 'accept': 'text/plain' };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const userResponse = await fetch('/api/user', {
                method: 'GET',
                headers: headers,
                credentials: 'include'
            });

            if (userResponse.ok) {
                const userData = await userResponse.json();
                console.log('Данные пользователя:', userData);

                setUser({
                    id: userData.id,
                    name: userData.name,
                    email: userData.email
                });

                const coursesResponse = await fetch('/api/v1/Courses/GetAllCourses', {
                    method: 'GET',
                    headers: headers,
                    credentials: 'include'
                });

                if (coursesResponse.ok) {
                    let coursesData = await coursesResponse.json();
                    let coursesList = Array.isArray(coursesData) ? coursesData : (coursesData.$values || []);

                    const createdIds = userData.createdCourseIds || [];
                    const userCreatedCourses = coursesList.filter(course =>
                        createdIds.includes(course.id)
                    );
                    setMyCourses(userCreatedCourses);

                    const enrolledIds = userData.enrolledCourseIds || [];
                    const userEnrolledCourses = coursesList.filter(course =>
                        enrolledIds.includes(course.id)
                    );
                    setEnrolledCourses(userEnrolledCourses);
                }
            } else if (userResponse.status === 401) {
                setUser({ name: 'Гость', email: '-', id: null });
            }
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
        } finally {
            setIsLoading(false);
        }

        const userId = authService.getUserId();
        if (userId) {
            const avatarKey = `user-avatar-${userId}`;
            const savedAvatar = localStorage.getItem(avatarKey);
            if (savedAvatar) {
                setAvatarPreview(savedAvatar);
            }
        }
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

        if (!file.type.startsWith('image/')) {
            alert('Пожалуйста, выберите изображение');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('Размер изображения не должен превышать 5MB');
            return;
        }

        setIsUploading(true);

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result;
            setAvatarPreview(base64String);

            const userId = authService.getUserId();
            if (userId) {
                const avatarKey = `user-avatar-${userId}`;
                localStorage.setItem(avatarKey, base64String);
            }

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
        return name ? name.charAt(0).toUpperCase() : '?';
    };

    const handleEditCourse = () => {
        showNotificationMessage('Редактирование курса будет реализовано позже');
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }
        return `${API_BASE_URL}/${imagePath}`;
    };

    if (isLoading) {
        return (
            <div className="user-profile-page">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Загрузка...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="user-profile-page">
            <div className="profile-header">
                <h1>Личный кабинет</h1>
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
                    {user.id && (
                        <p><strong>ID:</strong> {user.id}</p>
                    )}
                </div>
            </section>

            <section className="my-courses">
                <h2>Мои созданные курсы ({myCourses.length})</h2>
                {myCourses.length > 0 ? (
                    <div className="courses-grid">
                        {myCourses.map(course => (
                            <div key={course.id} className="course-card">
                                <div className="course-card-row">
                                    {course.titleImage ? (
                                        <img
                                            src={getImageUrl(course.titleImage)}
                                            alt={course.title}
                                            className="course-thumbnail"
                                        />
                                    ) : (
                                        <div className="course-thumbnail-placeholder">
                                            📚
                                        </div>
                                    )}
                                    <h3 className="course-title">{course.title}</h3>
                                    <button
                                        className="edit-course-btn"
                                        onClick={handleEditCourse}
                                        title="Редактировать курс"
                                    >
                                        🔧
                                    </button>
                                </div>

                                <div className="course-meta">
                                    <span className="language-tag">{course.pl}</span>
                                    <span className="sections-tag">{course.chapters || course.sections || 0} разделов</span>
                                    <span className={`difficulty-tag difficulty-${course.complexity || course.difficulty || 1}`}>
                                        Сложность: {course.complexity || course.difficulty || 1}
                                    </span>
                                    <span className="creator-tag">Создатель</span>
                                </div>

                                <p className="course-description-preview">
                                    {course.description || 'Описание курса будет добавлено позже...'}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="empty-text">Вы еще не создали ни одного курса.</p>
                )}
            </section>

            <section className="enrolled-courses">
                <h2>Курсы, на которые я записан ({enrolledCourses.length})</h2>
                {enrolledCourses.length > 0 ? (
                    <div className="courses-grid">
                        {enrolledCourses.map(course => (
                            <div key={course.id} className="course-card">
                                <div className="course-card-row">
                                    {course.titleImage ? (
                                        <img
                                            src={getImageUrl(course.titleImage)}
                                            alt={course.title}
                                            className="course-thumbnail"
                                        />
                                    ) : (
                                        <div className="course-thumbnail-placeholder">
                                            📚
                                        </div>
                                    )}
                                    <h3 className="course-title">{course.title}</h3>
                                </div>

                                <div className="course-meta">
                                    <span className="language-tag">{course.pl}</span>
                                    <span className="sections-tag">{course.chapters || course.sections || 0} разделов</span>
                                    <span className={`difficulty-tag difficulty-${course.complexity || course.difficulty || 1}`}>
                                        Сложность: {course.complexity || course.difficulty || 1}
                                    </span>
                                    <span className="enrolled-tag">Записан</span>
                                </div>

                                <p className="course-description-preview">
                                    {course.description || 'Описание курса будет добавлено позже...'}
                                </p>

                                <div className="course-actions">
                                    <button
                                        className="take-course-btn"
                                        onClick={() => navigate(`/learn/${course.id}`)}
                                    >
                                        🚀 Пройти курс
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="empty-text coming-soon">Функция записи на курсы будет реализована позже</p>
                )}
            </section>

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

            {showNotification && (
                <div className="notification-toast">
                    <div className="notification-content">
                        <span className="notification-icon">ℹ️</span>
                        <span className="notification-text">{notificationMessage}</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserProfilePage;