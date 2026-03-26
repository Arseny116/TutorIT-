using CSharpFunctionalExtensions;

namespace Application.Domain.Models
{
    public class Chapter
    {
        const int MAX_NUMBER_THEORYBLOKS_TASKS = 10;

        const int MAX_LENGTH_NAME = 150;

        const int MAX_LENGTH_DESCRIPTION = 1500;

        /// <summary>
        /// Id раздела
        /// </summary>
        public Guid Id { get; }

        /// <summary>
        /// Название раздела
        /// </summary>
        public string Name { get; } = string.Empty;

        /// <summary>
        /// Описание раздела
        /// </summary>
        public string Description { get; } = string.Empty;

        /// <summary>
        /// Кол-во блоков теории
        /// </summary>
        public int NumberTheoryBloks { get; } = 0;

        /// <summary>
        /// Кол-во задание
        /// </summary>
        public int NumberTasks { get; } = 0;

        public List<Theory> Theories { get; } = new List<Theory>();

        public List<TaskCreator> Tasks { get; } = new List<TaskCreator>();



        private Chapter(Guid id, string name, string description, int numberTheoryBloks, int numberTasks)
        {
            Id = id;
            Name = name;
            Description = description;
            NumberTheoryBloks = numberTheoryBloks;
            NumberTasks = numberTasks;
        }

        public static Result<Chapter> Create(string name, string description, int numberTheoryBloks, int numberTasks)
        {
            if (string.IsNullOrEmpty(name) || name.Length > MAX_LENGTH_NAME)
            {
                return Result.Failure<Chapter>($"Название раздела не может быть пустым и превышать {MAX_LENGTH_NAME} символов");
            }

            if (string.IsNullOrEmpty(description) || description.Length > MAX_LENGTH_DESCRIPTION)
            {
                return Result.Failure<Chapter>($"Описание раздела не может быть пустым и превышать {MAX_LENGTH_DESCRIPTION} символов");
            }

            if (numberTheoryBloks <= 0 || numberTheoryBloks > MAX_NUMBER_THEORYBLOKS_TASKS)
            {
                return Result.Failure<Chapter>($"Кол-во блоков теории должно быть в диапазоне от 1 до {MAX_NUMBER_THEORYBLOKS_TASKS}(включительно)");
            }

            if (numberTasks <= 0 || numberTasks > MAX_NUMBER_THEORYBLOKS_TASKS)
            {
                return Result.Failure<Chapter>($"Кол-во задач должно быть в диапазоне от 1 до {MAX_NUMBER_THEORYBLOKS_TASKS}(включительно)");
            }

            Chapter chapter = new Chapter(Guid.NewGuid(), name, description, numberTheoryBloks, numberTasks);

            return Result.Success(chapter);
        }


        public static Result<Chapter> Create(Guid id , string name, string description, int numberTheoryBloks, int numberTasks)
        {
            if (string.IsNullOrEmpty(name) || name.Length > MAX_LENGTH_NAME)
            {
                return Result.Failure<Chapter>($"Название раздела не может быть пустым и превышать {MAX_LENGTH_NAME} символов");
            }

            if (string.IsNullOrEmpty(description) || description.Length > MAX_LENGTH_DESCRIPTION)
            {
                return Result.Failure<Chapter>($"Описание раздела не может быть пустым и превышать {MAX_LENGTH_DESCRIPTION} символов");
            }

            if (numberTheoryBloks <= 0 || numberTheoryBloks > MAX_NUMBER_THEORYBLOKS_TASKS)
            {
                return Result.Failure<Chapter>($"Кол-во блоков теории должно быть в диапазоне от 1 до {MAX_NUMBER_THEORYBLOKS_TASKS}(включительно)");
            }

            if (numberTasks <= 0 || numberTasks > MAX_NUMBER_THEORYBLOKS_TASKS)
            {
                return Result.Failure<Chapter>($"Кол-во задач должно быть в диапазоне от 1 до {MAX_NUMBER_THEORYBLOKS_TASKS}(включительно)");
            }

            Chapter chapter = new Chapter(id, name, description, numberTheoryBloks, numberTasks);

            return Result.Success(chapter);
        }
    }
}
