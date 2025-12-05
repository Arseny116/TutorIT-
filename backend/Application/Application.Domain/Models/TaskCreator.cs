using CSharpFunctionalExtensions;

namespace Application.Domain.Models
{
    public class TaskCreator
    {
        const int MAX_LENGTH_NAME = 100;

        const int MAX_LENHTH_DESCRIPTION = 1500;

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
        /// Список вопросов
        /// </summary>
        public List<Question> Questions { get; } = new List<Question>();

        private TaskCreator(Guid id, string name, string description)
        {
            Id = id;
            Name = name;
            Description = description;
        }

        public static Result<TaskCreator> Create(Guid id, string name, string description)
        {
            if (string.IsNullOrEmpty(name) || name.Length > MAX_LENGTH_NAME)
            {
                return Result.Failure<TaskCreator>($"Имя задачи не может быть пустым и превышать {MAX_LENGTH_NAME} символов");
            }
            if (string.IsNullOrEmpty(description) || description.Length > MAX_LENHTH_DESCRIPTION)
            {
                return Result.Failure<TaskCreator>($"Описание задачи не может быть пустым и превышать {MAX_LENHTH_DESCRIPTION} символов");
            }

            TaskCreator taskCreator = new TaskCreator(id, name, description);

            return Result.Success(taskCreator);
        }

        public static Result<TaskCreator> Create(string name, string description)
        {
            if (string.IsNullOrEmpty(name) || name.Length > MAX_LENGTH_NAME)
            {
                return Result.Failure<TaskCreator>($"Имя задачи не может быть пустым и превышать {MAX_LENGTH_NAME} символов");
            }
            if (string.IsNullOrEmpty(description) || description.Length > MAX_LENHTH_DESCRIPTION)
            {
                return Result.Failure<TaskCreator>($"Описание задачи не может быть пустым и превышать {MAX_LENHTH_DESCRIPTION} символов");
            }

            TaskCreator taskCreator = new TaskCreator(Guid.NewGuid(), name, description);

            return Result.Success(taskCreator);
        }
    }
}
