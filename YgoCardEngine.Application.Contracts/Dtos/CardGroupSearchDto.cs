using System;
using System.Collections.Generic;
using System.Text;

namespace YgoCardEngine.Application.Contracts.Dtos
{
    public class CardGroupSearchDto
    {
        public int PageIndex { get; set; } = 1;
        /// <summary>
        /// 用户Id
        /// </summary>
        public Guid? Id { get; set; }
        public string Title { get; set; }
        public string Tag { get; set; }
    }
}
