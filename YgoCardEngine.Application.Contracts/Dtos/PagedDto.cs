using System;
using System.Collections.Generic;
using System.Text;
using YgoCardEngine.Domain.Shared;

namespace YgoCardEngine.Application.Contracts.Dtos
{
    public class PagedDto<T>
    {
        /// <summary>
        /// 当前页数
        /// </summary>
        public int PageIndex { get; set; } = 1;

        /// <summary>
        /// 每页显示
        /// </summary>
        private int PageSize { get; set; } = Config.PageSize;

        /// <summary>
        /// 总数
        /// </summary>
        public int PageTotal { get; set; } = 0;
        /// <summary>
        /// 数据集
        /// </summary>
        public List<T> DataItems { get; set; } = new List<T>();
    }
}
