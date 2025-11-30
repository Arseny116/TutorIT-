using Application.Domain.Interface;
using Application.Domain.Models;
using Application.Infrastructure.Entities;
using Microsoft.EntityFrameworkCore;

namespace Application.Infrastructure.Repositories
{
    public class ChaptersRepository : IChaptersRepository
    {
        private readonly TutorITDbContext _context;

        public ChaptersRepository(TutorITDbContext context)
        {
            _context = context;
        }

        public async Task<List<Chapter>> Get(Guid CourseId)
        {
            var chaptersEntity = await _context.Chapters.Where(x=> x.CourseID ==CourseId).AsNoTracking().ToListAsync();

            var chapters = new List<Chapter>();
            foreach (var entity in chaptersEntity)
            {
                var result = Chapter.Create(entity.Id ,entity.Name, entity.Description, entity.NumberTheoryBloks, entity.NumberTasks);

                if (result.IsSuccess)
                {
                    chapters.Add(result.Value);
                }
            }

            return chapters;
        }

        public async Task<Guid> Create(Guid Coursesid, Chapter chapter)
        {
            var chapterEntity = new ChapterEntity
            {
                Name = chapter.Name,
                Description = chapter.Description,
                NumberTheoryBloks = chapter.NumberTheoryBloks,
                NumberTasks = chapter.NumberTasks,
                CourseID=Coursesid 
            };

            await _context.Chapters.AddAsync(chapterEntity);
            await _context.SaveChangesAsync();

            return chapterEntity.Id;
        }

        public async Task<Guid> Update(Guid id, string name, string description, int numberTheoryBloks, int numberTasks)
        {
            await _context.Chapters.Where(x => x.Id == id)
                .ExecuteUpdateAsync(s => s
                .SetProperty(n => n.Name, name)
                .SetProperty(d => d.Description, description)
                .SetProperty(tb => tb.NumberTheoryBloks, numberTheoryBloks)
                .SetProperty(t => t.NumberTasks, numberTasks));

            return id;
        }

        public async Task<Guid> Delete(Guid id)
        {
            await _context.Chapters.Where(x => x.Id == id).ExecuteDeleteAsync();

            return id;
        }
    }
}
