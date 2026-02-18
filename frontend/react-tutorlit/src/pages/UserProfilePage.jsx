import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserProfilePage.css';

function UserProfilePage() {
    const [myCourses, setMyCourses] = useState([]);
    const [enrolledCourses, setEnrolledCourses] = useState([]); // Теперь массив изначально пуст
    const navigate = useNavigate();

    useEffect(() => {
        // Получаем созданные курсы из localStorage
        const savedCourses = JSON.parse(localStorage.getItem('tutorit-courses') || '[]');
        setMyCourses(savedCourses);

        // Список курсов, на которые записан, пока оставляем пустым
        setEnrolledCourses([]);
    }, []);

    const handleLogout = () => {
        navigate('/');
    };

    return (
        <div className="user-profile-page">
            <div className="profile-header">
                <h1>Личный кабинет</h1>
                <button className="btn-logout" onClick={handleLogout}>Выйти на главную</button>
            </div>

            <section className="personal-data">
                <h2>Персональные данные</h2>
                <div className="data-card">
                    <p><strong>Имя:</strong> Пользователь</p>
                    <p><strong>Email:</strong> user@example.com</p>
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
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="empty-text">Вы еще не создали ни одного курса.</p>
                )}
            </section>

            <section className="enrolled-courses">
                <h2>Курсы, на которые я записан</h2>
                {enrolledCourses.length > 0 ? (
                    <div className="courses-grid">
                        {enrolledCourses.map(course => (
                            <div key={course.id} className="course-card-mini enrolled">
                                <h3>{course.title}</h3>
                                <p>{course.pl}</p>
                                <button className="btn-continue" onClick={() => navigate(`/learn/${course.id}`)}>
                                    Продолжить обучение
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="empty-text">Вы еще не записаны на курсы.</p>
                )}
            </section>
        </div>
    );
}

export default UserProfilePage;