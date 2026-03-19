using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ApplicationUsers.Domain;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;


namespace ApplicationUsers.Infrastructure.Authentication
{
    public class JwtProvider(IOptions<JwtOptions> Options) : IJwtProvider
    {

        private readonly JwtOptions _options = Options.Value;

        public  string GenerateToken(User user)
        {

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),     
                new Claim(JwtRegisteredClaimNames.Email, user.Email),            
            };


            var signingCredentials = new SigningCredentials( new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.SecretKey)), SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken
                (
                claims: claims,
                signingCredentials: signingCredentials,
                expires: DateTime.UtcNow.AddHours(_options.ExpitesHours)
                );
            var tokenValue = new JwtSecurityTokenHandler().WriteToken(token);

            return tokenValue;
        }
    }
}
