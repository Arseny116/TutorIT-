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
        /// Кол-во заданий на курсе
        /// </summary>
        public int Tasks { get; }

        /// <summary>
        /// Оценка курса (по 5-ти бальной шкале)
        /// </summary>
        public double Evaluation { get; } = 0.0;

        /// <summary>
        /// Отзывы о курсе
        /// </summary>
        public string? Reviews { get; }

        /// <summary>
        /// Кол-во людей записанных на курс
        /// </summary>
        public int Subscribe { get; private set; } = 0;


        private Course(Guid id, string title, string description, int tasks)
        {
            Id = id;
            Title = title;
            Description = description;
            Tasks = tasks;
        }

        public static Result<Course> Create(Guid id, string title, string description, int tasks)
        {
            if (string.IsNullOrEmpty(title))
            {
                return Result.Failure<Course>($"Заголовок курса не может быть пустым");
            }

            if (string.IsNullOrEmpty(description))
            {
                return Result.Failure<Course>($"Описание курса не может быть пустым");
            }

            if (tasks <= 0)
            {
                return Result.Failure<Course>($"Кол-во заданий в курсе должно быть больше 0");
            }

            Course course = new Course(id, title, description, tasks);

            return Result.Success(course);
        }
    }
}
