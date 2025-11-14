namespace Application.Infrastructure.Entities
{
    public class CourseEntity
    {
        public CourseEntity()
        {
        }

        /// <summary>
        /// Id курса
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// Заголовок курса
        /// </summary>
        public string Title { get; set; } = string.Empty;

        /// <summary>
        /// Описание курса
        /// </summary>
        public string Description { get; set; } = string.Empty;

        /// <summary>
        /// Кол-во глав в курсе
        /// </summary>
        public int Chapters { get; set; }

        /// <summary>
        /// Сложность курса
        /// </summary>
        public int Сomplexity { get; set; }

        /// <summary>
        /// Оценка курса (по 5-ти бальной шкале)
        /// </summary>
        public double Evaluation { get; set; } = 0.0;

        /// <summary>
        /// Отзывы о курсе
        /// </summary>
        public List<string> Reviews { get; set; } = [];

        /// <summary>
        /// Кол-во людей записанных на курс
        /// </summary>
        public int Subscribe { get; set; } = 0;

        public List<ChapterEntity> NumberChapters { get; set; } = new List<ChapterEntity>();

        public Guid AutorId { get; set; }

        public AuthorEntity? Autor { get; set; }
    }
}
