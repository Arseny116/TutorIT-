using Application.API.DTO.Courses;
using Application.Domain.Interface.ICourse;
using Application.Domain.Models;
using Microsoft.AspNetCore.Mvc;

namespace Application.API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class CoursesController : ControllerBase
    {
        private readonly ICoursesService _coursesService;

        public CoursesController(ICoursesService coursesService)
        {
            _coursesService = coursesService;
        }

        //[HttpGet]
        //public async Task<ActionResult<List<CoursesResponse>>> GetCourses()
        //{
        //    var courses = await _coursesService.CetCourses();

        //    var response = courses.Select(c => new CoursesResponse(
        //        c.Id,
        //        c.Title,
        //        c.Description,
        //        c.Tasks,
        //        c.Evaluation,
        //        c.Reviews,
        //        c.Subscribe));

        //    return Ok(response);
        //}

        [HttpPost]
        public async Task<ActionResult<Guid>> CreateCourse([FromBody] CoursesRequest request)
        {
            var course = Course.Create(
                Guid.NewGuid(),
                request.Title,
                request.Description,
                request.Tasks);

            if (!course.IsSuccess)
            {
                return BadRequest(course.Error);
            }

            var courseId = await _coursesService.CreateCourse(course.Value);

            return Ok(courseId);
        }

        [HttpPut("{id:guid}")]
        public async Task<ActionResult<Guid>> UpdateCourse(Guid id, [FromBody] CoursesRequest request)
        {
            var courseId = await _coursesService.UpdateCourse(id, request.Title, request.Description, request.Tasks);

            return Ok(courseId);
        }

        [HttpDelete("{id:guid}")]
        public async Task<ActionResult<Guid>> DeleteCourse(Guid id)
        {
            return Ok(await _coursesService.DeleteCourse(id));
        }
    }
}
