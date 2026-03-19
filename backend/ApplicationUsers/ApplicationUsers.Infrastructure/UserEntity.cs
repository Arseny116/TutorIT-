namespace ApplicationUsers.Infrastructure
{
    public class UserEntity
    {
        public Guid Id { get; set; }

        public string Name { get; set; }

        public string Email { get; set; }

        public string Password { get; set; }

        public List<Guid> CreatedCourseIds { get; set; } = new List<Guid>();

        public List<Guid> EnrolledCourseIds { get; set; } = new List<Guid>();

        public UserEntity() { }
    }
}
