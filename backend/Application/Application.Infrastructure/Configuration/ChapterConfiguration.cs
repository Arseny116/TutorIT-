using Application.Infrastructure.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Application.Infrastructure.Configuration
{
    public class ChapterConfiguration : IEntityTypeConfiguration<ChapterEntity>
    {
        public void Configure(EntityTypeBuilder<ChapterEntity> builder)
        {
            builder.HasKey(x => x.Id);

            builder.Property(n => n.Name).IsRequired();

            builder.Property(d => d.Description).IsRequired();

            builder.Property(tb => tb.NumberTheoryBloks).IsRequired();

            builder.Property(t => t.NumberTasks).IsRequired();
        }
    }
}
