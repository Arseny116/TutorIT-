using Application.Domain.Models;

namespace Application.Domain.Interface.ICourse
{
    public interface ICoursesRepository
    {
        Task<List<Course>> Get(Guid userId);

        Task<Guid> Create(Course course);

        Task<Course> GetById(Guid id, Guid userId);

        Task<Guid> Update(Guid id, List<string> pl, string title, string description, int chapters, int complexity, Image titleImage);

        Task<Guid> Delete(Guid id, Guid user_id);
    }
}
