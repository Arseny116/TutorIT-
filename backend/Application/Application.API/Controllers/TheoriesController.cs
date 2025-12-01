using Application.API.DTO.Theories;
using Application.Domain.Interface.ITheory;
using Application.Domain.Models;
using Microsoft.AspNetCore.Mvc;

namespace Application.API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class TheoriesController : ControllerBase
    {
        private readonly ITheoriesService _theoriesService;

        public TheoriesController(ITheoriesService theoriesService)
        {
            _theoriesService = theoriesService;
        }

        [HttpGet("{ChapterId:guid}")]
        public async Task<ActionResult<List<TheoriesResponse>>> GetTheories(Guid ChapterId)
        {
            var theories = await _theoriesService.GetTheories(ChapterId);
            var response = theories.Select(theory => new TheoriesResponse(
                theory.Id,
                theory.Name,
                theory.Article));

            return Ok(response);
        }

        [HttpPost]
        public async Task<ActionResult<Guid>> CreateTheory(Guid ChapterId,[FromBody] TheoriesRequest request)
        {
            var theory = Theory.Create(
                Guid.NewGuid(),
                request.Name,
                request.Article);

            if (!theory.IsSuccess)
            {
                return BadRequest(theory.Error);
            }

            var theoryId = await _theoriesService.CreateTheory(ChapterId,theory.Value);

            return Ok(theoryId);
        }

        [HttpPut("{id:guid}")]
        public async Task<ActionResult<Guid>> UpdateTheory(Guid id, [FromBody] TheoriesRequest request)
        {
            var theoryId = await _theoriesService.UpdateTheory(
                id,
                request.Name,
                request.Article);

            return Ok(theoryId);
        }

        [HttpDelete("{id:guid}")]
        public async Task<ActionResult<Guid>> DeleteTheory(Guid id)
        {
            return Ok(await _theoriesService.DeleteTheory(id));
        }
    }
}
