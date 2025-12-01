using Application.API.DTO.Questions;
using Application.Domain.Interface.ITaskQuestion.IQuestion;
using Application.Domain.Models;
using Microsoft.AspNetCore.Mvc;

namespace Application.API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class QuestionsController : ControllerBase
    {
        private readonly IQuestionsService _questionsService;

        public QuestionsController(IQuestionsService questionsService)
        {
            _questionsService = questionsService;
        }

        [HttpGet("{TaskCreator:guid}")]
        public async Task<ActionResult<List<QuestionsResponse>>> GetQuestions(Guid TaskCreator)
        {
            var questions = await _questionsService.GetQuestions(TaskCreator    );

            var response = questions.Select(x => new QuestionsResponse(
                x.Id,
                x.Name,
                x.Answer));

            return Ok(response);
        }

        [HttpPost]
        public async Task<ActionResult<Guid>> CreateQuestion(Guid TaskCreatorId,[FromBody] QuestionsRequest request)
        {
            var question = Question.Create(
                request.Name,
                request.Answer);

            if (!question.IsSuccess)
            {
                return BadRequest(question.Value);
            }

            var questionId = await _questionsService.CreateQuestion(TaskCreatorId ,question.Value);

            return Ok(questionId);
        }

        [HttpPut("{id:guid}")]
        public async Task<ActionResult<Guid>> UpdateQuestion(Guid id, [FromBody] QuestionsRequest request)
        {
            var questionId = await _questionsService.UpdateQuestion(id, request.Name, request.Answer);

            return Ok(questionId);
        }

        [HttpDelete("{id:guid}")]
        public async Task<ActionResult<Guid>> DeleteQuestion(Guid id)
        {
            return Ok(await _questionsService.DeleteQuestion(id));
        }
    }
}
