using System.ComponentModel.DataAnnotations.Schema;
using CSharpFunctionalExtensions;

namespace Application.Domain.Models
{
    public class Course
    {
        const int MAX_LENGTH_PL = 40;

        const int MAX_LENGTH_TITLE = 300;

        const int MAX_LENGTH_DESCRIPTION = 3000;

        const int MIN_COMPLEXITY_AND_CHAPTERS = 1;

        const int MAX_COMPLEXITY = 3;

        /// <summary>
        /// Id курса
        /// </summary>
        public Guid Id { get; }

        public string  Pl { get; }

        public Guid AuthorId { get;  }

        public string Title { get; } = string.Empty;

        public string Description { get; } = string.Empty;

        public int Chapters { get; }

        public int Сomplexity { get; }

        /// <summary>
        /// Изображение
        /// </summary>
        public Image? TitleImage { get; }

        /// <summary>
        /// Оценка курса (по 5-ти бальной шкале)
        /// </summary>
        public double Evaluation { get; } = 0.0;

        public List<string> Reviews { get; } = [];
        public int Subscribe { get; private set; } = 0;

        public List<Chapter> NumberChapters { get; } = new List<Chapter>();

        private Course(Guid id, string pl, string title, string description, int chapters, int complexity, Image? titleImage)
        {
            Id = id;
            Pl = pl;
            Title = title;
            Description = description;
            Chapters = chapters;
            Сomplexity = complexity;
            TitleImage = titleImage;
        }

        public static Result<Course> Create(
            Guid id,
            string pl,
            string title,
            string description,
            int chapters,
            int complexity,
            Image? titleImage)
        {
            if (string.IsNullOrEmpty(pl) || pl.Length > MAX_LENGTH_PL)
            {
                return Result.Failure<Course>($"Язык программирования курса не может быть пустым и превышать {MAX_LENGTH_PL} символов");
            }

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

            Course course = new Course(id, pl, title, description, chapters, complexity, titleImage);

            return Result.Success(course);
        }




    }
}
