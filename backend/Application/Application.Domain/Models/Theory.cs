using CSharpFunctionalExtensions;

namespace Application.Domain.Models
{
    public class Theory
    {
        const int MAX_LENGTH_NAME = 50;

        /// <summary>
        /// Id блока теории
        /// </summary>
        public Guid Id { get; }

        /// <summary>
        /// Название блока теории
        /// </summary>
        public string Name { get; } = string.Empty;

        /// <summary>
        /// Содержимое блока теории
        /// </summary>
        public string Article { get; } = string.Empty;

        /// <summary>
        /// Изображение
        /// </summary>
        public Image? TitleImage { get; }

        private Theory(Guid id, string name, string article, Image? titleImage)
        {
            Id = id;
            Name = name;
            Article = article;
            TitleImage = titleImage;
        }

        public static Result<Theory> Create(string name, string article, Image? titleImage = null)
        {
            if (string.IsNullOrEmpty(name) || name.Length > MAX_LENGTH_NAME)
            {
                return Result.Failure<Theory>($"Название блока теории не может быть пустым и превышать {MAX_LENGTH_NAME} символов");
            }

            if (string.IsNullOrEmpty(article))
            {
                return Result.Failure<Theory>("Содержимое блока не может быть пустым");
            }

            Theory theory = new Theory(Guid.NewGuid(), name, article, titleImage);

            return Result.Success(theory);
        }

        public static Result<Theory> Create(Guid id, string name, string article, Image? titleImage = null)
        {
            if (string.IsNullOrEmpty(name) || name.Length > MAX_LENGTH_NAME)
            {
                return Result.Failure<Theory>($"Название блока теории не может быть пустым и превышать {MAX_LENGTH_NAME} символов");
            }

            if (string.IsNullOrEmpty(article))
            {
                return Result.Failure<Theory>("Содержимое блока не может быть пустым");
            }

            Theory theory = new Theory(id, name, article, titleImage);

            return Result.Success(theory);
        }

    }
}
