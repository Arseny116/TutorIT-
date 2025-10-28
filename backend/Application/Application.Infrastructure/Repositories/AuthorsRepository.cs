using Application.Domain.Interface.IAuthor;
using Application.Domain.Models;
using Application.Infrastructure.Entities;
using Microsoft.EntityFrameworkCore;

namespace Application.Infrastructure.Repositories
{
    public class AuthorsRepository : IAuthorsRepository
    {
        private readonly TutorITDbContext _context;

        public AuthorsRepository(TutorITDbContext context)
        {
            _context = context;
        }

        public async Task<List<Author>> Get()
        {
            var autorEntity = await _context.Autors.AsNoTracking().ToListAsync();

            var autors = new List<Author>();
            foreach (var entity in autorEntity)
            {
                var result = Author.Create(entity.Id, entity.Name, entity.Description);

                if (result.IsSuccess)
                {
                    autors.Add(result.Value);
                }
            }

            return autors;
        }

        public async Task<Guid> Create(Author autor)
        {
            var autorsEntity = new AuthorEntity
            {
                Id = autor.Id,
                Name = autor.Name,
                Description = autor.Description
            };

            await _context.Autors.AddAsync(autorsEntity);
            await _context.SaveChangesAsync();

            return autorsEntity.Id;
        }

        public async Task<Guid> Update(Guid id, string name, string description)
        {
            await _context.Autors.Where(a => a.Id == id)
                .ExecuteUpdateAsync(s => s
                .SetProperty(n => n.Name, n => name)
                .SetProperty(d => d.Description, d => description)
                );

            return id;
        }

        public async Task<Guid> Delete(Guid id)
        {
            await _context.Autors.Where(a => a.Id == id).ExecuteDeleteAsync();

            return id;
        }
    }
}
