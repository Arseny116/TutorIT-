using MediatR;

namespace ApplicationUsers.App.Commands
{
    public record UpdateUserMyCourseCommand(Guid guid_user, Guid guid_my_course) : IRequest;

    public record UpdateUserForeginCourseCommand(Guid guid_user, Guid guid_foregin_course) : IRequest;

}
