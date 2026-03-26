using ApplicationUsers.App.Commands;
using ApplicationUsers.App.Queries;
using ApplicationUsers.Domain;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ApplicationUsers.API.Controllers
{
    [ApiController]
    [Route("api/user/")]
    public class UsersController(ILogger<UsersController> _logger, IMediator _mediator) : ControllerBase
    {
        [Authorize]
        [HttpGet]
        public async Task<User> GetCurrentUser()
        {
            var userId = User.Claims.ToList()[0].Value;

            _logger.Log(LogLevel.Information, $"Получен пользователь : {userId} ");

            var query = new GetUserById(Guid.Parse(userId));
            return await _mediator.Send(query);
        }

        [Authorize]
        [HttpGet("search")]
        public async Task<User> GetUser(string email)
        {

            _logger.Log(LogLevel.Information, $"Получен пользователь с почтой  : {email} ");
            var query = new GetUserByEmail(email);
            return await _mediator.Send(query);

        }

        [Authorize]
        [HttpPost("{userId}/created-courses/{courseId}")]
        public async Task UpdateMyCourse(Guid userId, Guid courseId)
        {
            _logger.LogInformation("UpdateMyCourse called with userId: {UserId}, courseId: {CourseId}",
        userId, courseId);
    
            await _mediator.Send(new UpdateUserMyCourseCommand(userId, courseId));
        }


        [Authorize]
        [HttpPost("{userId}/subscribe/{courseId}")]
        public async Task UpdateSub(Guid user, Guid courseId)
        {
            await _mediator.Send(new UpdateUserForeginCourseCommand(user, courseId));
        }
    }
}
