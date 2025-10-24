using Application.App.Services;
using Application.Domain.Models.RootCodeProblem;
using Microsoft.AspNetCore.Http.HttpResults;
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



        [HttpDelete("DeleteCodeProblem")]
        public async Task<IResult> Delete(Guid id)
        {
            var x = await _serviceProvider.Delete(id);
            return Results.Ok(x);
        }



        [HttpGet("GetAllCodeProblem")]
        public async Task<IResult> GetAll()
        {
            var x = await _serviceProvider.GetAll();
            return Results.Ok(x);
        }


        [HttpPost("AddTestCase")]
        public async Task AddTestCase(Guid id, string input, string output)
        {
            await _serviceProvider.AddTestCase(id, input, output);
        }

        [HttpGet("GetAllTestById")]
        public async Task<IResult> GetAllTestCase(Guid id)
        {
            var x = await _serviceProvider.GetAllTestCase(id);
            return Results.Ok(x);
        }



    }
}
