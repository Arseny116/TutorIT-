using CSharpFunctionalExtensions;

namespace Application.Domain.Models
{
    public class TaskCreator
    {
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
        public List<Question> Questions { get; } = [];

        public TaskCreator(Guid id, string name, string description)
        {
            Id = id;
            Name = name;
            Description = description;
        }

        public static Result<TaskCreator> Create(Guid id, string name, string description)
        {
            if (string.IsNullOrEmpty(name))
            {
                return Result.Failure<TaskCreator>("Имя задачи не может быть пустым");
            }
            if (string.IsNullOrEmpty(description))
            {
                return Result.Failure<TaskCreator>("Описание задачи не может быть пустым");
            }

            TaskCreator taskCreator = new TaskCreator(id, name, description);

            return Result.Success(taskCreator);
        }
    }
}
