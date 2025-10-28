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

        public TaskCreator(Guid id, string name, string description, List<Question> questions)
        {
            Id = id;
            Name = name;
            Description = description;
            Questions = questions;
        }

        public static Result<TaskCreator> Create(Guid id, string name, string description, List<Question> questions)
        {
            if (string.IsNullOrEmpty(name))
            {
                return Result.Failure<TaskCreator>("Имя задачи не может быть пустым");
            }
            if (string.IsNullOrEmpty(description))
            {
                return Result.Failure<TaskCreator>("Описание задачи не может быть пустым");
            }


            var successQuestions = new List<Question>();
            foreach (Question question in questions)
            {
                var result = Question.Create(question.Id, question.Name, question.Answer);

                if (result.IsSuccess)
                {
                    successQuestions.Add(result.Value);
                }
            }

            TaskCreator taskCreator = new TaskCreator(id, name, description, successQuestions);

            return Result.Success(taskCreator);
        }
    }
}
