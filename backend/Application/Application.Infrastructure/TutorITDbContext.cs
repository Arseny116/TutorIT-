using Application.Infrastructure.Entities;
using Application.Infrastructure.Entities.EntityExecutorCode;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace Application.Infrastructure
{
    public class TutorITDbContext : DbContext
    {
        private readonly IConfiguration _configuration;

        public TutorITDbContext(IConfiguration configuration)
        {
            _configuration = configuration;
        }



        //Скрываем логику создания DB контекста
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder
                .UseNpgsql(_configuration.GetConnectionString("DefaultConnection"));
        }



        //public DbSet<{сущность}> {Имя сужности};
        public DbSet<CodeProblemEntity> CodeProblemEntity { get; set; }

        public DbSet<TestCasesEntity> TestCasesEntity { get; set; }

        public DbSet<ExecutionResultEntity> ExecutionResults { get; set; }

        public DbSet<CourseEntity> Courses { get; set; }

        public DbSet<AuthorEntity> Autors { get; set; }

        public DbSet<QuestionEntity> Questions { get; set; }

        public DbSet<TaskCreatorEntity> TasksCreator { get; set; }
    }
}
