using Application.API.DTO.Courses;
using FluentValidation;

namespace Application.API.Validators
{
    public class CourseValidator: AbstractValidator<CoursesRequest>
    {
        public CourseValidator()
        {
            RuleFor(Course => Course.Title)
                .NotNull()
                .NotEmpty()
                .MaximumLength(30)
                .WithMessage("{PropertyName} - Ошибка длины Title");

            RuleFor(Course => Course.Description)
                .NotNull()
                .NotEmpty()
                .MaximumLength(500)
                .WithMessage("{PropertyName} - Ошибка длины Description > 500");

        }
    }
}
