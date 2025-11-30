using Application.API.DTO.TasksCreator;
using Application.Domain.Interface.ITaskQuestion.ITask;
using Application.Domain.Models;
using Microsoft.AspNetCore.Mvc;

namespace Application.API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class TasksCreatorsController : ControllerBase
    {
        private readonly ITasksCreatorService _tasksCreatorService;

        public TasksCreatorsController(ITasksCreatorService tasksCreatorService)
        {
            _tasksCreatorService = tasksCreatorService;
        }

        [HttpGet]
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

        [HttpPost]
        public async Task<ActionResult<Guid>> CreateTaskCreator(Guid ChapterId , [FromBody] TasksCreatorRequest request)
        {
            var taskCreator = TaskCreator.Create
            (
                request.Name,
                request.Description);

            if (!taskCreator.IsSuccess)
            {
                return BadRequest(taskCreator.Value);
            }

            var taskCreatorId = await _tasksCreatorService.CreateTaskCreator(ChapterId ,taskCreator.Value);

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
