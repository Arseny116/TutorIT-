using Application.API.DTO.Chapters;
using Application.Domain.Interface;
using Application.Domain.Models;
using Microsoft.AspNetCore.Mvc;

namespace Application.API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class ChaptersController : ControllerBase
    {
        private readonly IChaptersService _chaptersService;

        public ChaptersController(IChaptersService chaptersService)
        {
            _chaptersService = chaptersService;
        }

        [HttpGet]
        public async Task<ActionResult<List<ChaptersResponse>>> GetChapters()
        {
            var chapters = await _chaptersService.GetChapters();
            var response = chapters.Select(chapter => new ChaptersResponse(
                chapter.Id,
                chapter.Name,
                chapter.Description,
                chapter.NumberTheoryBloks,
                chapter.NumberTasks,
                chapter.Theories,
                chapter.Tasks));

            return Ok(response);
        }

        [HttpPost("{CourseId:guid}")]
        public async Task<ActionResult<Guid>> CreateChapter(Guid CourseId,[FromBody] ChaptersRequest request)
        {
            var chapterDomain = Chapter.Create(
                request.Name,
                request.Description,
                request.NumberTheoryBloks,
                request.NumberTasks);

            await _chaptersService.CreateChapter(CourseId, chapterDomain.Value);

            return Ok(CourseId);//Заменить на DTO 
        }

        [HttpPut("{id:guid}")]
        public async Task<ActionResult<Guid>> UpdateChapter(Guid id, [FromBody] ChaptersRequest request)
        {
            var chapterId = await _chaptersService.UpdateChapter(
                id,
                request.Name,
                request.Description,
                request.NumberTheoryBloks,
                request.NumberTasks);

            return Ok(chapterId);
        }

        [HttpDelete("{id:guid}")]
        public async Task<ActionResult<Guid>> DeleteChapter(Guid id)
        {
            return Ok(await _chaptersService.DeleteChapter(id));
        }
    }
}
