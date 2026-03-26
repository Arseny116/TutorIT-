using CSharpFunctionalExtensions;

namespace Application.Domain.Models
{
    public class Question
    {
        const int MAX_LENGTH_ANSWER = 100;

        /// <summary>
        /// Id вопроса
        /// </summary>
        public Guid Id { get; }

        /// <summary>
        /// Сам ответ на вопрос
        /// </summary>
        public string Name { get; } = string.Empty;

        /// <summary>
        /// Ответ на вопрос(bool)
        /// </summary>
        public bool Answer { get; }

        private Question(Guid id, string name, bool answer)
        {
            Id = id;
            Name = name;
            Answer = answer;
        }

        public static Result<Question> Create(Guid id, string name, bool answer)
        {
            if (string.IsNullOrEmpty(name) || name.Length > MAX_LENGTH_ANSWER)
            {
                return Result.Failure<Question>($"Вопрос не может путь пустым и превышать {MAX_LENGTH_ANSWER} символов");
            }

            Question question = new Question(id, name, answer);

            return Result.Success(question);
        }
        public static Result<Question> Create( string name, bool answer)
        {
            if (string.IsNullOrEmpty(name) || name.Length > MAX_LENGTH_ANSWER)
            {
                return Result.Failure<Question>($"Вопрос не может путь пустым и превышать {MAX_LENGTH_ANSWER} символов");
            }

            Question question = new Question(Guid.NewGuid(), name, answer);

            return Result.Success(question);
        }
    }
}
