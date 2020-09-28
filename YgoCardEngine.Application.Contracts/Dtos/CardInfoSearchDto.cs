using System;
using System.Collections.Generic;
using System.Text;

namespace YgoCardEngine.Application.Contracts.Dtos
{
    public class CardInfoSearchDto
    {
        public int PageIndex { get; set; } = 1;
        /// <summary>
        /// 排序规则
        /// </summary>
        public string Sort { get; set; }

        /// <summary>
        /// default:降序
        /// </summary>
        public bool Asc { get; set; } = false;
        public string Name { get; set; }
        /// <summary>
        /// 卡片类型
        /// </summary>
        public int? CardType { get; set; }
        /// <summary>
        /// 种族
        /// </summary>
        public int? CardRace { get; set; }
        /// <summary>
        /// 属性
        /// </summary>
        public int? Attr { get; set; }
        /// <summary>
        /// 攻击力
        /// </summary>
        public int? Atk { get; set; }
        /// <summary>
        /// 防御力
        /// </summary>
        public int? Def { get; set; }

    }
}
