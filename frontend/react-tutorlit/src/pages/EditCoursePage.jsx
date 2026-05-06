import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import authService from '../services/authService';
import './CreateCoursePage.css';

const API_BASE_URL = 'http://89.110.94.112:8080';

function EditCoursePage() {
    const { courseId } = useParams();
    const navigate = useNavigate();

    const [courseName, setCourseName] = useState('');
    const [description, setDescription] = useState('');
    const [sectionsCount, setSectionsCount] = useState('');
    const [difficulty, setDifficulty] = useState('');
    const [selectedLanguages, setSelectedLanguages] = useState([]);
    const [titleImage, setTitleImage] = useState(null);
    const [titleImagePreview, setTitleImagePreview] = useState('');
    const [existingImagePath, setExistingImagePath] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState(null);

    const programmingLanguages = [
        'JavaScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby',
        'Go', 'Swift', 'Kotlin', 'TypeScript', 'Rust', 'Scala',
        'R', 'MATLAB', 'SQL', 'HTML/CSS', 'Другой'
    ];

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }
        return `${API_BASE_URL}/${imagePath}`;
    };

    // Загрузка данных курса
    useEffect(() => {
        if (courseId) {
            loadCourseData();
        }
    }, [courseId]);

    const loadCourseData = async () => {
        setIsPageLoading(true);
        setError('');

        try {
            const token = authService.getToken();
            const headers = { 'accept': 'text/plain' };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`/api/v1/Courses/${courseId}`, {
                method: 'GET',
                headers: headers,
                credentials: 'include'
            });

            if (response.status === 401) {
                authService.logout();
                alert('Сессия истекла. Пожалуйста, войдите заново.');
                navigate('/');
                return;
            }

            if (!response.ok) {
                throw new Error('Курс не найден');
            }

            const courseData = await response.json();
            console.log('Загружен курс для редактирования:', courseData);

            setCourseName(courseData.title || '');
            setDescription(courseData.description || '');
            setSectionsCount(courseData.chapters || '');
            setDifficulty(courseData.complexity || '');

            // Парсим языки
            let languages = [];
            if (courseData.pl) {
                if (Array.isArray(courseData.pl)) {
                    languages = courseData.pl;
                } else if (typeof courseData.pl === 'string') {
                    try {
                        const parsed = JSON.parse(courseData.pl);
                        languages = Array.isArray(parsed) ? parsed : [courseData.pl];
                    } catch {
                        languages = [courseData.pl];
                    }
                }
            }
            setSelectedLanguages(languages);

            if (courseData.titleImage) {
                setExistingImagePath(courseData.titleImage);
                setTitleImagePreview(getImageUrl(courseData.titleImage));
            }

        } catch (error) {
            console.error('Ошибка загрузки курса:', error);
            setError('Не удалось загрузить данные курса');
        } finally {
            setIsPageLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setTitleImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setTitleImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const toggleLanguage = (language) => {
        if (language === 'Другой') {
            const input = prompt('Введите язык программирования:');
            if (input && input.trim() && !selectedLanguages.includes(input.trim())) {
                setSelectedLanguages([...selectedLanguages, input.trim()]);
            }
            return;
        }

        setSelectedLanguages(prev =>
            prev.includes(language)
                ? prev.filter(l => l !== language)
                : [...prev, language]
        );
    };

    const removeLanguage = (languageToRemove) => {
        setSelectedLanguages(prev => prev.filter(l => l !== languageToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (selectedLanguages.length === 0) {
            setError('Выберите хотя бы один язык программирования');
            return;
        }

        if (!courseName.trim() || !description.trim() || !sectionsCount || !difficulty) {
            setError('Заполните все поля');
            return;
        }

        if (courseName.trim().length > 300) {
            setError('Название курса не должно превышать 300 символов');
            return;
        }

        if (parseInt(sectionsCount) <= 0) {
            setError('Количество разделов должно быть больше 0');
            return;
        }

        setIsLoading(true);

        try {
            const token = authService.getToken();

            // Отправляем как JSON - это правильный формат для PUT
            const requestData = {
                pl: selectedLanguages, // Отправляем как массив
                title: courseName.trim(),
                description: description.trim(),
                chapters: parseInt(sectionsCount),
                complexity: parseInt(difficulty)
            };

            console.log('Отправляю данные (JSON):', JSON.stringify(requestData, null, 2));

            const response = await fetch(`/api/v1/Courses/${courseId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestData),
                credentials: 'include'
            });

            // Добавляем Authorization header если есть токен
            if (token && response.headers) {
                // Токен уже в cookies, но на всякий случай
            }

            const responseText = await response.text();
            console.log('Ответ сервера:', response.status, responseText);

            if (response.status === 401) {
                authService.logout();
                alert('Сессия истекла. Пожалуйста, войдите заново.');
                navigate('/');
                return;
            }

            if (!response.ok) {
                throw new Error(`Ошибка обновления: ${response.status} - ${responseText}`);
            }

            setSuccessMessage('Курс успешно обновлен!');

            setTimeout(() => {
                navigate(`/course/${courseId}/builder`);
            }, 1500);

        } catch (error) {
            console.error('Ошибка обновления курса:', error);
            setError(`Ошибка обновления курса: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setPendingNavigation('/profile');
        setShowConfirmModal(true);
    };

    const confirmNavigation = () => {
        setShowConfirmModal(false);
        if (pendingNavigation) {
            navigate(pendingNavigation);
        }
    };

    const cancelNavigation = () => {
        setShowConfirmModal(false);
        setPendingNavigation(null);
    };

    if (isPageLoading) {
        return (
            <div className="create-course-page">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Загрузка данных курса...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="create-course-page">
            <h1>Редактирование курса</h1>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="success-message" style={{ background: '#d4edda', color: '#155724', padding: '15px', borderRadius: '8px', marginBottom: '25px', textAlign: 'center' }}>
                    {successMessage}
                </div>
            )}

            <form onSubmit={handleSubmit} className="course-form">
                <div className="form-group">
                    <label htmlFor="courseName">Название курса *</label>
                    <input
                        id="courseName"
                        type="text"
                        value={courseName}
                        onChange={(e) => setCourseName(e.target.value)}
                        placeholder="Введите название курса"
                        required
                        disabled={isLoading}
                        maxLength="300"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Описание курса *</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Опишите содержание курса"
                        rows="4"
                        required
                        disabled={isLoading}
                    />
                </div>

                <div className="form-group">
                    <label>Языки программирования *</label>
                    <div className="languages-selector">
                        <div className="languages-buttons">
                            {programmingLanguages.map(lang => (
                                <button
                                    key={lang}
                                    type="button"
                                    className={`language-btn ${selectedLanguages.includes(lang) ? 'active' : ''}`}
                                    onClick={() => toggleLanguage(lang)}
                                    disabled={isLoading}
                                >
                                    {lang}
                                </button>
                            ))}
                        </div>
                        {selectedLanguages.length > 0 && (
                            <div className="selected-languages">
                                <span className="selected-label">Выбрано:</span>
                                {selectedLanguages.map(lang => (
                                    <span key={lang} className="selected-language-tag">
                        {lang}
                                        <button
                                            type="button"
                                            className="remove-language"
                                            onClick={() => removeLanguage(lang)}
                                            disabled={isLoading}
                                        >
                          ×
                        </button>
                      </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="titleImage">Титульная картинка</label>
                    <input
                        id="titleImage"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        disabled={isLoading}
                    />
                    {titleImagePreview && (
                        <div style={{ marginTop: '10px' }}>
                            <img src={titleImagePreview} alt="Предпросмотр" style={{ maxWidth: '200px', maxHeight: '150px', borderRadius: '8px' }} />
                            {existingImagePath && !titleImage && (
                                <p style={{ fontSize: '12px', color: '#6c757d', marginTop: '5px' }}>
                                    Текущее изображение
                                </p>
                            )}
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="sectionsCount">Количество разделов *</label>
                    <input
                        id="sectionsCount"
                        type="number"
                        value={sectionsCount}
                        onChange={(e) => setSectionsCount(e.target.value)}
                        placeholder="Введите количество разделов"
                        min="1"
                        max="20"
                        required
                        disabled={isLoading}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="difficulty">Сложность курса *</label>
                    <select
                        id="difficulty"
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        required
                        disabled={isLoading}
                    >
                        <option value="">Выберите сложность</option>
                        <option value="1">1 — Начальный уровень</option>
                        <option value="2">2 — Средний уровень</option>
                        <option value="3">3 — Продвинутый уровень</option>
                    </select>
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="btn-cancel"
                        disabled={isLoading}
                    >
                        Отмена
                    </button>
                    <button
                        type="submit"
                        className="btn-submit"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Сохранение...' : 'Сохранить изменения'}
                    </button>
                </div>
            </form>

            {/* Модальное окно подтверждения при выходе */}
            {showConfirmModal && (
                <div className="confirm-modal-overlay" onClick={cancelNavigation}>
                    <div className="confirm-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="confirm-icon">⚠️</div>
                        <p className="confirm-message">
                            Вы не сохранили изменения. Выйти без сохранения?
                        </p>
                        <div className="confirm-buttons">
                            <button className="confirm-cancel" onClick={cancelNavigation}>
                                Остаться
                            </button>
                            <button className="confirm-ok" onClick={confirmNavigation}>
                                Выйти
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EditCoursePage;