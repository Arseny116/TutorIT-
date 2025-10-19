using Application.App.Services;
using Microsoft.AspNetCore.Mvc;

namespace Application.API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class CodeProblemController : ControllerBase
    {
        private readonly IServiceCodeProblem _serviceProvider;

        public CodeProblemController(IServiceCodeProblem serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }



        [HttpPost("Execute")]
        public async Task<IResult> Execute(Guid id, string Code)
        {
            var x = await _serviceProvider.Execute(id, Code);
            Console.WriteLine(x.Count);
            return Results.Ok(x);
        }


        [HttpPost("AddCodeProblem")]
        public async Task<IResult> Create(string title, string description, string difficulty)
        {
            var x = await _serviceProvider.CreateCodeProblem(title, description, difficulty);
            return Results.Ok(x);

        }
    }
}
