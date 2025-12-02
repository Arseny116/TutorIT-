// Конфигурация API
export const API_CONFIG = {
  BASE_URL: 'http://tutor-it.ru/api/v1',
  ENDPOINTS: {
    CREATE_COURSE: '/Courses/CreateCourse'
  }
};

// Утилиты для работы с API
export const apiClient = {
  async post(endpoint, data) {
    try {
      console.log('🔄 Отправка запроса на:', `${API_CONFIG.BASE_URL}${endpoint}`);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify(data)
      });

      console.log('📡 Получен ответ:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP ошибка! Статус: ${response.status}`);
      }

      return await response.text();
      
    } catch (error) {
      console.error('❌ Ошибка fetch:', error);
      throw new Error(`Не удалось подключиться к серверу: ${error.message}`);
    }
  }
};