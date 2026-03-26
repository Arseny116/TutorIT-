namespace Application.Infrastructure
{
    public class JwtOptions
    {
        public string ValidIssuer { get; set; }

        public string SecretKey { get; set; }

        public int ExpitesHours { get; set; }
    }
}
