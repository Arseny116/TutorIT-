using CSharpFunctionalExtensions;

namespace Application.Domain.Models
{
    public class Question
    {
        /// <summary>
        /// Id вопроса
        /// </summary>
        public Guid Id { get; }

        /// <summary>
        /// Сам вопроса
        /// </summary>
        public string Name { get; } = string.Empty;

        /// <summary>
        /// Ответ на вопрос
        /// </summary>
        public bool Answer { get; }

        public Question(Guid id, string name, bool answer)
        {
            Id = id;
            Name = name;
            Answer = answer;
        }

        public static Result<Question> Create(Guid id, string name, bool answer)
        {
            if (string.IsNullOrEmpty(name))
            {
                return Result.Failure<Question>("Вопрос не может путь пустым");
            }

            Question question = new Question(id, name, answer);

            return Result.Success(question);
        }
    }
}
