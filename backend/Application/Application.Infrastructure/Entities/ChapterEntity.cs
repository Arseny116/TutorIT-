using Application.Domain.Models.TaskQuestion;
using Application.Domain.Models;

namespace Application.Infrastructure.Entities
{
    public class ChapterEntity
    {
        /// <summary>
        /// Id раздела
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// Название раздела
        /// </summary>
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Описание раздела
        /// </summary>
        public string Description { get; set; } = string.Empty;

        /// <summary>
        /// Кол-во блоков теории
        /// </summary>
        public int NumberTheoryBloks { get; set; } = 0;

        /// <summary>
        /// Кол-во задание
        /// </summary>
        public int NumberTasks { get; set; } = 0;

        public List<TaskCreatorEntity> Tasks { get; set; } = new List<TaskCreatorEntity>();

        public List<TheoryEntity> Theories { get; set; } = new List<TheoryEntity>();

        public Guid CourseID { get; set; }

        public Course? Course { get; set; }
    }
}
