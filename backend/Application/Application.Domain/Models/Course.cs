namespace Application.Domain.Models
{
    public class Course
    {
        /// <summary>
        /// Заголовок курса
        /// </summary>
        public string? Title { get; }

        /// <summary>
        /// Описание курса
        /// </summary>
        public string? Description { get; }

        /// <summary>
        /// Оценка курса (по 5-ти бальной шкале)
        /// </summary>
        public double? Evaluation { get; }

        /// <summary>
        /// Отзывы о курсе
        /// </summary>
        public string? Reviews { get; }

        /// <summary>
        /// Кол-во людей записанных на курс
        /// </summary>
        public int Subscribe { get; }

        /// <summary>
        /// Кол-во заданий на курсе
        /// </summary>
        public int Tasks { get; }
    }
}
