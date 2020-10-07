using System;
using System.Collections.Generic;
using System.Text;

namespace YgoCardEngine.Domain.Shared
{
    public class AESConfig
    {
        /// <summary>
        /// 密钥
        /// </summary>
        public string Key { get; set; }
        /// <summary>
        /// 向量
        /// </summary>
        public string Vector { get; set; }
    }
}
