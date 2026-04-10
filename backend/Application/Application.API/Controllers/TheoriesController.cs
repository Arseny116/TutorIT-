using Application.API.DTO.Theories;
using Application.App.Services;
using Application.Domain.Interface.ITheory;
using Application.Domain.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Application.API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class TheoriesController : ControllerBase
    {
        private readonly string _staticFilePath = Path.Combine("StaticFiles");

        private readonly ITheoriesService _theoriesService;
        private readonly ImageService _imageService;


        public TheoriesController(ITheoriesService theoriesService, ImageService imageService)
        {
            _theoriesService = theoriesService;
            _imageService = imageService;
        }


        [Authorize]
        [HttpGet]
        public async Task<ActionResult<List<TheoriesResponse>>> GetTheories(Guid CharterId)
        {
            var theories = await _theoriesService.GetTheories(CharterId);
            var response = theories.Select(theory => new TheoriesResponse(
                theory.Id,
                theory.Name,
                theory.Article,
                theory.TitleImage?.FileName));

            return Ok(response);
        }



        [Authorize]
        [HttpPost]
        public async Task<ActionResult<Guid>> CreateTheory(Guid ChapterId, [FromForm] TheoriesRequest request)
        {
            Image? imageValue = null;

            if (request.TitleImage != null && request.TitleImage.Length > 0)
            {
                var imageResult = await _imageService.CreateImage(request.TitleImage, _staticFilePath, "Theory");

                if (imageResult.IsFailure)
                {
                    return BadRequest(imageResult.Error);
                }

                imageValue = imageResult.Value;
            }

            var theory = Theory.Create(
                Guid.NewGuid(),
                request.Name,
                request.Article,
                imageValue);

            if (!theory.IsSuccess)
            {
                return BadRequest(theory.Error);
            }

            var theoryId = await _theoriesService.CreateTheory(ChapterId, theory.Value);

            return Ok(theoryId);
        }



        [Authorize]
        [HttpPut("{id:guid}")]
        public async Task<ActionResult<Guid>> UpdateTheory(Guid id, [FromBody] TheoriesRequest request)
        {
            var theoryId = await _theoriesService.UpdateTheory(
                id,
                request.Name,
                request.Article);

            return Ok(theoryId);
        }



        [Authorize]
        [HttpDelete("{id:guid}")]
        public async Task<ActionResult<Guid>> DeleteTheory(Guid id)
        {
            return Ok(await _theoriesService.DeleteTheory(id));
        }
    }
}
