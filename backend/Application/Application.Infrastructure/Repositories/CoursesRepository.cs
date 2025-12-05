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
                var result = Course.Create(entity.Id, entity.Pl, entity.Title, entity.Description, entity.Chapters, entity.Complexity);

                if (result.IsSuccess)
                {
                    courses.Add(result.Value);
                }
            }

            return courses;
        }

        public async Task<Course> GetById(Guid id)
        {
            var entity = await _context.Courses.
                AsNoTracking().
                SingleAsync(x => x.Id == id);


            var result = Course.Create(entity.Id, entity.Pl, entity.Title, entity.Description, entity.Chapters, entity.Complexity);

            return result.Value;

        }


        public async Task<Guid> Create(Course course)
        {
            var courseEntity = new CourseEntity
            {
                Id = course.Id,
                Pl = course.Pl,
                Title = course.Title,
                Description = course.Description,
                Evaluation = course.Evaluation,
                Reviews = course.Reviews,
                Subscribe = course.Subscribe,
                Chapters = course.Chapters,
                Complexity = course.Сomplexity
            };

            await _context.Courses.AddAsync(courseEntity);
            await _context.SaveChangesAsync();

            return courseEntity.Id;
        }

        public async Task<Guid> Update(Guid id, string pl, string title, string description, int chapters, int complexity)
        {
            await _context.Courses.Where(c => c.Id == id)
                .ExecuteUpdateAsync(s => s
                .SetProperty(p => p.Pl, p => pl)
                .SetProperty(t => t.Title, t => title)
                .SetProperty(d => d.Description, d => description)
                .SetProperty(t => t.Chapters, t => chapters)
                .SetProperty(c => c.Complexity, c => complexity));

            return id;
        }

        public async Task<Guid> Delete(Guid id)
        {
            await _context.Courses.Where(c => c.Id == id).ExecuteDeleteAsync();

            return id;
        }
    }
}
