using Application.Domain.Interface.ICourse;
using Application.Domain.Models;

namespace Application.App.Services
{
    public class CoursesService : ICoursesService
    {
        private readonly ICoursesRepository _coursesRepository;

        public CoursesService(ICoursesRepository coursesRepository)
        {
            _coursesRepository = coursesRepository;
        }

        public async Task<List<Course>> GetCourses(Guid userId)
        {
            return await _coursesRepository.Get(userId);
        }

        public async Task<Course> GetCoursesById(Guid id, Guid userId)
        {
            return await _coursesRepository.GetById(id, userId);
        }

        public async Task<Guid> CreateCourse(Course course)
        {
            return await _coursesRepository.Create(course);
        }

        public async Task<Guid> UpdateCourse(
            Guid id,
            List<string> pl,
            string title,
            string description,
            int chapters,
            int complexity,
            Image titleImage
            )
        {
            return await _coursesRepository.Update(id, pl, title, description, chapters, complexity, titleImage);
        }

        public async Task<Guid> DeleteCourse(Guid id, Guid user_id)
        {
            return await _coursesRepository.Delete(id, user_id);
        }
    }
}
