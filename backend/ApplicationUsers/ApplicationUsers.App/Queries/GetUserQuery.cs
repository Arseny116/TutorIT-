using ApplicationUsers.Domain;
using CSharpFunctionalExtensions;
using MediatR;

namespace ApplicationUsers.App.Queries
{
    public record GetUserByEmail(string email) : IRequest<User>;
    public record GetUserById(Guid id) : IRequest<User>;

}
