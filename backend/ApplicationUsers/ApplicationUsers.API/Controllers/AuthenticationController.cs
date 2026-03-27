using ApplicationUsers.API;
using ApplicationUsers.API.DTO;
using ApplicationUsers.App.Command;
using ApplicationUsers.App.Commands;
using CSharpFunctionalExtensions;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ApplicationUsers.Controllers
{
    [ApiController]
    [Route("api/v1/Authentication/")]
    public class AuthenticationController : ControllerBase
    {

        private readonly IMediator _mediator;

        private readonly ILogger _logger;
        public AuthenticationController(ILogger<AuthenticationController> logger, IMediator mediator)
        {
            _logger = logger;
            _mediator = mediator;
        }

        [HttpPost("Register")]
        public async Task<ActionResult<Guid>> Register([FromBody] RegisterUserRequest request)
        {
            var command = new RegisterUserCommand
            (
            request.name,
            request.email,
            request.password
            );

            var Result = await _mediator.Send(command);

            if (Result.IsSuccess)
                return Ok(Result.Value);
            else
                return BadRequest(Result.Error);
        }

        [HttpPost("Login")]
        public async Task<ActionResult> Login([FromBody] LoginUserRequest request)
        {
            var command = new LoginUserCommand
            (
            request.Email,
            request.Password
            );

            var Result = await _mediator.Send(command);

            if (Result.IsSuccess)
            {
                Response.Cookies.Append("jwtE", Result.Value, new CookieOptions
                {
                    Expires = DateTimeOffset.Now.AddDays(1)
                });
                return Ok();
            }
            else
                return BadRequest(Result.Error);
        }


    }
}
