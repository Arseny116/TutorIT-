using Application.Infrastructure.Entities.EntityExecutorCode;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Application.Infrastructure.Configuration.ConfigurationExecutorCode
{

    //IEntityConfiguration - интерфейс для реализации конфигурации в EF Core
    public class CodeProblemConfiguration : IEntityTypeConfiguration<CodeProblemEntity>
    {
        public void Configure(EntityTypeBuilder<CodeProblemEntity> builder)
        {
        }
    }
}
