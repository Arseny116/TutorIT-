namespace Application.Infrastructure.Entities
{
    public class QuestionEntity
    {
        /// <summary>
        /// Id вопроса
        /// </summary>
        public Guid Id { get; }

        /// <summary>
        /// Сам вопроса
        /// </summary>
        public string Name { get; } = string.Empty;

        /// <summary>
        /// Ответ на вопрос
        /// </summary>
        public bool Answer { get; }
    }
}
