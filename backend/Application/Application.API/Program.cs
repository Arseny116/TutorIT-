using System.Text;
using Application.App;
using Application.App.Services;
using Application.App.Services.TaskQuestionService;
using Application.Domain.Interface;

using Application.Domain.Interface.IChapter;
using Application.Domain.Interface.ICodeExecutor;
using Application.Domain.Interface.ICourse;
using Application.Domain.Interface.ITaskQuestion.IQuestion;
using Application.Domain.Interface.ITaskQuestion.ITask;
using Application.Domain.Interface.ITheory;
using Application.Infrastructure;
using Application.Infrastructure.Repositories;
using Application.Infrastructure.Repositories.RepositoriesExecutorCode;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace Application.API
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.Services.AddCors();
            builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection(nameof(JwtOptions)));

            builder.Services.AddControllers();

            builder.Services.AddAutoMapper(x
                => x.AddProfile(typeof(UserProfile))
            );

            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            builder.Services.AddDbContext<TutorITDbContext>();
            builder.Services.AddScoped<IUserRepository, UserRepository>();
            builder.Services.AddScoped<IUserService, UserService>();
            builder.Services.AddScoped<IJwtProvider, JwtProvider>();
            builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
            builder.Services.AddScoped<ICodeProblemRep, CodeProblemRep>();

            builder.Services.AddDbContext<TutorITDbContext>();

            builder.Services.AddScoped<ICoursesRepository, CoursesRepository>();
            builder.Services.AddScoped<IChaptersRepository, ChaptersRepository>();
            builder.Services.AddScoped<ITheoriesRepository, TheoriesRepository>();
            builder.Services.AddScoped<ITasksCreatorRepository, TasksCreatorRepository>();
            builder.Services.AddScoped<IQuestionsRepository, QuestionsRepository>();

            builder.Services.AddScoped<IServiceCodeProblem, ServiceCodeProblem>();
       
            builder.Services.AddScoped<ICoursesService, CoursesService>();
            builder.Services.AddScoped<IChaptersService, ChaptersService>();
            builder.Services.AddScoped<ITheoriesService, TheoriesService>();
            builder.Services.AddScoped<ITasksCreatorService, TasksCreatorService>();
            builder.Services.AddScoped<IQuestionsService, QuestionsService>();

            var jwtOptions = builder.Configuration.GetSection(nameof(JwtOptions)).Get<JwtOptions>();

            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = false,
                        ValidateAudience = false,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.SecretKey))
                    };

                    options.Events = new JwtBearerEvents
                    {
                        OnMessageReceived = context =>
                        {
                            context.Token = context.Request.Cookies["LikesCookies"];
                            return Task.CompletedTask;
                        }
                    };
                });
            builder.Services.AddAuthorization();

            var app = builder.Build();

           
            using (var scope = app.Services.CreateScope())
            {
                var services = scope.ServiceProvider;
                var logger = services.GetRequiredService<ILogger<Program>>();
                
                try
                {
                    var context = services.GetRequiredService<TutorITDbContext>();
                    logger.LogInformation("Applying database migrations...");
                 
                    await Task.Delay(10000);
                    
                   
                    await context.Database.MigrateAsync();
                    logger.LogInformation("Migrations applied successfully!");
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "An error occurred while applying migrations");
                
                }
            }

            app.UseCors(builder => builder.AllowAnyOrigin());

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