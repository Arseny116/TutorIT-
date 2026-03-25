using ApplicationUsers.Domain.Interface;
using MailKit.Security;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;
using SmtpClient = MailKit.Net.Smtp.SmtpClient;

namespace ApplicationUsers.Infrastructure
{
    public class MailService : IMailService
    {
        private readonly MailSettings _settings;
        private readonly ILogger _logger;

        public MailService(ILogger<MailService> logger, IOptions<MailSettings> settings)
        {
            _logger = logger;
            _settings = settings.Value;
        }

        public async Task<bool> SendHelloAsync(MailData mailData)
        {
            try
            {
                var mail = new MimeMessage();

                #region Sender / Receiver
                mail.From.Add(new MailboxAddress(_settings.DisplayName, _settings.From));
                mail.To.Add(MailboxAddress.Parse(mailData.To));
                #endregion

                #region Content
                mail.Subject = mailData.Subject;

                var body = new BodyBuilder();
                body.TextBody = "Здравствуйте!\n\nБлагодарим вас за регистрацию на платформе TutorIt. Мы очень рады приветствовать вас в нашем сообществе!\n";
                body.HtmlBody = @"
<!DOCTYPE html>
<html>
<head>
    <meta charset=""UTF-8"">
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Arial, sans-serif;
            line-height: 1.5;
            color: #333333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            overflow: hidden;
        }
        .header {
            background-color: #4a6fa5;
            padding: 30px 20px;
            text-align: center;
        }
        .logo {
            font-size: 36px;
            font-weight: 600;
            color: #ffffff;
            margin: 0;
        }
        .logo span {
            color: #ffd166;
        }
        .content {
            padding: 30px 25px;
            background-color: #ffffff;
        }
        h1 {
            font-size: 24px;
            color: #333333;
            margin-top: 0;
            margin-bottom: 20px;
            font-weight: 500;
        }
        p {
            font-size: 16px;
            color: #555555;
            margin-bottom: 20px;
        }
        .features {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 6px;
            margin: 25px 0;
        }
        .feature-item {
            margin-bottom: 15px;
        }
        .feature-title {
            font-size: 16px;
            font-weight: 600;
            color: #4a6fa5;
            margin-bottom: 5px;
        }
        .feature-text {
            font-size: 14px;
            color: #666666;
            margin: 0;
        }
        .button {
            display: inline-block;
            background-color: #4a6fa5;
            color: #ffffff;
            text-decoration: none;
            padding: 14px 30px;
            border-radius: 6px;
            font-size: 16px;
            font-weight: 500;
            margin: 20px 0 10px;
            text-align: center;
        }
        .footer {
            background-color: #f5f5f5;
            padding: 20px;
            text-align: center;
            font-size: 13px;
            color: #999999;
            border-top: 1px solid #eaeaea;
        }
    </style>
</head>
<body style=""margin:0; padding:20px; background-color:#f4f4f4;"">
    <div class=""container"">
        <div class=""header"">
            <h1 class=""logo"">Tutor<span>It</span></h1>
        </div>
        
        <div class=""content"">
            <h1>Здравствуйте!</h1>
            
            <p>Благодарим вас за регистрацию на платформе <strong>TutorIt</strong>. Мы очень рады приветствовать вас в нашем сообществе!</p>
            
            <p>TutorIt — это пространство, где обучение становится доступным, увлекательным и результативным. Здесь вы найдете лучших преподавателей и удобные инструменты для занятий.</p>
            
            <p style=""font-size:14px; color:#999999; margin-top:25px;"">Если у вас есть вопросы, просто ответьте на это письмо — мы всегда на связи!</p>
        </div>
        
        <div class=""footer"">
            <p>© 2026 TutorIt. Все права защищены.</p>
            <p>Вы получили это письмо, потому что зарегистрировались на сайте TutorIt.</p>
        </div>
    </div>
</body>
</html>
";

                mail.Body = body.ToMessageBody();
                #endregion

                #region Send Mail
                using (var client = new SmtpClient())
                {
                    try
                    {
                        client.Timeout = 10000;

                        // Для порта 2525 используем обычное подключение без SSL/TLS
                        // или с STARTTLS если сервер поддерживает
                        await client.ConnectAsync(_settings.Host, _settings.Port, SecureSocketOptions.None);

                        // Аутентификация
                        await client.AuthenticateAsync(_settings.UserName, _settings.Password);

                        await client.SendAsync(mail);

                        _logger.LogInformation("Письмо успешно отправлено на {Email}", mailData.To);
                        return true;
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Ошибка при отправке письма на {Email}", mailData.To);
                        return false;
                    }
                    finally
                    {
                        if (client.IsConnected)
                            await client.DisconnectAsync(true);
                    }
                }
                #endregion
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при формировании письма");
                return false;
            }
        }
    }
}