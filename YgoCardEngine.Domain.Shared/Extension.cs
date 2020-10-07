using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace YgoCardEngine.Domain.Shared
{
    public static class Extension
    {
        /// <summary>
        /// 祖传分页了解一下？
        /// </summary>
        /// <typeparam name="TSource"></typeparam>
        /// <param name="source"></param>
        /// <param name="pageIndex">页数</param>
        /// <returns></returns>
        public static IQueryable<TSource> Paged<TSource>(this IQueryable<TSource> source, int pageIndex)
        {
            if (pageIndex <= 0)
                pageIndex = 1;
            return source.Skip((pageIndex - 1) * Config.PageSize).Take(Config.PageSize);
        }
    }
}
