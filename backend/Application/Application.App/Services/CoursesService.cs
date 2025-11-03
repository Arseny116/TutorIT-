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

        public async Task<List<Course>> CetCourses()
        {
            return await _coursesRepository.Get();
        }

        public async Task<Guid> CreateCourse(Course course)
        {
            return await _coursesRepository.Create(course);
        }

        public async Task<Guid> UpdateCourse(Guid id, string title, string description, int chapters)
        {
            return await _coursesRepository.Update(id, title, description, chapters);
        }

        public async Task<Guid> DeleteCourse(Guid id)
        {
            return await _coursesRepository.Delete(id);
        }
    }
}
