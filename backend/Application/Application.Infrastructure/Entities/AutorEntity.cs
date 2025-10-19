namespace Application.Infrastructure.Entities
{
    public class AutorEntity
    {
        /// <summary>
        /// Id автора
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// Имя автора
        /// </summary>
        public string? Name { get; set; }

        /// <summary>
        /// Информация об авторе
        /// </summary>
        public string? Description { get; set; }

        /// <summary>
        /// Кол-во курсов, созданных автором
        /// </summary>
        public int CountCourses { get; set; } = 0;

        public Dictionary<Guid, CourseEntity> Courses { get; set; } = [];
    }
}
