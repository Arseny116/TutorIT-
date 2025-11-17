using Application.API.DTO.TasksCreator;
using Application.Domain.Interface.ITaskQuestion.ITask;
using Application.Domain.Models.TaskQuestion;
using Microsoft.AspNetCore.Mvc;

namespace Application.API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class TasksCreatorController : ControllerBase
    {
        private readonly ITasksCreatorService _tasksCreatorService;

        public TasksCreatorController(ITasksCreatorService tasksCreatorService)
        {
            _tasksCreatorService = tasksCreatorService;
        }

        [HttpGet("GetAllTasks")]
        public async Task<ActionResult<List<TasksCreatorResponse>>> GetTasksCreator()
        {
            var tasksCreator = await _tasksCreatorService.GetTasksCreator();

            var response = tasksCreator.Select(t => new TasksCreatorResponse(
                t.Id,
                t.Name,
                t.Description,
                t.Questions));

            return Ok(response);
        }

        [HttpPost("CreateTask")]
        public async Task<ActionResult<Guid>> CreateTaskCreator([FromBody] TasksCreatorRequest request)
        {
            var taskCreator = TaskCreator.Create(
                Guid.NewGuid(),
                request.Name,
                request.Description);

            if (!taskCreator.IsSuccess)
            {
                return BadRequest(taskCreator.Value);
            }

            var taskCreatorId = await _tasksCreatorService.CreateTaskCreator(taskCreator.Value);

            return Ok(taskCreatorId);
        }

        [HttpPut("{id:guid}")]
        public async Task<ActionResult<Guid>> UpdateTaskCreator(Guid id, [FromBody] TasksCreatorRequest request)
        {
            var taskCreatorId = await _tasksCreatorService.UpdateTaskCreator(id,
                request.Name,
                request.Description);

            return Ok(taskCreatorId);
        }

        [HttpDelete("{id:guid}")]
        public async Task<ActionResult<Guid>> DeleteTaskCreator(Guid id)
        {
            return Ok(await _tasksCreatorService.DeleteTaskCreator(id));
        }
    }
}
