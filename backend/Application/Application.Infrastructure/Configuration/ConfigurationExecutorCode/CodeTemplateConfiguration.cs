using Application.Infrastructure.Entities.EntityExecutorCode;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Application.Infrastructure.Configuration.ConfigurationExecutorCode
{
    public class CodeTemplateConfiguration : IEntityTypeConfiguration<CodeTemplateEntity>
    {
        public void Configure(EntityTypeBuilder<CodeTemplateEntity> builder)
        {
        }
    }
}
