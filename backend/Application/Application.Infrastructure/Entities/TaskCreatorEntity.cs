using Application.Domain.Models;

namespace Application.Infrastructure.Entities
{
    public class TaskCreatorEntity
    {
        public TaskCreatorEntity()
        {
        }

        /// <summary>
        /// Id Задачи
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// Название задачи
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Описание задачи
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Список вопросов
        /// </summary>
        public List<QuestionEntity> Questions { get; set; } 

        public Guid ChapterID { get; set; }

        public ChapterEntity? Chapter { get; set; }
    }
}
