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
        public async Task<ActionResult> Register([FromBody] RegisterUserRequest request)
        {
            var command = new RegisterUserCommand
            (
            request.Name,
            request.Email,
            request.Password
            );

            var Result = await _mediator.Send(command);

            if (Result.IsSuccess)
                return Ok(Result.Value);
            else
                return BadRequest(Result.Value);
        }

        [HttpPost("Login")]
        public async Task Login([FromBody] LoginUserRequest request)
        {
            var command = new LoginUserCommand
            (
            request.Email,
            request.Password
            );

            var Result = await _mediator.Send(command);

            Response.Cookies.Append("jwtE", Result);

        }


    }
}
