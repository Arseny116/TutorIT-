using Application.API.DTO.Courses;
using Application.App.Services;
using Application.Domain.Interface.ICourse;
using Application.Domain.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

namespace Application.API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class CoursesController : ControllerBase
    {
        private readonly string _staticFilePath = Path.Combine("StaticFiles");

        private readonly ICoursesService _coursesService;
        private readonly ImageService _imageService;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<CoursesController> _logger;
        public CoursesController(ILogger<CoursesController> logger, IHttpClientFactory httpClientFactory, ICoursesService coursesService, ImageService imageService)
        {
            _logger = logger;
            _httpClientFactory = httpClientFactory;
            _coursesService = coursesService;
            _imageService = imageService;
        }


        /*  [Authorize]
          [HttpGet]
          public async Task<ActionResult<List<CoursesResponse>>> GetCoursesFilters([FromQuery] string title, [FromQuery] string pl, [FromQuery] int complexity)
          {
              var courses = await _coursesService.GetCourses();
              var response = courses.Where(
        c => c.Title.ToLower().Contains(title.ToLower())
        && c.Pl.ToLower() == pl.ToLower()
              && c.Сomplexity == complexity)
                  .Select(c => new CoursesResponse(
                  c.Id,
                  c.Pl,
                  c.Title,
                  c.Description,
                  c.Chapters,
                  c.Сomplexity,
                  c.Evaluation,
                  c.Reviews,
                  c.Subscribe,
                  c.NumberChapters));

              return Ok(response);
          }*/


        [Authorize]
        [HttpGet("GetAllCourses")]
        public async Task<ActionResult<List<CoursesResponse>>> GetCourses()
        {
            var userId = Guid.Parse(User.Claims.ToList()[0].Value);
            var courses = await _coursesService.GetCourses(userId);
            var response = courses.Select(c => new CoursesResponse(
                c.Id,
                c.Pl,
                c.Title,
                c.Description,
                c.Chapters,
                c.Сomplexity,
                c.TitleImage?.FileName,
                c.Evaluation,
                c.Reviews,
                c.Subscribe,
                c.NumberChapters
            ));

            return Ok(response);
        }



        [Authorize]
        [HttpGet("{id:guid}")]
        public async Task<ActionResult<List<CoursesResponse>>> GetCoursesById(Guid id)
        {
            var userId = Guid.Parse(User.Claims.ToList()[0].Value);
            var c = await _coursesService.GetCoursesById(id, userId);
            var response = new CoursesResponse(
                c.Id,
                c.Pl,
                c.Title,
                c.Description,
                c.Chapters,
                c.Сomplexity,
                c.TitleImage?.FileName,
                c.Evaluation,
                c.Reviews,
                c.Subscribe,
                c.NumberChapters
            );

            return Ok(response);
        }



        [Authorize]
        [HttpPost]
        public async Task<ActionResult<Guid>> CreateCourse([FromForm] CoursesRequest request)
        {
            var image = await _imageService.CreateImage(request.TitleImage, _staticFilePath, "Course");

            var userId = Guid.Parse(User.Claims.ToList()[0].Value);


            if (image.IsFailure)
            {
                return BadRequest(image.Error);
            }

            var course = Course.Create
                (

                userId,
                request.PL,
                request.Title,
                request.Description,
                request.Chapters,
                request.Complexity,
                image.Value);

            if (!course.IsSuccess)
            {
                return BadRequest(course.Error);
            }



            var courseId = await _coursesService.CreateCourse(course.Value);

            var client = _httpClientFactory.CreateClient("UserService");
            await client.PostAsync($"api/users/{userId}/created-courses/{courseId}", null);

            _logger.Log(LogLevel.Information, "Запрос ушел :");
            return Ok(courseId);
        }


        [Authorize]
        [HttpPut("{id:guid}")]
        public async Task<ActionResult<Guid>> UpdateCourse(Guid id, [FromBody] CoursesRequest request)
        {
            var courseId = await _coursesService.UpdateCourse(id, request.PL, request.Title, request.Description, request.Chapters, request.Complexity);

            return Ok(courseId);
        }

        [Authorize]
        [HttpDelete("{id:guid}")]
        public async Task<ActionResult<Guid>> DeleteCourse(Guid id)
        {
            var userId = Guid.Parse(User.Claims.ToList()[0].Value);

            return Ok(await _coursesService.DeleteCourse(id,userId));
        }
    }
}
