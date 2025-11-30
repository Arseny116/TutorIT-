using Application.Domain.Models;

namespace Application.Domain.Interface.ICourse
{
    public interface ICoursesService
    {
        Task<List<Course>> GetCourses();

        Task<Course> GetCoursesById(Guid id);

        Task<Guid> CreateCourse(Course course);

        Task<Guid> UpdateCourse(Guid id, string title, string description, int chapters, int complexity);

        Task<Guid> DeleteCourse(Guid courseId);
    }
}
