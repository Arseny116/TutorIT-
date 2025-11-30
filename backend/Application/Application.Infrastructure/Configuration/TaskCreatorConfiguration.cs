using Application.Infrastructure.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Application.Infrastructure.Configuration
{
    public class TaskCreatorConfiguration : IEntityTypeConfiguration<TaskCreatorEntity>
    {
        public void Configure(EntityTypeBuilder<TaskCreatorEntity> builder)
        {
            builder.HasKey(x => x.Id);

            builder.Property(n => n.Name).IsRequired();

            builder.Property(d => d.Description).IsRequired();
        }
    }
}
