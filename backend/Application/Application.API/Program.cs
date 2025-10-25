using Application.App.Services;
using Application.Domain;
using Application.Domain.Interface;
using Application.Infrastructure.DataBase;
using Application.Infrastructure.Repositories;
using Application.Infrastructure.Repositories.ExecutorCode;
namespace Application.API
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);


            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            //DbContext
            builder.Services.AddDbContext<ExecutorCodeDbContext>();
            builder.Services.AddDbContext<CourseDbContext>();
            builder.Services.AddDbContext<AuthorDbContext>();


            //Регистрация сервисов и репозиториев 

                //ExecutorCode
                builder.Services.AddScoped<ICodeProblemRep, CodeProblemRep>();
                builder.Services.AddScoped<ICodeProblemService, ServiceCodeProblem>();
                builder.Services.AddScoped<IAuthorsRepository, AuthorsRepository>();

                //Course
                builder.Services.AddScoped<IAuthorsService, AuthorService>();
                builder.Services.AddScoped<ICoursesService, CoursesService>();
                builder.Services.AddScoped<ICoursesRepository, CoursesRepository>();



            var app = builder.Build();

            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            app.MapControllers();

            app.Run();
        }
    }
}
