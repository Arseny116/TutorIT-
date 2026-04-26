using System;
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
        public async Task<ActionResult<CoursesResponse>> GetCoursesById(Guid id)
        {
            try
            {
                // Получаем токен из куки (как в CreateCourse)
                var token = Request.Cookies["jwtE"];

                if (string.IsNullOrEmpty(token))
                {
                    _logger.LogWarning("JWT token not found in cookies");
                    return Unauthorized("Authentication token is missing");
                }

                // Получаем userId из claim
                var userIdClaim = User.Claims.FirstOrDefault()?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                {
                    _logger.LogWarning("User ID claim not found");
                    return Unauthorized("User ID not found in token");
                }

                var userId = Guid.Parse(userIdClaim);

                // Получаем курс из сервиса курсов
                var c = await _coursesService.GetCoursesById(id, userId);

                if (c == null)
                {
                    return NotFound($"Course with id {id} not found");
                }

                // Отправляем запрос на подписку к UserService с токеном из куки
                var client = _httpClientFactory.CreateClient("UserService");
                var url = $"http://serverusers:8081/api/user/{userId}/subscribe/{id}";

                _logger.LogInformation("Sending subscription request to UserService: {Url}", url);

                // Создаем запрос с заголовком авторизации (как в CreateCourse)
                using var httpRequest = new HttpRequestMessage(HttpMethod.Post, url);
                httpRequest.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

                // Отправляем запрос
                var response = await client.SendAsync(httpRequest);

                _logger.LogInformation("UserService subscription response status: {StatusCode}", response.StatusCode);

                if (!response.IsSuccessStatusCode)
                {
                    var responseContent = await response.Content.ReadAsStringAsync();
                    _logger.LogWarning("UserService subscription error: {StatusCode} - {Content}", response.StatusCode, responseContent);
                    // Не возвращаем ошибку, так как курс уже получен, просто логируем
                }

                // Формируем ответ
                var coursesResponse = new CoursesResponse(
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

                return Ok(coursesResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting course by id: {CourseId}", id);
                return StatusCode(500, "Internal server error");
            }
        }



        [Authorize]
        [HttpPost]
        public async Task<ActionResult<Guid>> CreateCourse([FromForm] CoursesRequest request)
        {
            try
            {
                // Получаем токен из куки
                var token = Request.Cookies["jwtE"];

                if (string.IsNullOrEmpty(token))
                {
                    _logger.LogWarning("JWT token not found in cookies");
                    return Unauthorized("Authentication token is missing");
                }

                //var image = await _imageService.CreateImage(request.TitleImage, _staticFilePath, "Course");

                // Получаем userId из claims
                var userIdClaim = User.Claims.FirstOrDefault()?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                {
                    _logger.LogWarning("User ID claim not found");
                    return Unauthorized("User ID not found in token");
                }

                var userId = Guid.Parse(userIdClaim);

                Image? imageValue = null;

                if (request.TitleImage != null && request.TitleImage.Length > 0)
                {
                    var imageResult = await _imageService.CreateImage(request.TitleImage, _staticFilePath, "Course");

                    if (imageResult.IsFailure)
                    {
                        return BadRequest(imageResult.Error);
                    }

                    imageValue = imageResult.Value;
                }

                var course = Course.Create(
                    userId,
                    request.PL,
                    request.Title,
                    request.Description,
                    request.Chapters,
                    request.Complexity,
                    imageValue);

                if (!course.IsSuccess)
                {
                    return BadRequest(course.Error);
                }

                var courseId = await _coursesService.CreateCourse(course.Value);

                // Отправляем запрос к UserService с токеном авторизации
                var client = _httpClientFactory.CreateClient("UserService");
                var url = $"http://serverusers:8081/api/user/{userId}/created-courses/{courseId}";

                _logger.LogInformation("Sending request to UserService: {Url}", url);

                // Создаем запрос с заголовком авторизации
                using var httpRequest = new HttpRequestMessage(HttpMethod.Post, url);
                httpRequest.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

                // Отправляем запрос
                var response = await client.SendAsync(httpRequest);

                _logger.LogInformation("UserService responded with status: {StatusCode}", response.StatusCode);

                if (!response.IsSuccessStatusCode)
                {
                    var responseContent = await response.Content.ReadAsStringAsync();
                    _logger.LogWarning("UserService error: {StatusCode} - {Content}", response.StatusCode, responseContent);

                    // Не возвращаем ошибку, так как курс уже создан, просто логируем
                    // Можно вернуть предупреждение, но курс создан успешно
                }

                return Ok(courseId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating course");
                return StatusCode(500, "Internal server error");
            }
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
