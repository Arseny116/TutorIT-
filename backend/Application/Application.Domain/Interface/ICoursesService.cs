using Application.Domain.Models;

namespace Application.Domain.Interface
{
    public interface ICoursesService
    {
        Task<List<Course>> CetCourses();

        Task<Guid> CreateCourse(Course course);

        Task<Guid> UpdateCourse(Guid id, string title, string description, int tasks);

        Task<Guid> DeleteCourse(Guid courseId);
    }
}
