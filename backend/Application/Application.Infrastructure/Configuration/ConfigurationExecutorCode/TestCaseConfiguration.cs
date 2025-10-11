using Application.Infrastructure.Entities.EntityExecutorCode;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Application.Infrastructure.Configuration.ConfigurationExecutorCode
{
    public class TestCaseConfiguration : IEntityTypeConfiguration<TestCasesEntity>
    {
        public void Configure(EntityTypeBuilder<TestCasesEntity> builder)
        {
        }
    }
}
