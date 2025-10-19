using CSharpFunctionalExtensions;

namespace Application.Domain.Models
{
    public class Author
    {
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

        public Author(Guid id, string name, string description)
        {
            Id = id;
            Name = name;
            Description = description;
        }

        public static Result<Author> Create(Guid id, string name, string description)
        {
            if (string.IsNullOrEmpty(name))
            {
                return Result.Failure<Author>("Имя автора не может быть пустым");
            }

            if (string.IsNullOrEmpty(description))
            {
                return Result.Failure<Author>("Информация об авторе не может быть пустым");
            }

            Author autor = new Author(id, name, description);

            return Result.Success(autor);
        }
    }
}
