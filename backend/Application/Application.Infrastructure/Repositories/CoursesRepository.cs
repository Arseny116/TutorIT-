using Application.Domain.Interface.ICourse;
using Application.Domain.Models;
using Application.Infrastructure.Entities;
using Microsoft.EntityFrameworkCore;

namespace Application.Infrastructure.Repositories
{
    public class CoursesRepository : ICoursesRepository
    {
        private readonly TutorITDbContext _context;

        public CoursesRepository(TutorITDbContext context)
        {
            _context = context;
        }

        public async Task<List<Course>> Get()
        {
            var courseEntity = await _context.Courses.AsNoTracking().ToListAsync();

            var courses = new List<Course>();
            foreach (var entity in courseEntity)
            {
                var result = Course.Create(entity.Id, entity.Title, entity.Description, entity.Tasks);

                if (result.IsSuccess)
                {
                    courses.Add(result.Value);
                }
            }

            return courses;
        }

        public async Task<Guid> Create(Course course)
        {
            var courseEntity = new CourseEntity
            {
                Id = course.Id,
                Title = course.Title,
                Description = course.Description,
                Evaluation = course.Evaluation,
                Reviews = course.Reviews,
                Subscribe = course.Subscribe,
                Tasks = course.Tasks
            };

            await _context.Courses.AddAsync(courseEntity);
            await _context.SaveChangesAsync();

            return courseEntity.Id;
        }

        public async Task<Guid> Update(Guid id, string title, string description, int tasks)
        {
            await _context.Courses.Where(c => c.Id == id)
                .ExecuteUpdateAsync(s => s
                .SetProperty(t => t.Title, t => title)
                .SetProperty(d => d.Description, d => description)
                .SetProperty(t => t.Tasks, t => tasks));

            return id;
        }

        public async Task<Guid> Delete(Guid id)
        {
            await _context.Courses.Where(c => c.Id == id).ExecuteDeleteAsync();

            return id;
        }
    }
}
