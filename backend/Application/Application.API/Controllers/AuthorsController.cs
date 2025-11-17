using Application.API.DTO.Autors;
using Application.Domain.Interface.IAuthor;
using Application.Domain.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Application.API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    [Authorize]
    public class AuthorsController : ControllerBase
    {
        public readonly IAuthorsService _autorsService;

        public AuthorsController(IAuthorsService autorsService)
        {
            _autorsService = autorsService;
        }

        [HttpGet("GetAllAuthors")]
        public async Task<ActionResult<List<AuthorsResponse>>> GetAuthors()
        {
            var autors = await _autorsService.GetAuthors();

            var response = autors.Select(a => new AuthorsResponse(
                a.Id,
                a.Name,
                a.Description,
                a.CountCourses,
                a.Courses));

            return Ok(response);
        }

        [HttpPost("CreareAuthor")]
        public async Task<ActionResult<Guid>> CreateAutor([FromBody] AuthorsRequest request)
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
