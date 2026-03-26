using CSharpFunctionalExtensions;
using System.ComponentModel.DataAnnotations;
using static System.Net.WebRequestMethods;

namespace Application.Domain.Models
{
    public class Image
    {
        /// <summary>
        /// Id соответсвующего курса, вопроса и т.д.
        /// </summary>
        [Key]
        public Guid ModelId { get; set; }

        /// <summary>
        /// Имя файла
        /// </summary>
        public string FileName { get; set; } = string.Empty;

        private Image(string fileName)
        {
            FileName = fileName;
        }

        public static Result<Image> Create(string fileName)
        {
            if (string.IsNullOrEmpty(fileName))
            {
                return Result.Failure<Image>($"Имя файла не может быть пустым.");
            }

            Image image = new Image(fileName);

            return Result.Success(image);
        }
    }
}
