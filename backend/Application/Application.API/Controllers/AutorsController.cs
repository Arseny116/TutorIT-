using Application.API.DTO.Autors;
using Application.Domain.Interface;
using Application.Domain.Models;
using Microsoft.AspNetCore.Mvc;

namespace Application.API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class AutorsController : ControllerBase
    {
        public readonly IAutorsService _autorsService;

        public AutorsController(IAutorsService autorsService)
        {
            _autorsService = autorsService;
        }

        [HttpGet]
        public async Task<ActionResult<List<AutorsResponse>>> GetAutors()
        {
            var autors = await _autorsService.CetAutors();

            var response = autors.Select(a => new AutorsResponse(
                a.Id,
                a.Name,
                a.Description,
                a.CountCourses));

            return Ok(response);
        }

        [HttpPost]
        public async Task<ActionResult<Guid>> CreateAutors([FromBody] AutorsRequest request)
        {
            var autor = Autor.Create(
                Guid.NewGuid(),
                request.Name,
                request.Description);

            if (!autor.IsSuccess)
            {
                return BadRequest(autor.Error);
            }

            var autorId = await _autorsService.CreateAutor(autor.Value);

            return Ok(autorId);
        }

        [HttpPut("{id:guid}")]
        public async Task<ActionResult<Guid>> UpdateAutor(Guid id, [FromBody] AutorsRequest request)
        {
            var autorId = await _autorsService.UpdateAutor(id, request.Name, request.Description);

            return Ok(autorId);
        }

        [HttpDelete("{id:guid}")]
        public async Task<ActionResult<Guid>> DeleteAutor(Guid id)
        {
            return Ok(await _autorsService.DeleteAutor(id));
        }
    }
}
