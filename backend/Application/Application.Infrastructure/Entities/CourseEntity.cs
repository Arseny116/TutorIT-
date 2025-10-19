namespace Application.Infrastructure.Entities
{
    public class CourseEntity
    {
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
        /// Кол-во заданий на курсе
        /// </summary>
        public int Tasks { get; set; }

        /// <summary>
        /// Оценка курса (по 5-ти бальной шкале)
        /// </summary>
        public double Evaluation { get; set; } = 0.0;

        /// <summary>
        /// Отзывы о курсе
        /// </summary>
        public string? Reviews { get; set; }

        /// <summary>
        /// Кол-во людей записанных на курс
        /// </summary>
        public int Subscribe { get; set; } = 0;

        public Guid AutorId { get; set; }

        public AutorEntity? Autor { get; set; }
    }
}
