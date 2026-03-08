
using ApplicationUsers.Infrastructure;

namespace ApplicationUsers.Domain.Interface
{
    public interface  IMailService
    {
        public Task<bool> SendHelloAsync(MailData mailData);
    }
}
