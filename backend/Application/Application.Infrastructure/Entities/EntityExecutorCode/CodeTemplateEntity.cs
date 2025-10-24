public class CodeTemplateEntity
{
    public Guid Id { get; set; }
    public string Language { get; set; }
    public string TemplateCode { get; set; }

    public CodeTemplateEntity(string language, string templateCode)
    {
        Id = Guid.NewGuid();
        Language = language;
        TemplateCode = templateCode;
    }

    public CodeTemplateEntity() { }
}