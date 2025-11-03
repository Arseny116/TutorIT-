using Application.Infrastructure.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Application.Infrastructure.Configuration
{
    public class TheoryConfiguration : IEntityTypeConfiguration<TheoryEntity>
    {
        public void Configure(EntityTypeBuilder<TheoryEntity> builder)
        {
            builder.HasKey(x => x.Id);

            builder.Property(n => n.Name).IsRequired();

            builder.Property(a => a.Article).IsRequired();
        }
    }
}
