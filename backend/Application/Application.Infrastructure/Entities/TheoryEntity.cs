using Application.Domain.Models;

namespace Application.Infrastructure.Entities
{
    public class TheoryEntity
    {
        public TheoryEntity()
        {
        }

        /// <summary>
        /// Id блока теории
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// Название блока теории
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Содержимое блока теории
        /// </summary>
        public string Article { get; set; }

        public Guid ChapterID { get; set; }

        public ChapterEntity? Chapter { get; set; }
    }
}
