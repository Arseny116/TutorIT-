using Application.API.DTO.Courses;
using Application.API.DTO.TasksCreator;
using FluentValidation;

namespace Application.API.Validators
{
    public class TasksCreatorValidator : AbstractValidator<TasksCreatorRequest>
    {
        public TasksCreatorValidator()
        {
            RuleFor(N => N.Name)
                .NotNull()
                .NotEmpty()
                .MaximumLength(60)
                .WithMessage("{PropertyName} - Ошибка длины Title > 60");

            RuleFor(N => N.Description)
                .NotNull()
                .NotEmpty()
                .MaximumLength(300)
                .WithMessage("{PropertyName} - Ошибка длины Description > 300");

        }
    }
}
