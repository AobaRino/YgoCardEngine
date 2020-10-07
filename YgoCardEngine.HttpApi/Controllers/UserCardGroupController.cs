using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using YgoCardEngine.Application.Contracts.Dtos;
using YgoCardEngine.Application.Contracts.Users;

namespace YgoCardEngine.HttpApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserCardGroupController : ControllerBase
    {
        private readonly IUserCardAppService _userCardAppService;

        public UserCardGroupController(IUserCardAppService userCardAppService)
        {
            _userCardAppService = userCardAppService ?? throw new ArgumentException(nameof(_userCardAppService));
        }

        [HttpHead, HttpGet(nameof(GetUserCardGroupsAsync))]
        public async Task<ActionResult<PagedDto<CardGroupDto>>> GetUserCardGroupsAsync([FromQuery] CardGroupSearchDto input)
        {
            var result = await _userCardAppService.GetUserCardGroupAsync(input);
            return Ok(result);
        }

        [HttpGet("{id}", Name = nameof(GetUserCardGroupAsync))]
        public async Task<ActionResult<CardGroupDto>> GetUserCardGroupAsync(Guid id)
        {
            var result = await _userCardAppService.GetUserCardGroupAsync(id);
            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<CardGroupDto>> PostAsync(CardGroupDto input)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState.Values);
            }

            var result = await _userCardAppService.AddUserCardGroupAsync(input);
            return CreatedAtRoute(nameof(GetUserCardGroupAsync), new { id = result.Id }, result);
        }

        [HttpDelete("{id}", Name = nameof(DeleteUserCardGroupAsync))]
        public async Task<IActionResult> DeleteUserCardGroupAsync(Guid id)
        {
            var cardGroup = await _userCardAppService.GetUserCardGroupAsync(id);
            if (cardGroup == null)
                return NotFound();

            await _userCardAppService.DeleteCardGroupAsync(cardGroup);
            return NoContent();
        }

        [HttpOptions]
        public IActionResult GetUserCardGroupOptions()
        {
            Response.Headers.Add("Allow", "GET,POST,OPTIONS");
            return Ok();
        }
    }
}
