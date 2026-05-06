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

            if (response.status === 400) {
                return { success: false, error: responseText || 'Пользователь с таким email уже существует' };
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

            const token = this.getToken();
            if (token) {
                console.log('Токен получен из Cookie');
            }

            localStorage.setItem('userEmail', email);
            localStorage.setItem('isAuthenticated', 'true');

            const userData = await this.fetchUserData();
            if (userData) {
                this._saveUserData(userData.id, userData.name, email);
                if (userData.enrolledCourseIds) {
                    localStorage.setItem('enrolledCourseIds', JSON.stringify(userData.enrolledCourseIds));
                }
                if (userData.createdCourseIds) {
                    localStorage.setItem('createdCourseIds', JSON.stringify(userData.createdCourseIds));
                }
            }

            return { success: true };
        } catch (error) {
            console.error('Ошибка входа:', error);
            return { success: false, error: error.message };
        }
    }

    async fetchUserData() {
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
            }
        } catch (error) {
            console.error('Ошибка получения данных:', error);
        }
        return null;
    }

    async refreshUserData() {
        try {
            const userData = await this.fetchUserData();
            if (userData) {
                localStorage.setItem('userId', userData.id);
                localStorage.setItem('userName', userData.name);
                localStorage.setItem('userEmail', userData.email);
                if (userData.enrolledCourseIds) {
                    localStorage.setItem('enrolledCourseIds', JSON.stringify(userData.enrolledCourseIds));
                }
                if (userData.createdCourseIds) {
                    localStorage.setItem('createdCourseIds', JSON.stringify(userData.createdCourseIds));
                }
            }
            return userData;
        } catch (error) {
            console.error('Ошибка обновления данных пользователя:', error);
            return null;
        }
    }

    // Записаться на курс
    async enrollToCourse(courseId) {
        try {
            const userId = this.getUserId();
            if (!userId) {
                return { success: false, error: 'Пользователь не авторизован' };
            }

            const token = this.getToken();
            const headers = {
                'accept': '*/*'
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`/api/user/${userId}/subscribe/${courseId}`, {
                method: 'POST',
                headers: headers,
                credentials: 'include'
            });

            console.log('Enroll response status:', response.status);

            if (response.status === 401) {
                this.logout();
                return { success: false, error: 'Сессия истекла. Пожалуйста, войдите заново.' };
            }

            if (response.ok || response.status === 200 || response.status === 204) {
                await this.refreshUserData();
                return { success: true };
            } else {
                let errorText = '';
                try {
                    errorText = await response.text();
                } catch (e) {
                    errorText = `Ошибка ${response.status}`;
                }
                return { success: false, error: errorText };
            }
        } catch (error) {
            console.error('Ошибка записи на курс:', error);
            return { success: false, error: error.message };
        }
    }

    // Отписаться от курса
    async unenrollFromCourse(courseId) {
        try {
            const userId = this.getUserId();
            if (!userId) {
                return { success: false, error: 'Пользователь не авторизован' };
            }

            const token = this.getToken();
            const headers = {
                'accept': '*/*'
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`/api/user/${userId}/unsubscribe/${courseId}`, {
                method: 'DELETE',
                headers: headers,
                credentials: 'include'
            });

            console.log('Unenroll response status:', response.status);

            if (response.status === 401) {
                this.logout();
                return { success: false, error: 'Сессия истекла. Пожалуйста, войдите заново.' };
            }

            if (response.ok || response.status === 200 || response.status === 204) {
                await this.refreshUserData();
                return { success: true };
            } else {
                let errorText = '';
                try {
                    errorText = await response.text();
                } catch (e) {
                    errorText = `Ошибка ${response.status}`;
                }
                return { success: false, error: errorText };
            }
        } catch (error) {
            console.error('Ошибка отписки от курса:', error);
            return { success: false, error: error.message };
        }
    }

    // Проверить, записан ли пользователь на курс
    async isEnrolledToCourse(courseId) {
        try {
            const userData = await this.fetchUserData();
            if (userData && userData.enrolledCourseIds) {
                return userData.enrolledCourseIds.includes(courseId);
            }
            return false;
        } catch (error) {
            console.error('Ошибка проверки записи:', error);
            return false;
        }
    }

    // Получить курсы, на которые записан пользователь
    async getEnrolledCourses() {
        try {
            const token = this.getToken();
            const headers = { 'accept': 'text/plain' };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`/api/user/enrolled-courses`, {
                method: 'GET',
                headers: headers,
                credentials: 'include'
            });

            if (response.status === 401) {
                this.logout();
                return [];
            }

            if (response.ok) {
                let data = await response.json();
                let courses = Array.isArray(data) ? data : (data.$values || []);
                return courses;
            }
            return [];
        } catch (error) {
            console.error('Ошибка получения записанных курсов:', error);
            return [];
        }
    }

    _saveUserData(userId, name, email) {
        localStorage.setItem('userId', userId);
        localStorage.setItem('userName', name);
        localStorage.setItem('userEmail', email);
        localStorage.setItem('isAuthenticated', 'true');
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

    getEnrolledCourseIds() {
        const ids = localStorage.getItem('enrolledCourseIds');
        return ids ? JSON.parse(ids) : [];
    }

    logout() {
        document.cookie = 'jwtE=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('enrolledCourseIds');
        localStorage.removeItem('createdCourseIds');
        console.log('Выход выполнен');
    }
}

export default new AuthService();