using Application.API.DTO;
using Application.Domain.Interface;
using Microsoft.AspNetCore.Mvc;


namespace Application.API.Controllers
{
    [ApiController]
    [Route("Authentication/")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpPost("Register")]
        public async Task<IActionResult> Register([FromBody] RegisterUserRequest request)
        {
            await _userService.Register(request.UserName, request.Email, request.Password);
            return Ok();
        }

        [HttpPost("Login")]
        public async Task<IActionResult> Login([FromBody] LoginUserRequest request)
        {
            var token = await _userService.Login(request.Email, request.Password);

            Response.Cookies.Append("LikesCookies", token);

            return Ok(new { Token = token });
        }
    }
}