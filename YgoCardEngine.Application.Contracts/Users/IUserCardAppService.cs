using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using YgoCardEngine.Application.Contracts.Dtos;

namespace YgoCardEngine.Application.Contracts.Users
{
    public interface IUserCardAppService
    {
        /// <summary>
        /// 检索卡组列表
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        Task<PagedDto<CardGroupDto>> GetUserCardGroupAsync(CardGroupSearchDto input);
        /// <summary>
        /// 获取卡组详情
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        Task<CardGroupDto> GetUserCardGroupAsync(Guid id);
        /// <summary>
        /// 添加卡组
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        Task<CardGroupDto> AddUserCardGroupAsync(CardGroupDto input);
        /// <summary>
        /// 删除卡组
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        Task DeleteCardGroupAsync(CardGroupDto id);

    }
}
