using Application.Domain.Models;

namespace Application.Domain.Interface
{
    public interface ICoursesRepository
    {
        Task<List<Course>> Get();

        Task<Guid> Create(Course course);

        Task<Guid> Update(Guid id, string title, string description, int tasks);

        Task<Guid> Delete(Guid id);
    }
}
