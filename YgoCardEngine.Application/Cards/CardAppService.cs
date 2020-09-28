using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using System.Linq.Expressions;
using System.Runtime.Serialization;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Internal;
using YgoCardEngine.Application.Contracts.Cards;
using YgoCardEngine.Application.Contracts.Dtos;
using YgoCardEngine.Domain.Cards;
using YgoCardEngine.EntityFrameworkCore.EntityFrameworkCore;
using YgoCardEngine.Domain.Shared;
using YgoCardEngine.Domain.Shared.Cards;

namespace YgoCardEngine.Application.Cards
{
    public class CardAppService : AppService, ICardAppService
    {
        private readonly IMapper _mapper;

        public CardAppService(YgoCardEngineDbContext context, IMapper mapper) : base(context)
        {
            _mapper = mapper;
        }
        public async Task<PagedDto<CardInfoDto>> GetListAsync(CardInfoSearchDto input)
        {
            var list = _context.CardInfo.Where(x =>
                (string.IsNullOrEmpty(input.Name) || x.Name.Contains(input.Name)) &&
                (input.CardType == null || x.Type == (CardType)input.CardType) &&
                (input.CardRace == null || x.Race == (CardRace)input.CardRace) &&
                (input.Attr == null || x.Attribute == (CardAttribute)input.Attr) &&
                (input.Atk == null || x.Atk == input.Atk) &&
                (input.Def == null || x.Def == input.Def));

            list = Sorted(list, input.Sort, input.Asc);

            var count = await list.CountAsync();

            if (count == 0)
                return new PagedDto<CardInfoDto>();

            var cardInfo = await list
                .Paged(input.PageIndex)
                .ToListAsync();
            var result = _mapper.Map<List<CardInfoDto>>(cardInfo);

            return new PagedDto<CardInfoDto>
            {
                PageIndex = input.PageIndex,
                PageTotal = count,
                DataItems = result
            };


        }

        private IQueryable<CardInfo> Sorted(IQueryable<CardInfo> source,
            string select,
            bool asc) => select switch
            {
                "atk" => OrderBy(source, x => x.Atk, asc),
                "def" => OrderBy(source, x => x.Def, asc),
                _ => source
            };

        private IQueryable<CardInfo> OrderBy(IQueryable<CardInfo> source,
            Expression<Func<CardInfo, int>> keySelector,
            bool asc) => asc ? source.OrderBy(keySelector) : source.OrderByDescending(keySelector);
    }
}
