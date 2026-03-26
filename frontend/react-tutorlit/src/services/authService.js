const API_BASE_URL = '/api/v1';

class AuthService {
    async register(name, email, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/Authentication/Register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'accept': 'text/plain'
                },
                body: JSON.stringify({ name, email, password })
            });

            const responseText = await response.text();
            console.log('Register response:', response.status, responseText);

            if (response.ok) {
                const userId = responseText.replace(/["'\s]/g, '');
                this._saveUserData(userId, name, email);
                return { success: true, userId };
            }

            return { success: false, error: responseText || `Ошибка ${response.status}` };
        } catch (error) {
            console.error('Ошибка регистрации:', error);
            return { success: false, error: error.message };
        }
    }

    async login(email, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/Authentication/Login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'accept': '*/*'
                },
                body: JSON.stringify({ email, password }),
                credentials: 'include'
            });

            const responseText = await response.text();
            console.log('Login response:', response.status, responseText);

            if (!response.ok) {
                return { success: false, error: responseText || 'Неверный email или пароль' };
            }

            // Токен приходит в Cookie
            const token = this.getToken();
            if (token) {
                console.log('Токен получен из Cookie');
            } else {
                console.warn('Токен не найден в Cookie');
            }

            localStorage.setItem('userEmail', email);
            localStorage.setItem('isAuthenticated', 'true');

            // Получаем данные пользователя через GET /api/user
            const userData = await this.getCurrentUser();
            if (userData) {
                this._saveUserData(userData.id, userData.name, email);
            }

            return { success: true };
        } catch (error) {
            console.error('Ошибка входа:', error);
            return { success: false, error: error.message };
        }
    }

    async getCurrentUser() {
        try {
            const token = this.getToken();
            const headers = { 'accept': 'text/plain' };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`/api/user`, {
                method: 'GET',
                headers: headers,
                credentials: 'include'
            });

            if (response.ok) {
                return await response.json();
            } else if (response.status === 401) {
                console.warn('Токен истек, нужно перелогиниться');
                this.logout();
            }
        } catch (error) {
            console.error('Ошибка получения данных:', error);
        }
        return null;
    }

    async fetchUserData(email) {
        try {
            const token = this.getToken();
            const headers = { 'accept': 'text/plain' };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`/api/user/search?email=${encodeURIComponent(email)}`, {
                method: 'GET',
                headers: headers,
                credentials: 'include'
            });

            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('Ошибка получения данных:', error);
        }
        return null;
    }

    _saveUserData(userId, name, email) {
        localStorage.setItem('userId', userId);
        localStorage.setItem('userName', name);
        localStorage.setItem('userEmail', email);
        localStorage.setItem('isAuthenticated', 'true');

        const createdCoursesKey = `createdCourseIds-${userId}`;
        const enrolledCoursesKey = `enrolledCourseIds-${userId}`;

        if (!localStorage.getItem(createdCoursesKey)) {
            localStorage.setItem(createdCoursesKey, JSON.stringify([]));
        }
        if (!localStorage.getItem(enrolledCoursesKey)) {
            localStorage.setItem(enrolledCoursesKey, JSON.stringify([]));
        }

        console.log('Данные пользователя сохранены:', { userId, name, email });
    }

    async addCreatedCourse(userId, courseId) {
        try {
            const token = this.getToken();
            if (!token) {
                console.warn('Нет токена, пропускаем привязку курса');
                return false;
            }

            const response = await fetch(`/api/user/${userId}/created-courses/${courseId}`, {
                method: 'POST',
                headers: {
                    'accept': 'text/plain',
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include'
            });

            console.log('Привязка курса к пользователю:', response.status);

            if (response.ok) {
                const createdCoursesKey = `createdCourseIds-${userId}`;
                const createdCourses = JSON.parse(localStorage.getItem(createdCoursesKey) || '[]');
                if (!createdCourses.includes(courseId)) {
                    createdCourses.push(courseId);
                    localStorage.setItem(createdCoursesKey, JSON.stringify(createdCourses));
                }
                return true;
            }
        } catch (error) {
            console.error('Ошибка добавления курса:', error);
        }
        return false;
    }

    getToken() {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'jwtE') {
                return value;
            }
        }
        return null;
    }

    isAuthenticated() {
        const token = this.getToken();
        const isAuth = localStorage.getItem('isAuthenticated') === 'true';

        if (isAuth && !token) {
            console.warn('Есть флаг авторизации, но нет токена');
            return false;
        }

        return isAuth && !!token;
    }

    getUserName() {
        return localStorage.getItem('userName') || 'Гость';
    }

    getUserEmail() {
        return localStorage.getItem('userEmail') || '';
    }

    getUserId() {
        return localStorage.getItem('userId');
    }

    logout() {
        document.cookie = 'jwtE=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('isAuthenticated');
        console.log('Выход выполнен');
    }
}

export default new AuthService();