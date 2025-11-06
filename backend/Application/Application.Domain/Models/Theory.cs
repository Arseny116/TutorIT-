using CSharpFunctionalExtensions;

namespace Application.Domain.Models
{
    public class Theory
    {
        const int MAX_LENGTH_NAME = 200;

        /// <summary>
        /// Id блока теории
        /// </summary>
        public Guid Id { get; }

        /// <summary>
        /// Название блока теории
        /// </summary>
        public string Name { get; } = string.Empty;

        /// <summary>
        /// Содержимое блока теории
        /// </summary>
        public string Article { get; } = string.Empty;

        private Theory(Guid id, string name, string article)
        {
            Id = id;
            Name = name;
            Article = article;
        }

        public static Result<Theory> Create(Guid id, string name, string article)
        {
            if (string.IsNullOrEmpty(name) || name.Length > MAX_LENGTH_NAME)
            {
                return Result.Failure<Theory>($"Название блока теории не может быть пустым и превышать {MAX_LENGTH_NAME} символов");
            }

            if (string.IsNullOrEmpty(article))
            {
                return Result.Failure<Theory>("Содержимое блока не может быть пустым");
            }

            Theory theory = new Theory(id, name, article);

            return Result.Success(theory);
        }
    }
}
