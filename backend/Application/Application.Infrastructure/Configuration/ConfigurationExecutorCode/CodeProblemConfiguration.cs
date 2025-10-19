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
            builder.HasKey(i => i.Id);

            builder.OwnsMany(t => t.Templates , owned=>
            {
                owned.WithOwner().HasForeignKey("CodeProblemEntityId");
                owned.Property(t => t.Language).IsRequired();
                owned.Property(t => t.TemplateCode).IsRequired();
            });

            builder.Ignore(t => t.Templates);
        }
    }
}
