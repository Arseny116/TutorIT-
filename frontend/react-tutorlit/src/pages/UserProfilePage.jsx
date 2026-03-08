import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserProfilePage.css';

function UserProfilePage() {
    const [myCourses, setMyCourses] = useState([]);
    const [user, setUser] = useState({ name: 'Гость', email: '-' });
    const navigate = useNavigate();

    useEffect(() => {
        const savedCourses = JSON.parse(localStorage.getItem('tutorit-courses') || '[]');
        setMyCourses(savedCourses);

        // Загружаем данные пользователя, введенные при регистрации
        const savedUser = JSON.parse(localStorage.getItem('user-data'));
        if (savedUser) {
            setUser(savedUser);
        }
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
        </div>
    );
}

export default UserProfilePage;