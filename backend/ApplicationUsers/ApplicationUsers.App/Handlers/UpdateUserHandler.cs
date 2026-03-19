using ApplicationUsers.App.Commands;
using ApplicationUsers.Infrastructure;
using MediatR;

namespace ApplicationUsers.App.Handlers
{
    public class UpdateMyUserHandler : IRequestHandler<UpdateUserMyCourseCommand>
    {
        private readonly IUserRepository _userRepository;
        public UpdateMyUserHandler(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }
        public async Task Handle(UpdateUserMyCourseCommand request, CancellationToken cancellationToken)
        {
            await _userRepository.UpdateMyCourse(request.guid_user, request.guid_my_course);
        }
    }


    public class UpdateForeginUserHandler : IRequestHandler<UpdateUserForeginCourseCommand>
    {
        private readonly IUserRepository _userRepository;
        public UpdateForeginUserHandler(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }
        public async Task Handle(UpdateUserForeginCourseCommand request, CancellationToken cancellationToken)
        {
            await _userRepository.UpdateMyCourse(request.guid_user, request.guid_foregin_course);
        }
    }



}
