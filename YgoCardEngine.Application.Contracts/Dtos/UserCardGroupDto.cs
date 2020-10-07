using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;

namespace YgoCardEngine.Application.Contracts.Dtos
{
    public class UserCardGroupDto
    {
        /// <summary>
        /// 用户id
        /// </summary>
        public string Id { get; set; }

        public List<CardGroupDto> CardGroups { get; set; }
    }
}
