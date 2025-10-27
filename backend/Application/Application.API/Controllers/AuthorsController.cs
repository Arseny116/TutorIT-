using Application.API.DTO.Autors;
using Application.Domain.Interface;
using Application.Domain.Models;
using Microsoft.AspNetCore.Mvc;

namespace Application.API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class AuthorsController : ControllerBase
    {
        public readonly IAuthorsService _autorsService;

        public AuthorsController(IAuthorsService autorsService)
        {
            _autorsService = autorsService;
        }

        [HttpGet]
        public async Task<ActionResult<List<AuthorsResponse>>> GetAutors()
        {
            var autors = await _autorsService.GetAutors();

            var response = autors.Select(a => new AuthorsResponse(
                a.Id,
                a.Name,
                a.Description,
                a.CountCourses));

            return Ok(response);
        }

        [HttpPost]
        public async Task<ActionResult<Guid>> CreateAutors([FromBody] AuthorsRequest request)
        {
            var autor = Author.Create(
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
        public async Task<ActionResult<Guid>> UpdateAutor(Guid id, [FromBody] AuthorsRequest request)
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
