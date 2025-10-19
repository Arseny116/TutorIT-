using Application.Infrastructure.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Application.Infrastructure.Configuration
{
    public class AutorConfiguration : IEntityTypeConfiguration<AutorEntity>
    {
        public void Configure(EntityTypeBuilder<AutorEntity> builder)
        {
            builder.HasKey(x => x.Id);

            builder.Property(n => n.Name).IsRequired();

            builder.Property(d => d.Description).IsRequired();
        }
    }
}
