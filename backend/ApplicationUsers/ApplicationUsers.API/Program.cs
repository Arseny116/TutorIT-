using System.Text;
using ApplicationUsers.App.Handlers;
using ApplicationUsers.Domain.Interface;
using ApplicationUsers.Infrastructure;
using ApplicationUsers.Infrastructure.Authentication;
using ApplicationUsers.Infrastructure.Mapping;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;


namespace ApplicationUsers
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.Services.AddControllers();

            builder.Services.AddSwaggerGen();

            builder.Services.AddMediatR(cfg =>
            {
                cfg.RegisterServicesFromAssembly(typeof(RegisterUserHandler).Assembly);
            });

            builder.Services.Configure<MailSettings>(builder.Configuration.GetSection(nameof(MailSettings)));


            builder.Services.AddDbContext<ApplicationUserDB>();


            builder.Services.AddAutoMapper(typeof(MapperProfile).Assembly);

            builder.Services.AddScoped<IMailService,  MailService>();
            builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
            builder.Services.AddScoped<IJwtProvider, JwtProvider>();
            builder.Services.AddScoped<IUserRepository, UserRepository>();

            builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection(nameof(JwtOptions)));

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

            using (var scope= app.Services.CreateScope())
            {
                var context  = scope.ServiceProvider.GetRequiredService<ApplicationUserDB>();
                await context.Database.MigrateAsync();
            }


            app.UseSwagger();
            app.UseSwaggerUI();
            app.MapOpenApi();

            app.UseAuthentication();

            app.UseAuthorization();


            app.MapControllers();

            app.Run();
        }
    }
}
