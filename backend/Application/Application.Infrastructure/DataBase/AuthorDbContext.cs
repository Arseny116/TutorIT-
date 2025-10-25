using Application.Infrastructure.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace Application.Infrastructure.DataBase
{
    public class AuthorDbContext : DbContext
    {
        private readonly IConfiguration _configuration;

        public AuthorDbContext(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder
               .UseNpgsql(_configuration.GetConnectionString("DefaultConnection"));
        }

        public DbSet<AuthorEntity> Autors { get; set; }
    }
}
