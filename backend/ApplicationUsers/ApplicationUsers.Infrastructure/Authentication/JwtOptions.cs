using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationUsers.Infrastructure.Authentication
{
    public class JwtOptions
    {
        public string ValidIssuer { get; set; }

        public string SecretKey { get; set; } 

        public int ExpitesHours { get; set; }
    }
}
