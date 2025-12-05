using Application.Domain.Models;

namespace Application.Infrastructure.Entities
{
    public class ChapterEntity
    {

        public ChapterEntity()
        {

        }
        public ChapterEntity(string name, string description, int numberTheoryBloks, int numberTasks)
        {
            Id = Guid.NewGuid();
            Name = name;
            Description = description;
            NumberTheoryBloks = numberTheoryBloks;
            NumberTasks = numberTasks;
        }

        /// <summary>
        /// Id раздела
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// Название раздела
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Описание раздела
        /// </summary>
        public string Description { get; set; } 

        /// <summary>
        /// Кол-во блоков теории
        /// </summary>
        public int NumberTheoryBloks { get; set; } 

        /// <summary>
        /// Кол-во задание
        /// </summary>
        public int NumberTasks { get; set; } 

        public List<TheoryEntity> Theories { get; set; } 

        public List<TaskCreatorEntity> Tasks { get; set; } 

        public Guid CourseID { get; set; }

        public CourseEntity? Course { get; set; }
    }
}
