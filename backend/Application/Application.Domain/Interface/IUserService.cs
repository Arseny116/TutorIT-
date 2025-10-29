namespace Application.Domain.Interface
{
    public interface IUserService
    {
        Task<string> Login(string email, string password);
        Task Register(string userName, string email, string password);
    }
}