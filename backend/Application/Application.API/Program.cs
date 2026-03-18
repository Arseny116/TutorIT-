using System.Text;
using Application.App.Services;
using Application.Domain.Interface;
using Application.Domain.Interface.ICourse;
using Application.Domain.Interface.ITaskQuestion.IQuestion;
using Application.Domain.Interface.ITaskQuestion.ITask;
using Application.Domain.Interface.ITheory;
using Application.Infrastructure;
using Application.Infrastructure.Repositories;
using FluentValidation;
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


            builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection(nameof(JwtOptions)));
            var jwtOptions = builder.Configuration.GetSection(nameof(JwtOptions)).Get<JwtOptions>();



            builder.Services.AddHttpClient("UserService", client =>
            {
                client.BaseAddress = new Uri("http://serverusers:8081/");
            });

            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
      .AddJwtBearer(options =>
      {
          options.TokenValidationParameters = new TokenValidationParameters
          {
              ValidateIssuer = false,
              // ValidIssuer = jwtOptions.ValidIssuer,
              ValidateAudience = false,

              ValidateLifetime = true,
              IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.SecretKey)),
              ValidateIssuerSigningKey = true,
          };


          options.Events = new JwtBearerEvents
          {
              OnMessageReceived = context =>
              {
                  context.Token = context.Request.Cookies["jwtE"];
                  return Task.CompletedTask;
              }
          };
      });
            builder.Services.AddAuthorization();


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
