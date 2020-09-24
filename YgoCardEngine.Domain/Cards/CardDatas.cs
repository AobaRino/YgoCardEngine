using System;
using System.Collections.Generic;
using System.Text;
using YgoCardEngine.Domain.Shared.Cards;

namespace YgoCardEngine.Domain.Cards
{
    public class CardDatas
    {
        public int Id { get; set; }
        /// <summary>
        /// 卡片来源
        /// </summary>
        public CardSource Ot { get; set; }
        /// <summary>
        /// 同名卡的ID（没有为0）
        /// </summary>
        public int Alias { get; set; }
        /// <summary>
        /// 命名设置
        /// </summary>
        public int SetCode { get; set; }
        /// <summary>
        /// 卡片种类
        /// </summary>
        public CardType Type { get; set; }
        /// <summary>
        /// 攻击力
        /// </summary>
        public int Atk { get; set; }
        /// <summary>
        /// 防御力
        /// </summary>
        public int Def { get; set; }
        /// <summary>
        /// 等级
        /// </summary>
        public int Level { get; set; }
        /// <summary>
        /// 种族
        /// </summary>
        public CardRace Race { get; set; }
        /// <summary>
        /// 属性
        /// </summary>
        public CardAttribute Attribute { get; set; }
        /// <summary>
        /// 效果检索
        /// </summary>
        public int Category { get; set; }

    }
}
