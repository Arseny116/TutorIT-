using Microsoft.EntityFrameworkCore;

namespace Application.Infrastructure.Entities.EntityExecutorCode
{

    [Owned]
    public class CodeTemplateEntity
    {
        public string Language { get; set; } = string.Empty;
        public string TemplateCode { get; set; } = string.Empty;
    }
}
