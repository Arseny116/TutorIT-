using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Domain
{
    public class User
    {

        private User(Guid id, string userName, string passwordHash, string email)
        {
            Id = id;
            UserName = userName;
            PasswordHash = passwordHash;
            Email = email;
        }

        public Guid Id { get; private set; }

        public string UserName { get; private set; }


        public string PasswordHash { get; private set; }

        public string Email { get; private set; }

        public static User Create(Guid id, string userName, string passwordHash, string email)
        {
            return new User(id, userName, passwordHash, email);
        }


    }
}
