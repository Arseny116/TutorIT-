using Application.API.DTO.TasksCreator;
using Application.App.Services;
using Application.Domain.Interface.ITaskQuestion.ITask;
using Application.Domain.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Application.API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class TasksCreatorsController : ControllerBase
    {
        private readonly string _staticFilePath = Path.Combine("StaticFiles");

        private readonly ITasksCreatorService _tasksCreatorService;
        private readonly ImageService _imageService;

        public TasksCreatorsController(ITasksCreatorService tasksCreatorService, ImageService imageService)
        {
            _tasksCreatorService = tasksCreatorService;
            _imageService = imageService;
        }



        [Authorize]
        [HttpGet("{ChapterId:guid}")]
        public async Task<ActionResult<List<TasksCreatorResponse>>> GetTasksCreator(Guid ChapterId)
        {
            var tasksCreator = await _tasksCreatorService.GetTasksCreator(ChapterId);

            var response = tasksCreator.Select(t => new TasksCreatorResponse(
                t.Id,
                t.Name,
                t.Description,
                t.Hint,
                t.TitleImage?.FileName,
                t.Questions));

            return Ok(response);
        }


        [Authorize]
        [HttpPost]
        public async Task<ActionResult<Guid>> CreateTaskCreator(Guid ChapterId, [FromForm] TasksCreatorRequest request)
        {
            var image = await _imageService.CreateImage(request.TitleImage, _staticFilePath, "Task");

            if (image.IsFailure)
            {
                return BadRequest(image.Error);
            }

            var taskCreator = TaskCreator.Create
            (
                request.Name,
                request.Description,
                request.Hint,
                image.Value);

            if (!taskCreator.IsSuccess)
            {
                return BadRequest(taskCreator.Value);
            }

            var taskCreatorId = await _tasksCreatorService.CreateTaskCreator(ChapterId, taskCreator.Value);

            return Ok(taskCreatorId);
        }



        [Authorize]
        [HttpPut("{id:guid}")]
        public async Task<ActionResult<Guid>> UpdateTaskCreator(Guid id, [FromBody] TasksCreatorRequest request)
        {
            var taskCreatorId = await _tasksCreatorService.UpdateTaskCreator(
                id,
                request.Name,
                request.Description,
                request.Hint);

            return Ok(taskCreatorId);
        }



        [Authorize]
        [HttpDelete("{id:guid}")]
        public async Task<ActionResult<Guid>> DeleteTaskCreator(Guid id)
        {
            return Ok(await _tasksCreatorService.DeleteTaskCreator(id));
        }
    }
}
