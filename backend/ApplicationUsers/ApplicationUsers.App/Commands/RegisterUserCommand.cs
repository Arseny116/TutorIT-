using CSharpFunctionalExtensions;
using MediatR;

namespace ApplicationUsers.App.Command
{
    public record RegisterUserCommand(string Name, string Email, string Password) : IRequest<Result<Guid>>;
}
