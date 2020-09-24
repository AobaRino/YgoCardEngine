using System;
using System.Collections.Generic;
using System.Text;

namespace YgoCardEngine.Domain.Shared.Cards
{
   public enum CardType
    {
        /// <summary>
        /// 怪兽
        /// </summary>
        Monster = 1,
        /// <summary>
        /// 魔法卡
        /// </summary>
        Spell = 2,
        /// <summary>
        /// 陷阱卡
        /// </summary>
        Trap = 4,
        /// <summary>
        /// 通常
        /// </summary>
        Normal = 16,
        /// <summary>
        /// 效果
        /// </summary>
        Effect = 32,
        /// <summary>
        /// 融合怪兽
        /// </summary>
        Fusion = 64,
        /// <summary>
        /// 协调
        /// </summary>
        Tuner = 4096,
        /// <summary>
        /// 同步怪兽
        /// </summary>
        Synchro = 8192,
        /// <summary>
        /// 速攻魔法
        /// </summary>
        QuickPlay = 65536,
        /// <summary>
        /// 永续
        /// </summary>
        Continuous = 131072,
        /// <summary>
        /// 装备
        /// </summary>
        Equip = 262144,
        /// <summary>
        /// 场地
        /// </summary>
        Field = 524288,
        /// <summary>
        /// 计数器
        /// </summary>
        Counter = 1048576
    }
}
