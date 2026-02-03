using CSharpFunctionalExtensions;

namespace Application.Domain.Models
{
    public class TaskCreator
    {
        const int MAX_LENGTH_NAME = 100;

        const int MAX_LENHTH_DESCRIPTION = 1500;

        const int MAX_LENGTH_HINT = 100;

        /// <summary>
        /// Id Задачи
        /// </summary>
        public Guid Id { get; }

        /// <summary>
        /// Название задачи
        /// </summary>
        public string Name { get; } = string.Empty;

        /// <summary>
        /// Описание задачи
        /// </summary>
        public string Description { get; } = string.Empty;

        /// <summary>
        /// Подсказка к вопросу
        /// </summary>
        public string Hint { get; } = string.Empty;

        /// <summary>
        /// Список вопросов
        /// </summary>
        public List<Question> Questions { get; } = new List<Question>();

        private TaskCreator(Guid id, string name, string description, string hint)
        {
            Id = id;
            Name = name;
            Description = description;
            Hint = hint;
        }

        public static Result<TaskCreator> Create(Guid id, string name, string description, string hint)
        {
            if (string.IsNullOrEmpty(name) || name.Length > MAX_LENGTH_NAME)
            {
                return Result.Failure<TaskCreator>($"Имя задачи не может быть пустым и превышать {MAX_LENGTH_NAME} символов");
            }
            if (string.IsNullOrEmpty(description) || description.Length > MAX_LENHTH_DESCRIPTION)
            {
                return Result.Failure<TaskCreator>($"Описание задачи не может быть пустым и превышать {MAX_LENHTH_DESCRIPTION} символов");
            }
            if (string.IsNullOrEmpty(hint) || hint.Length > MAX_LENGTH_HINT)
            {
                return Result.Failure<TaskCreator>($"Подсказка не может быть пустым и превышать {MAX_LENGTH_HINT} символов");
            }

            TaskCreator taskCreator = new TaskCreator(id, name, description, hint);

            return Result.Success(taskCreator);
        }

        public static Result<TaskCreator> Create(string name, string description, string hint)
        {
            if (string.IsNullOrEmpty(name) || name.Length > MAX_LENGTH_NAME)
            {
                return Result.Failure<TaskCreator>($"Имя задачи не может быть пустым и превышать {MAX_LENGTH_NAME} символов");
            }
            if (string.IsNullOrEmpty(description) || description.Length > MAX_LENHTH_DESCRIPTION)
            {
                return Result.Failure<TaskCreator>($"Описание задачи не может быть пустым и превышать {MAX_LENHTH_DESCRIPTION} символов");
            }
            if (string.IsNullOrEmpty(hint) || hint.Length > MAX_LENGTH_HINT)
            {
                return Result.Failure<TaskCreator>($"Подсказка не может быть пустым и превышать {MAX_LENGTH_HINT} символов");
            }

            TaskCreator taskCreator = new TaskCreator(Guid.NewGuid(), name, description, hint);

            return Result.Success(taskCreator);
        }
    }
}
