using System;
using System.Collections.Generic;
using System.Text;

namespace YgoCardEngine.Domain.Shared.Cards
{
    public enum CardAttribute
    {
        /// <summary>
        /// 地
        /// </summary>
        Earth = 1,
        /// <summary>
        /// 水
        /// </summary>
        Water = 2,
        /// <summary>
        /// 炎
        /// </summary>
        Fire = 4,
        /// <summary>
        /// 風
        /// </summary>
        Wind = 8,
        /// <summary>
        /// 光
        /// </summary>
        Light = 16,
        /// <summary>
        /// 闇
        /// </summary>
        Dark = 32,
        /// <summary>
        /// 神
        /// </summary>
        Divine = 64
    }
}
