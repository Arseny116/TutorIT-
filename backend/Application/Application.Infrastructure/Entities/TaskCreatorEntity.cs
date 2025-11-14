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
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Описание задачи
        /// </summary>
        public string Description { get; set; } = string.Empty;

        /// <summary>
        /// Список вопросов
        /// </summary>
        public List<QuestionEntity> Questions { get; set; } = new List<QuestionEntity>();

        public Guid ChpterID { get; set; }

        public ChapterEntity? Chapter { get; set; }
    }
}
