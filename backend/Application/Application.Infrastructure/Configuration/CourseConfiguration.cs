using Application.Infrastructure.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Application.Infrastructure.Configuration
{
    public class CourseConfiguration : IEntityTypeConfiguration<CourseEntity>
    {
        public void Configure(EntityTypeBuilder<CourseEntity> builder)
        {
            builder.HasKey(x => x.Id);

            builder.Property(pl => pl.PL).IsRequired();

            builder.Property(t => t.Title).IsRequired();

            builder.Property(d => d.Description).IsRequired();

            builder.Property(t => t.Chapters).IsRequired();

            builder.Property(c => c.Complexity).IsRequired();
        }
    }
}
