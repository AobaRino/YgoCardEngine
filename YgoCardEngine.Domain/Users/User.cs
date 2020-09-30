using System;
using System.Collections.Generic;
using System.Text;

namespace YgoCardEngine.Domain.Users
{
    public class User
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public List<CardGroup> CardGroups { get; } = new List<CardGroup>();
    }
}
