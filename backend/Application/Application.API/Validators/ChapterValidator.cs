using Application.API.DTO.Chapters;
using Application.API.DTO.Courses;
using FluentValidation;

namespace Application.API.Validators
{
    public class ChapterValidator : AbstractValidator<ChaptersRequest>
    {
        public ChapterValidator()
        {
            RuleFor(N => N.Name)
                .NotNull()
                .NotEmpty()
                .MaximumLength(30)
                .WithMessage("{PropertyName} - Ошибка длины Name");

            RuleFor(D => D.Description)
                .NotNull()
                .NotEmpty()
                .MaximumLength(500)
                .MinimumLength(15)
                .WithMessage("{PropertyName} - Ошибка длины Description (length >15 and < 500");

           RuleFor(N => N.NumberTheoryBloks)
            .GreaterThan(1)
            .LessThan(5)
            .WithMessage("{PropertyName} - Ошибка: кол-во блоков теории вне диапазона (1..5) ");

            RuleFor(N => N.NumberTasks)
          .GreaterThan(1)
          .LessThan(5)
          .WithMessage("{PropertyName} - Ошибка: кол-во блоков заданий вне диапазона (1..5) ");
        }
    }
}