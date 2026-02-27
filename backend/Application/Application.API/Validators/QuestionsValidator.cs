using Application.API.DTO.Questions;
using Application.Domain.Interface.ITaskQuestion.IQuestion;
using FluentValidation;

namespace Application.API.Validators
{
    public class QuestionsValidator : AbstractValidator<(Guid TaskCreatorId, QuestionsRequest Request)>
    {
        private readonly IQuestionsService _questionsService;

        public QuestionsValidator(IQuestionsService questionsService)
        {
            _questionsService = questionsService;

            RuleFor(x => x.Request.Name)
                .MustAsync(async (context, name, cancellation) =>
                {
                    var existingQuestions = await _questionsService.GetQuestions(context.TaskCreatorId);

                    return !existingQuestions.Any(q => q.Name.Trim().ToLower() == name.Trim().ToLower());
                })
                .WithMessage(x => $"В этой задаче уже существует вопрос с ответом.");
        }
    }
}
