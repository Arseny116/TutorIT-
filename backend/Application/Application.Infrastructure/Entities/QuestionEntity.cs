namespace Application.Infrastructure.Entities
{
    public class QuestionEntity
    {
        /// <summary>
        /// Id вопроса
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// Сам ответ на вопрос
        /// </summary>
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Ответ на вопрос(bool)
        /// </summary>
        public bool Answer { get; set; }

        public Guid TaskCreatorId { get; set; }

        public TaskCreatorEntity? TaskCreator { get; set; }
    }
}
