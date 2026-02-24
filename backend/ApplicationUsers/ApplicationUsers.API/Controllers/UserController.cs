using ApplicationUsers.App.Command;
using CSharpFunctionalExtensions;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ApplicationUsers.Controllers
{
    [ApiController]
    [Route("Authentication/")]
    public class UserController : ControllerBase
    {

        private readonly IMediator _mediator;

        public UserController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("Register")]
        public async Task<ActionResult> Register([FromBody] RegisterUserRequest request)
        {
            var command = new RegisterUserCommand
            (
            request.Name,
            request.Email,
            request.Password
            );

            var Result  = await _mediator.Send(command);
            if (Result.IsSuccess)
                return Ok(Result.Value);
            else
                return BadRequest(Result.Value);
        }
    }
}
