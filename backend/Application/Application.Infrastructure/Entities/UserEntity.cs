using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Infrastructure
{
    public class UserEntity
    {
        public Guid Id { get; set; }

        public string UserName { get; set; } = string.Empty;


        public string PasswordHash { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;
    }
}
