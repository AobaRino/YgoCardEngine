using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Internal;
using YgoCardEngine.Application.Contracts.Cards;
using YgoCardEngine.Application.Contracts.Dtos;
using YgoCardEngine.Domain.Cards;
using YgoCardEngine.EntityFrameworkCore.EntityFrameworkCore;
using YgoCardEngine.Domain.Shared;

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
            var count = await _context.CardInfo.CountAsync();
            if (count == 0)
                return new PagedDto<CardInfoDto>();

            var cardInfo = await _context.CardInfo
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


    }
}
