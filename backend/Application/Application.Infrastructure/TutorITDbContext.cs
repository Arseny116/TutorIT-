﻿using System.Collections.Concurrent;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

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
    }
}
