using CSharpFunctionalExtensions;

namespace Application.Domain.Models
{
    public class Course
    {
        /// <summary>
        /// Id курса
        /// </summary>
        public Guid Id { get; }

        /// <summary>
        /// Заголовок курса
        /// </summary>
        public string Title { get; } = string.Empty;

        /// <summary>
        /// Описание курса
        /// </summary>
        public string Description { get; } = string.Empty;

        /// <summary>
        /// Кол-во глав в курсе
        /// </summary>
        public int Chapters { get; }

        /// <summary>
        /// Оценка курса (по 5-ти бальной шкале)
        /// </summary>
        public double Evaluation { get; } = 0.0;

        /// <summary>
        /// Отзывы о курсе
        /// </summary>
        public List<string> Reviews { get; } = [];

        /// <summary>
        /// Кол-во людей записанных на курс
        /// </summary>
        public int Subscribe { get; private set; } = 0;

        public List<Chapter> NumberChapters { get; } = new List<Chapter>();

        private Course(Guid id, string title, string description, int chapters)
        {
            Id = id;
            Title = title;
            Description = description;
            Chapters = chapters;
        }

        public static Result<Course> Create(Guid id, string title, string description, int chapters)
        {
            if (string.IsNullOrEmpty(title))
            {
                return Result.Failure<Course>($"Заголовок курса не может быть пустым");
            }

            if (string.IsNullOrEmpty(description))
            {
                return Result.Failure<Course>($"Описание курса не может быть пустым");
            }

            if (chapters <= 0)
            {
                return Result.Failure<Course>($"Кол-во заданий в курсе должно быть больше 0");
            }

            Course course = new Course(id, title, description, chapters);

            return Result.Success(course);
        }
    }
}
