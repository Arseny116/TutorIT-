
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Application.Domain;
using Application.Domain.Interface;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;


namespace Application.Infrastructure
{
    public class JwtProvider(IOptions<JwtOptions> Options) : IJwtProvider
    {
        private readonly JwtOptions _options = Options.Value;

        public string GenerateToken(User user)
        {

            Claim[] claims = [new("userId", user.Id.ToString())];//claim -класс который содержит ключ значения для информации которую можно передавать с ключем 


            //SymmetricSecurityKey(для секрет ключа - для кодировки кода)
            var signingCredentials = new SigningCredentials(
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.SecretKey)), SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(

                //Чтобы передавать информацию.Только тут токен начинает хранить информацию
                claims: claims,
                signingCredentials: signingCredentials,
                expires: DateTime.UtcNow.AddHours(_options.ExpitesHours)
                );
            var tokenValue = new JwtSecurityTokenHandler().WriteToken(token);// тк до это еще не строка совсем

            return tokenValue;
        }
    }
}
