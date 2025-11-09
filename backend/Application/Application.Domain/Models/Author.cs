using CSharpFunctionalExtensions;

namespace Application.Domain.Models
{
    public class Author
    {
        const int MAX_LENGTH_NAME = 50;

        const int MAX_LENGTH_DESCRIPTION = 500;

        /// <summary>
        /// Id автора
        /// </summary>
        public Guid Id { get; }

        /// <summary>
        /// Имя автора
        /// </summary>
        public string Name { get; } = string.Empty;

        /// <summary>
        /// Информация об авторе
        /// </summary>
        public string Description { get; } = string.Empty;

        /// <summary>
        /// Кол-во курсов, созданных автором
        /// </summary>
        public int CountCourses { get; private set; } = 0;

        public List<Course> Courses { get; } = new List<Course>();

        private Author(Guid id, string name, string description)
        {
            Id = id;
            Name = name;
            Description = description;
        }

        public static Result<Author> Create(Guid id, string name, string description)
        {
            if (string.IsNullOrEmpty(name) || name.Length > MAX_LENGTH_NAME)
            {
                return Result.Failure<Author>($"Имя автора не может быть пустым и превышать {MAX_LENGTH_NAME} символов");
            }

            if (string.IsNullOrEmpty(description) || description.Length > MAX_LENGTH_DESCRIPTION)
            {
                return Result.Failure<Author>($"Информация об авторе не может быть пустым и превышать {MAX_LENGTH_DESCRIPTION} символов");
            }

            Author autor = new Author(id, name, description);

            return Result.Success(autor);
        }
    }
}
