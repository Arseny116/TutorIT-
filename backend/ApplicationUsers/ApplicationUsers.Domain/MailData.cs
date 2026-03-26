using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationUsers.Infrastructure
{
    public class MailData
    {
        // Receiver
        public string To { get; }
        public List<string> Bcc { get; } = new List<string>();

        public List<string> Cc { get; } = new List<string>();

        // Sender
        public string? From { get; } 

        public string? DisplayName { get; } 

        public string? ReplyTo { get; } 

        public string? ReplyToName { get; } 

        // Content
        public string Subject { get; }

        public string? Body { get; }

        public MailData(
            string to,
            string subject,
            string? body = null,
            string? from = null,
            string? displayName = null,
            string? replyTo = null,
            string? replyToName = null,
            List<string>? bcc = null,
            List<string>? cc = null
   )
        {
            // Receiver
            To = to;
            Bcc = bcc ?? new List<string>();
            Cc = cc ?? new List<string>();

            // Sender
            From = from;
            DisplayName = displayName;
            ReplyTo = replyTo;
            ReplyToName = replyToName;

            // Content
            Subject = subject;
            Body = body;
        }
    }
}
