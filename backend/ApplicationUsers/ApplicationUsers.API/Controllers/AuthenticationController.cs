using ApplicationUsers.API;
using ApplicationUsers.API.DTO;
using ApplicationUsers.App.Command;
using ApplicationUsers.App.Commands;
using ApplicationUsers.Infrastructure.Authentication;
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
        private readonly IConfiguration _configuration;
        private readonly ILogger _logger;
        public AuthenticationController(IConfiguration configuration, ILogger<AuthenticationController> logger, IMediator mediator)
        {
            _configuration = configuration;
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
            var command = new LoginUserCommand(request.Email, request.Password);
            var Result = await _mediator.Send(command);

            if (Result.IsSuccess)
            {
                // Получаем настройки JWT
                var jwtOptions = _configuration.GetSection("Jwt").Get<JwtOptions>();
                var tokenLifetimeHours = jwtOptions?.ExpitesHours ?? 12;

                // Устанавливаем куку с правильным временем жизни
                Response.Cookies.Append("jwtE", Result.Value, new CookieOptions
                {
                    HttpOnly = false,           // Важно для безопасности
                    Secure = false,            // В разработке false, в production true
                    SameSite = SameSiteMode.Lax,
                    Expires = DateTimeOffset.UtcNow.AddHours(tokenLifetimeHours), // Используем UtcNow и синхронизируем с токеном
                    Path = "/",
                    IsEssential = true
                });

                // Возвращаем информацию для отладки
                return Ok(new
                {
                    message = "Login successful",
                    tokenExpiresIn = $"{tokenLifetimeHours} hours",
                    serverTime = DateTime.UtcNow
                });
            }
            else
                return BadRequest(Result.Error);
        }


    }
}
