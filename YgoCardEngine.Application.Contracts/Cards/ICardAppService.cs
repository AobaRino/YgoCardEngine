using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using YgoCardEngine.Application.Contracts.Dtos;

namespace YgoCardEngine.Application.Contracts.Cards
{
    public interface ICardAppService:IApplicationService
    {
        Task<CardDto> GetList();
    }
}
