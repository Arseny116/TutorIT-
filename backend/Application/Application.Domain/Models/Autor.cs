using CSharpFunctionalExtensions;

namespace Application.Domain.Models
{
    public class Autor
    {
        /// <summary>
        /// Id автора
        /// </summary>
        public Guid Id { get; }

        /// <summary>
        /// Имя автора
        /// </summary>
        public string? Name { get; }

        /// <summary>
        /// Информация об авторе
        /// </summary>
        public string? Description { get; }

        /// <summary>
        /// Кол-во курсов, созданных автором
        /// </summary>
        public int CountCourses { get; } = 0;

        public Autor(Guid id, string? name, string? description)
        {
            Id = id;
            Name = name;
            Description = description;
        }

        public static Result<Autor> Crreate(Guid id, string? name, string? description)
        {
            if (string.IsNullOrEmpty(name))
            {
                return Result.Failure<Autor>("Имя автора не может быть пустым");
            }

            if (string.IsNullOrEmpty(description))
            {
                return Result.Failure<Autor>("Информация об авторе не может быть пустым");
            }

            Autor autor = new Autor(id, name, description);

            return Result.Success(autor);
        }
    }
}
