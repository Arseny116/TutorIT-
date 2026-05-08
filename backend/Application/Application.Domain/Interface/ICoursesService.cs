using Application.Domain.Models;

namespace Application.Domain.Interface.ICourse
{
    public interface ICoursesService
    {
        Task<List<Course>> GetCourses(Guid userId);

        Task<Course> GetCoursesById(Guid id, Guid userId);

        Task<Guid> CreateCourse(Course course);

        Task<Guid> UpdateCourse(Guid id, List<string> pl, string title, string description, int chapters, int complexity, Image titleImage);

        Task<Guid> DeleteCourse(Guid courseId, Guid user_id);

        //Task UpdateCourse(Guid id, List<string> pL, string title, string description, int chapters, int complexity, Image titleImage);
    }
}
