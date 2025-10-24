using Application.Infrastructure.Entities;
using Microsoft.EntityFrameworkCore;

namespace Application.Infrastructure.DataBase
{
    public class AuthorDbContext : DbContext
    {
        public AuthorDbContext(DbContextOptions<AuthorDbContext> options) : base(options)
        {
        }

        public DbSet<AuthorEntity> Autors { get; set; }
    }
}
