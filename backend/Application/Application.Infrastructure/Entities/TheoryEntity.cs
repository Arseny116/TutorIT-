using Application.Domain.Models;

namespace Application.Infrastructure.Entities
{
    public class TheoryEntity
    {
        /// <summary>
        /// Id блока теории
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// Название блока теории
        /// </summary>
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Содержимое блока теории
        /// </summary>
        public string Article { get; set; } = string.Empty;

        public Guid ChpterID { get; set; }

        public Chapter? Chapter { get; set; }
    }
}
