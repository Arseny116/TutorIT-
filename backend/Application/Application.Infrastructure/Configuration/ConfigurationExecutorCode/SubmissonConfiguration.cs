using Application.Infrastructure.Entities.EntityExecutorCode;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Application.Infrastructure.Configuration.ConfigurationExecutorCode
{
    public class SubmissonConfiguration : IEntityTypeConfiguration<CodeProblemEntity>
    {
        public void Configure(EntityTypeBuilder<CodeProblemEntity> builder)
        {
            builder.HasKey(k => k.Id);
        }
    }
}
