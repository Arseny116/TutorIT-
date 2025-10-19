using Application.Infrastructure.Entities;
using Microsoft.EntityFrameworkCore;

namespace Application.Infrastructure.DataBase
{
    public class AutorDbContext : DbContext
    {
        public AutorDbContext(DbContextOptions<AutorDbContext> options) : base(options)
        {
        }

        public DbSet<AutorEntity> Autors { get; set; }
    }
}
