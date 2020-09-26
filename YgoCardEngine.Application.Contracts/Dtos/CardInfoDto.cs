using System;
using System.Collections.Generic;
using System.Text;

namespace YgoCardEngine.Application.Contracts.Dtos
{
    public class CardInfoDto
    {

        public int Id { get; set; }
        public string Name { get; set; }
        public string Desc { get; set; }
        public int Ot { get; set; }
        public int Alias { get; set; }
        public long SetCode { get; set; }
        public int Type { get; set; }
        public int Atk { get; set; }
        public int Def { get; set; }
        public long Level { get; set; }
        public int Race { get; set; }
        public int Attribute { get; set; }
        public long Category { get; set; }

    }
}
