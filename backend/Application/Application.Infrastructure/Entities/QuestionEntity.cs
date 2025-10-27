namespace Application.Infrastructure.Entities
{
    public class QuestionEntity
    {
        /// <summary>
        /// Id вопроса
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// Сам вопроса
        /// </summary>
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Ответ на вопрос
        /// </summary>
        public bool Answer { get; set; }
    }
}
