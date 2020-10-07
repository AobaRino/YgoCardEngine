using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using YgoCardEngine.Application.Contracts.Cards;
using YgoCardEngine.Application.Contracts.Dtos;
using YgoCardEngine.EntityFrameworkCore.EntityFrameworkCore;

namespace YgoCardEngine.HttpApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CardsController : ControllerBase
    {
        private readonly ICardAppService _cardAppService;

        public CardsController(ICardAppService cardAppService)
        {
            _cardAppService = cardAppService ?? throw new ArgumentException(nameof(_cardAppService));
        }

        [HttpGet]
        public async Task<PagedDto<CardInfoDto>> GetAsync([FromQuery] CardInfoSearchDto input)
        {
            var result = await _cardAppService.GetListAsync(input);
            return result;
        }
    }
}
