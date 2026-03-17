using Application.App.Services;
using Application.Domain.Interface;
using Application.Domain.Interface.ICourse;
using Application.Domain.Interface.ITaskQuestion.IQuestion;
using Application.Domain.Interface.ITaskQuestion.ITask;
using Application.Domain.Interface.ITheory;
using Application.Infrastructure;
using Application.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using FluentValidation;


namespace Application.API
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.Services.AddCors();
           

            builder.Services.AddValidatorsFromAssemblyContaining<Program>();


            builder.Services.AddControllers()
                .ConfigureApiBehaviorOptions(options =>
                {
                    options.SuppressModelStateInvalidFilter = true;
                });


         
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            builder.Services.AddDbContext<TutorITDbContext>();

        

            builder.Services.AddScoped<ICoursesRepository, CoursesRepository>();
            builder.Services.AddScoped<IChaptersRepository, ChaptersRepository>();
            builder.Services.AddScoped<ITheoriesRepository, TheoriesRepository>();
            builder.Services.AddScoped<ITasksCreatorRepository, TasksCreatorRepository>();
            builder.Services.AddScoped<IQuestionsRepository, QuestionsRepository>();


            builder.Services.AddScoped<ICoursesService, CoursesService>();
            builder.Services.AddScoped<IChaptersService, ChaptersService>();
            builder.Services.AddScoped<ITheoriesService, TheoriesService>();
            builder.Services.AddScoped<ITasksCreatorService, TasksCreatorService>();
            builder.Services.AddScoped<IQuestionsService, QuestionsService>();

          
            builder.Services.AddAuthorization();

            builder.Services.AddScoped<ImageService>();

            var app = builder.Build();


            using (var scope = app.Services.CreateScope())
            {
                var services = scope.ServiceProvider;
                var context = services.GetRequiredService<TutorITDbContext>();
                await context.Database.MigrateAsync();
            }

            app.UseCors(builder =>
            builder
            .AllowAnyOrigin()
            .WithExposedHeaders("*"));

            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseCookiePolicy();
            app.UseHttpsRedirection();
            app.UseAuthentication();
            app.UseAuthorization();
            app.MapControllers();

            app.Run();
        }
    }
}
