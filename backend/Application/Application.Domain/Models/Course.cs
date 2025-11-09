using CSharpFunctionalExtensions;

namespace Application.Domain.Models
{
    public class Course
    {
        const int MAX_LENGTH_TITLE = 300;

        const int MAX_LENGTH_DESCRIPTION = 3000;

        const int MIN_COMPLEXITY_AND_CHAPTERS = 1;

        const int MAX_COMPLEXITY = 3;

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
        /// Сложность курса
        /// </summary>
        public int Сomplexity { get; }

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

        private Course(Guid id, string title, string description, int chapters, int complexity)
        {
            Id = id;
            Title = title;
            Description = description;
            Chapters = chapters;
            Сomplexity = complexity;
        }

        public static Result<Course> Create(Guid id, string title, string description, int chapters, int complexity)
        {
            if (string.IsNullOrEmpty(title) || title.Length > MAX_LENGTH_TITLE)
            {
                return Result.Failure<Course>($"Заголовок курса не может быть пустым и превышать {MAX_LENGTH_TITLE} символов");
            }

            if (string.IsNullOrEmpty(description) || description.Length > MAX_LENGTH_DESCRIPTION)
            {
                return Result.Failure<Course>($"Описание курса не может быть пустым и превышать {MAX_LENGTH_DESCRIPTION} символов");
            }

            if (chapters < MIN_COMPLEXITY_AND_CHAPTERS)
            {
                return Result.Failure<Course>($"Кол-во заданий в курсе должно быть больше 0");
            }

            if (complexity < MIN_COMPLEXITY_AND_CHAPTERS || complexity > MAX_COMPLEXITY)
            {
                return Result.Failure<Course>($"Сложность курса выходит за диапозон от {MIN_COMPLEXITY_AND_CHAPTERS} по {MAX_COMPLEXITY}");
            }

            Course course = new Course(id, title, description, chapters, complexity);

            return Result.Success(course);
        }
    }
}
