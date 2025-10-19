using Application.App.Services;
using Application.Domain;
using Application.Infrastructure;
using Application.Infrastructure.Repositories;
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
            builder.Services.AddScoped<ICodeProblemRep, CodeProblemRep>();
            builder.Services.AddScoped<IServiceCodeProblem, ServiceCodeProblem>();
            builder.Services.AddDbContext<TutorITDbContext>();
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
