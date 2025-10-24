using Application.Infrastructure.Entities.EntityExecutorCode;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class CodeProblemConfiguration : IEntityTypeConfiguration<CodeProblemEntity>
{
    public void Configure(EntityTypeBuilder<CodeProblemEntity> builder)
    {
        builder.HasKey(i => i.Id);
    }
}