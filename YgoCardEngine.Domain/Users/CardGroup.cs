using System;
using System.Collections.Generic;
using System.Text;

namespace YgoCardEngine.Domain.Users
{
    public class CardGroup
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UserId { get; set; }
        public User User { get; set; }
        public string Title { get; set; }
        public string Tag { get; set; }
        public string CardGroupInfo { get; set; }

    }
}
