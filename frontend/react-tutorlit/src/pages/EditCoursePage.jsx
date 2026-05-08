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
    const [existingChapters, setExistingChapters] = useState([]);

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState(null);

    const programmingLanguages = [
        'JavaScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby',
        'Go', 'Swift', 'Kotlin', 'TypeScript', 'Rust', 'Scala',
        'R', 'MATLAB', 'SQL', 'HTML/CSS'
    ];

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }
        return `${API_BASE_URL}/${imagePath}`;
    };

    // Универсальный парсер языков
    const parseLanguages = (languages) => {
        if (!languages) return [];

        if (Array.isArray(languages)) {
            const result = [];
            for (const item of languages) {
                const parsed = parseLanguages(item);
                result.push(...parsed);
            }
            return [...new Set(result)];
        }

        if (typeof languages === 'string') {
            let str = languages;

            let previousStr = '';
            let maxIterations = 20;
            let iterations = 0;

            while (previousStr !== str && iterations < maxIterations) {
                previousStr = str;
                iterations++;

                str = str.replace(/\\"/g, '"');

                if (str.startsWith('"') && str.endsWith('"')) {
                    str = str.slice(1, -1);
                }

                try {
                    const parsed = JSON.parse(str);
                    if (Array.isArray(parsed)) {
                        const result = [];
                        for (const item of parsed) {
                            const subResult = parseLanguages(item);
                            result.push(...subResult);
                        }
                        return [...new Set(result)];
                    } else if (typeof parsed === 'string') {
                        str = parsed;
                        continue;
                    }
                } catch (e) {
                    // продолжаем
                }

                if (str.startsWith('[') && str.endsWith(']')) {
                    str = str.slice(1, -1);
                }
            }

            if (str.includes(',')) {
                const parts = str.split(',').map(p => p.trim().replace(/^["'\[\]]+|["'\[\]]+$/g, ''));
                const result = [];
                for (const part of parts) {
                    if (part && !result.includes(part)) {
                        result.push(part);
                    }
                }
                return result;
            }

            const cleaned = str.replace(/^["'\[\]]+|["'\[\]]+$/g, '');
            return cleaned ? [cleaned] : [];
        }

        return [];
    };

    // Форматирование для отображения выбранных языков
    const formatSelectedLanguages = () => {
        if (selectedLanguages.length === 0) return 'Не выбрано';
        return selectedLanguages.join(', ');
    };

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
            let languages = parseLanguages(courseData.pl);
            setSelectedLanguages(languages);

            if (courseData.titleImage) {
                setExistingImagePath(courseData.titleImage);
                setTitleImagePreview(getImageUrl(courseData.titleImage));
            }

            const chaptersResponse = await fetch(`/api/v1/Chapters/${courseId}`, {
                method: 'GET',
                headers: headers,
                credentials: 'include'
            });

            if (chaptersResponse.ok) {
                let chaptersData = await chaptersResponse.json();
                let chapters = Array.isArray(chaptersData) ? chaptersData : (chaptersData.$values || []);
                setExistingChapters(chapters);
                console.log(`Загружено ${chapters.length} разделов`);
            }

        } catch (error) {
            console.error('Ошибка загрузки курса:', error);
            setError('Не удалось загрузить данные курса');
        } finally {
            setIsPageLoading(false);
        }
    };

    const deleteExtraChapters = async (newCount) => {
        if (existingChapters.length <= newCount) return true;

        const chaptersToDelete = existingChapters.slice(newCount);
        console.log(`Нужно удалить ${chaptersToDelete.length} лишних разделов`);

        const token = authService.getToken();
        const headers = { 'accept': 'text/plain' };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        let allDeleted = true;

        for (const chapter of chaptersToDelete) {
            try {
                console.log(`Удаление раздела ${chapter.id}...`);
                const response = await fetch(`/api/v1/Chapters/${chapter.id}`, {
                    method: 'DELETE',
                    headers: headers,
                    credentials: 'include'
                });

                if (!response.ok) {
                    console.error(`Не удалось удалить раздел ${chapter.id}: ${response.status}`);
                    allDeleted = false;
                } else {
                    console.log(`✅ Раздел ${chapter.id} удален`);
                }
            } catch (error) {
                console.error(`Ошибка при удалении раздела ${chapter.id}:`, error);
                allDeleted = false;
            }
        }

        return allDeleted;
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            console.log('Выбрано новое изображение:', file.name);
            setTitleImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setTitleImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const toggleLanguage = (language) => {
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

        const newSectionsCount = parseInt(sectionsCount);
        if (newSectionsCount <= 0) {
            setError('Количество разделов должно быть больше 0');
            return;
        }

        setIsLoading(true);

        try {
            const token = authService.getToken();

            if (existingChapters.length > newSectionsCount) {
                console.log(`Количество разделов уменьшено с ${existingChapters.length} до ${newSectionsCount}`);
                await deleteExtraChapters(newSectionsCount);
            }

            // Отправляем FormData
            const formData = new FormData();
            formData.append('PL', JSON.stringify(selectedLanguages));
            formData.append('Title', courseName.trim());
            formData.append('Description', description.trim());
            formData.append('Chapters', newSectionsCount);
            formData.append('Complexity', parseInt(difficulty));

            if (titleImage) {
                formData.append('TitleImage', titleImage);
                console.log('Отправляем новое изображение');
            }

            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            console.log('Отправка FormData на сервер...');
            for (let pair of formData.entries()) {
                console.log(pair[0] + ': ' + (pair[1] instanceof File ? pair[1].name : pair[1]));
            }

            const response = await fetch(`/api/v1/Courses/${courseId}`, {
                method: 'PUT',
                headers: headers,
                body: formData,
                credentials: 'include'
            });

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
                                <div className="selected-languages-list">
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
                            <img
                                src={titleImagePreview}
                                alt="Предпросмотр"
                                style={{ maxWidth: '200px', maxHeight: '150px', borderRadius: '8px', objectFit: 'cover' }}
                            />
                            {existingImagePath && !titleImage && (
                                <p style={{ fontSize: '12px', color: '#6c757d', marginTop: '5px' }}>
                                    Текущее изображение
                                </p>
                            )}
                            {titleImage && (
                                <p style={{ fontSize: '12px', color: '#28a745', marginTop: '5px' }}>
                                    ✅ Новое изображение выбрано
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
                    {existingChapters.length > 0 && parseInt(sectionsCount) < existingChapters.length && (
                        <p style={{ fontSize: '12px', color: '#ff9800', marginTop: '5px' }}>
                            ⚠️ Внимание! При уменьшении количества разделов, лишние разделы будут удалены.
                        </p>
                    )}
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