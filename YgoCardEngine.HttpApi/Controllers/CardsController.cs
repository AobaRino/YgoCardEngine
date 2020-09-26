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
            _cardAppService = cardAppService;
        }

        // GET: api/<CardsController>
        [HttpGet]
        public async Task<PagedDto<CardInfoDto>> GetAsync([FromQuery]CardInfoSearchDto input)
        {
            var result = await _cardAppService.GetListAsync(input);


            return result;
        }

        // GET api/<CardsController>/5
        [HttpGet("{id}")]
        public string Get(int id)
        {
            return "value";
        }

        // POST api/<CardsController>
        [HttpPost]
        public void Post([FromBody] string value)
        {
        }

        // PUT api/<CardsController>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE api/<CardsController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }


    }
}
