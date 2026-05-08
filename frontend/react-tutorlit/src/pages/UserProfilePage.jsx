import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import './UserProfilePage.css';

const API_BASE_URL = 'http://89.110.94.112:8080';

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

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState(null);

    const [showUnenrollConfirm, setShowUnenrollConfirm] = useState(false);
    const [courseToUnenroll, setCourseToUnenroll] = useState(null);
    const [isUnenrolling, setIsUnenrolling] = useState(false);

    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }
        return `${API_BASE_URL}/${imagePath}`;
    };

    // Функция для парсинга языков из формата ['["JavaScript"]', '["Python"]']
    const parseLanguages = (languages) => {
        if (!languages) return [];

        // Если уже массив
        if (Array.isArray(languages)) {
            const result = [];
            for (const item of languages) {
                if (typeof item === 'string') {
                    try {
                        // Пробуем распарсить как JSON
                        const parsed = JSON.parse(item);
                        if (Array.isArray(parsed)) {
                            for (const lang of parsed) {
                                if (lang && !result.includes(lang)) {
                                    result.push(lang);
                                }
                            }
                        } else if (parsed && !result.includes(parsed)) {
                            result.push(parsed);
                        }
                    } catch {
                        // Если не парсится, убираем кавычки и скобки
                        let cleaned = item;
                        if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
                            cleaned = cleaned.slice(1, -1);
                        }
                        if (cleaned.startsWith('[') && cleaned.endsWith(']')) {
                            cleaned = cleaned.slice(1, -1);
                        }
                        cleaned = cleaned.replace(/\\"/g, '"');
                        if (cleaned.includes(',')) {
                            const parts = cleaned.split(',').map(l => l.trim().replace(/^["']|["']$/g, ''));
                            for (const part of parts) {
                                if (part && !result.includes(part)) {
                                    result.push(part);
                                }
                            }
                        } else if (cleaned && !result.includes(cleaned)) {
                            result.push(cleaned);
                        }
                    }
                }
            }
            return result;
        }

        // Если строка
        if (typeof languages === 'string') {
            try {
                let str = languages;
                if (str.startsWith('"') && str.endsWith('"')) {
                    str = str.slice(1, -1);
                }
                str = str.replace(/\\"/g, '"');
                const parsed = JSON.parse(str);
                if (Array.isArray(parsed)) return parsed;
                return [languages];
            } catch {
                if (languages.includes(',')) {
                    return languages.split(',').map(l => l.trim().replace(/^["'[\]]+|["'[\]]+$/g, ''));
                }
                return [languages.replace(/^["'[\]]+|["'[\]]+$/g, '')];
            }
        }

        return [];
    };

    // Форматирование для отображения
    const formatLanguages = (languages) => {
        const arr = parseLanguages(languages);
        if (arr.length === 0) return 'Не указан';
        return arr.join(', ');
    };

    // Функция для проверки, полностью ли создан курс (есть ли разделы)
    const isCourseFullyCreated = async (courseId) => {
        try {
            const token = authService.getToken();
            const headers = { 'accept': 'text/plain' };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`/api/v1/Chapters/${courseId}`, {
                method: 'GET',
                headers: headers,
                credentials: 'include'
            });

            if (response.ok) {
                let chaptersData = await response.json();
                let chapters = Array.isArray(chaptersData) ? chaptersData : (chaptersData.$values || []);
                return chapters.length > 0;
            }
            return false;
        } catch (error) {
            console.error('Ошибка проверки разделов курса:', error);
            return false;
        }
    };

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

                    // Созданные курсы
                    const createdIds = userData.createdCourseIds || [];
                    let userCreatedCourses = coursesList.filter(course =>
                        createdIds.includes(course.id)
                    ).map(course => ({
                        id: course.id,
                        title: course.title,
                        description: course.description || 'Описание отсутствует',
                        sections: course.chapters || 0,
                        difficulty: course.complexity || 1,
                        languagesRaw: course.pl,
                        titleImage: getImageUrl(course.titleImage),
                        isFromAPI: true
                    }));

                    // Записанные курсы
                    const enrolledIds = userData.enrolledCourseIds || [];
                    let userEnrolledCourses = coursesList.filter(course =>
                        enrolledIds.includes(course.id)
                    ).map(course => ({
                        id: course.id,
                        title: course.title,
                        description: course.description || 'Описание отсутствует',
                        sections: course.chapters || 0,
                        difficulty: course.complexity || 1,
                        languagesRaw: course.pl,
                        titleImage: getImageUrl(course.titleImage),
                        isFromAPI: true
                    }));

                    // Фильтруем созданные курсы - показываем только полностью созданные (с разделами)
                    const fullyCreatedCourses = [];
                    for (const course of userCreatedCourses) {
                        const hasChapters = await isCourseFullyCreated(course.id);
                        if (hasChapters) {
                            fullyCreatedCourses.push(course);
                        } else {
                            console.log(`Созданный курс "${course.title}" пропущен (нет разделов)`);
                        }
                    }
                    setMyCourses(fullyCreatedCourses);

                    // Фильтруем записанные курсы - показываем только полностью созданные (с разделами)
                    const fullyCreatedEnrolled = [];
                    for (const course of userEnrolledCourses) {
                        const hasChapters = await isCourseFullyCreated(course.id);
                        if (hasChapters) {
                            fullyCreatedEnrolled.push(course);
                        } else {
                            console.log(`Записанный курс "${course.title}" пропущен (нет разделов)`);
                        }
                    }
                    setEnrolledCourses(fullyCreatedEnrolled);
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

    const openUnenrollConfirm = (course) => {
        setCourseToUnenroll(course);
        setShowUnenrollConfirm(true);
    };

    const closeUnenrollConfirm = () => {
        setShowUnenrollConfirm(false);
        setCourseToUnenroll(null);
    };

    const confirmUnenroll = async () => {
        if (!courseToUnenroll) return;

        setIsUnenrolling(true);
        try {
            const result = await authService.unenrollFromCourse(courseToUnenroll.id);
            if (result.success) {
                setEnrolledCourses(prev => prev.filter(c => c.id !== courseToUnenroll.id));
                showNotificationMessage(`Вы отписались от курса "${courseToUnenroll.title}"`);
                closeUnenrollConfirm();
            } else {
                showNotificationMessage(result.error || 'Ошибка при отписке от курса');
            }
        } catch (error) {
            console.error('Ошибка отписки:', error);
            showNotificationMessage('Произошла ошибка при отписке');
        } finally {
            setIsUnenrolling(false);
        }
    };

    const openDeleteConfirm = (course) => {
        setCourseToDelete(course);
        setShowDeleteConfirm(true);
    };

    const closeDeleteConfirm = () => {
        setShowDeleteConfirm(false);
        setCourseToDelete(null);
    };

    const confirmDeleteCourse = async () => {
        if (!courseToDelete) return;

        try {
            const token = authService.getToken();
            const headers = { 'accept': 'text/plain' };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`/api/v1/Courses/${courseToDelete.id}`, {
                method: 'DELETE',
                headers: headers,
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`Ошибка удаления: ${response.status}`);
            }

            showNotificationMessage('Курс успешно удален');
            closeDeleteConfirm();
            await loadUserData();

        } catch (error) {
            console.error('Ошибка удаления курса:', error);
            showNotificationMessage('Ошибка при удалении курса');
            closeDeleteConfirm();
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
                closeDeleteConfirm();
                closeUnenrollConfirm();
            }
        };
        if (isModalOpen || showDeleteConfirm || showUnenrollConfirm) {
            document.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isModalOpen, showDeleteConfirm, showUnenrollConfirm]);

    const getInitials = (name) => {
        return name ? name.charAt(0).toUpperCase() : '?';
    };

    const handleContinueCourse = (courseId) => {
        navigate(`/learn/${courseId}`);
    };

    const handleEditCourse = (courseId) => {
        navigate(`/edit-course/${courseId}`);
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
                                            src={course.titleImage}
                                            alt={course.title}
                                            className="course-thumbnail"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.style.display = 'none';
                                                if (e.target.nextSibling) {
                                                    e.target.nextSibling.style.display = 'flex';
                                                }
                                            }}
                                        />
                                    ) : null}
                                    <div
                                        className="course-thumbnail-placeholder"
                                        style={{ display: course.titleImage ? 'none' : 'flex' }}
                                    >
                                        📚
                                    </div>
                                    <h3 className="course-title">{course.title}</h3>
                                    <div className="course-actions-buttons">
                                        <button
                                            className="edit-course-btn"
                                            onClick={() => handleEditCourse(course.id)}
                                            title="Редактировать курс"
                                        >
                                            🔧
                                        </button>
                                        <button
                                            className="delete-course-btn"
                                            onClick={() => openDeleteConfirm(course)}
                                            title="Удалить курс"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>

                                <div className="course-meta">
                                    <span className="language-tag">
                                        {formatLanguages(course.languagesRaw)}
                                    </span>
                                    <span className="sections-tag">{course.sections} разделов</span>
                                    <span className={`difficulty-tag difficulty-${course.difficulty || 1}`}>
                                        Сложность: {course.difficulty || 1}
                                    </span>
                                    <span className="creator-tag">Создатель</span>
                                </div>

                                <p className="course-description-preview">
                                    {course.description}
                                </p>

                                <div className="course-actions">
                                    <button
                                        className="take-course-btn"
                                        onClick={() => handleContinueCourse(course.id)}
                                    >
                                        🚀 Пройти курс
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="empty-text">Вы еще не создали ни одного полностью завершенного курса.</p>
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
                                            src={course.titleImage}
                                            alt={course.title}
                                            className="course-thumbnail"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.style.display = 'none';
                                                if (e.target.nextSibling) {
                                                    e.target.nextSibling.style.display = 'flex';
                                                }
                                            }}
                                        />
                                    ) : null}
                                    <div
                                        className="course-thumbnail-placeholder"
                                        style={{ display: course.titleImage ? 'none' : 'flex' }}
                                    >
                                        📚
                                    </div>
                                    <h3 className="course-title">{course.title}</h3>
                                    <div className="course-actions-buttons">
                                        <button
                                            className="unenroll-course-btn"
                                            onClick={() => openUnenrollConfirm(course)}
                                            title="Отписаться от курса"
                                        >
                                            ❌
                                        </button>
                                    </div>
                                </div>

                                <div className="course-meta">
                                    <span className="language-tag">
                                        {formatLanguages(course.languagesRaw)}
                                    </span>
                                    <span className="sections-tag">{course.sections} разделов</span>
                                    <span className={`difficulty-tag difficulty-${course.difficulty || 1}`}>
                                        Сложность: {course.difficulty || 1}
                                    </span>
                                    <span className="enrolled-tag">Записан</span>
                                </div>

                                <p className="course-description-preview">
                                    {course.description}
                                </p>

                                <div className="course-actions">
                                    <button
                                        className="take-course-btn"
                                        onClick={() => handleContinueCourse(course.id)}
                                    >
                                        🚀 Продолжить обучение
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="empty-text">
                        Вы еще не записаны ни на один полностью завершенный курс.
                    </p>
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

            {showDeleteConfirm && courseToDelete && (
                <div className="confirm-modal-overlay" onClick={closeDeleteConfirm}>
                    <div className="confirm-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="confirm-icon">⚠️</div>
                        <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Подтверждение удаления</h3>
                        <p className="confirm-message">
                            Вы действительно хотите удалить курс <strong>"{courseToDelete.title}"</strong>?
                        </p>
                        <p style={{ fontSize: '14px', color: '#dc3545', marginBottom: '20px' }}>
                            Это действие невозможно отменить. Все данные курса будут удалены.
                        </p>
                        <div className="confirm-buttons">
                            <button className="confirm-cancel" onClick={closeDeleteConfirm}>
                                Отмена
                            </button>
                            <button className="confirm-ok" onClick={confirmDeleteCourse}>
                                Удалить
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showUnenrollConfirm && courseToUnenroll && (
                <div className="confirm-modal-overlay" onClick={closeUnenrollConfirm}>
                    <div className="confirm-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="confirm-icon">📝</div>
                        <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Отписаться от курса</h3>
                        <p className="confirm-message">
                            Вы действительно хотите отписаться от курса <strong>"{courseToUnenroll.title}"</strong>?
                        </p>
                        <p style={{ fontSize: '14px', color: '#ff9800', marginBottom: '20px' }}>
                            Весь прогресс по этому курсу будет потерян.
                        </p>
                        <div className="confirm-buttons">
                            <button className="confirm-cancel" onClick={closeUnenrollConfirm}>
                                Отмена
                            </button>
                            <button className="confirm-ok" onClick={confirmUnenroll} disabled={isUnenrolling}>
                                {isUnenrolling ? 'Отписка...' : 'Да, отписаться'}
                            </button>
                        </div>
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