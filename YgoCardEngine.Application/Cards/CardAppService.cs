using System.Threading.Tasks;
using YgoCardEngine.Application.Contracts.Cards;
using YgoCardEngine.Application.Contracts.Dtos;

namespace YgoCardEngine.Application.Cards
{
    public class CardAppService : ICardAppService
    {
        public Task<CardDto> GetList()
        {
            throw new System.NotImplementedException();
        }
    }
}
