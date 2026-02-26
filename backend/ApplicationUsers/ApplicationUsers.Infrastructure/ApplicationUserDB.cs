using ApplicationUsers.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;

namespace ApplicationUsers.Infrastructure
{
    public class ApplicationUserDB : DbContext
    {
        protected readonly IConfiguration _configuration;
        public ApplicationUserDB(IConfiguration configuration) 
        {
            _configuration = configuration;
        }


        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            base.OnConfiguring(optionsBuilder.UseNpgsql(_configuration.GetConnectionString("DefaultConnection")));
        }

        public DbSet<UserEntity> Users { get; set; }
    }
}
