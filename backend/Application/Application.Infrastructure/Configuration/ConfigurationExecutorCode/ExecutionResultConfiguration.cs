using Application.Infrastructure.Entities.EntityExecutorCode;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Application.Infrastructure.Configuration.ConfigurationExecutorCode
{
    public class ExecutionResultConfiguration : IEntityTypeConfiguration<ExecutionResultEntity>
    {
        public void Configure(EntityTypeBuilder<ExecutionResultEntity> builder)
        {
        }
    }
}
