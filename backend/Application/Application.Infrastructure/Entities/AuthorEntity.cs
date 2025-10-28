namespace Application.Infrastructure.Entities
{
    public class AuthorEntity
    {
        /// <summary>
        /// Id автора
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// Имя автора
        /// </summary>
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Информация об авторе
        /// </summary>
        public string Description { get; set; } = string.Empty;

        /// <summary>
        /// Кол-во курсов, созданных автором
        /// </summary>
        public int CountCourses { get; set; } = 0;

        public List<CourseEntity> Courses { get; set; } = new List<CourseEntity>();
    }
}
