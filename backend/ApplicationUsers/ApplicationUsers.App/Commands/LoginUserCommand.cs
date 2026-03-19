using MediatR;


namespace ApplicationUsers.App.Commands
{
    public record  LoginUserCommand(string email , string password) : IRequest<string>;
}
