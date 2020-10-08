using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking.Internal;
using YgoCardEngine.Application.Contracts.Dtos;
using YgoCardEngine.Application.Contracts.Users;
using YgoCardEngine.Domain.Shared;
using YgoCardEngine.Domain.Users;
using YgoCardEngine.EntityFrameworkCore.EntityFrameworkCore;

namespace YgoCardEngine.Application.Users
{
    public class UserCardAppService : AppService, IUserCardAppService
    {
        private readonly IMapper _mapper;

        public UserCardAppService(YgoCardEngineDbContext context, IMapper mapper) : base(context)
        {
            _mapper = mapper ?? throw new ArgumentException(nameof(_mapper));
        }

        public async Task<PagedDto<CardGroupDto>> GetUserCardGroupAsync(CardGroupSearchDto input)
        {
            var list = _context.CardGroups.Where(x =>
                (input.Id == null || x.User.Id == input.Id) &&
                (string.IsNullOrEmpty(input.Title) || x.Title.Contains(input.Title)));

            var count = await list.CountAsync();
            if (count == 0)
                return new PagedDto<CardGroupDto>();

            var cardGroups = await list.Paged(input.PageIndex).ToListAsync();

            var result = _mapper.Map<List<CardGroupDto>>(cardGroups);

            return new PagedDto<CardGroupDto>
            {
                PageIndex = 1,
                PageTotal = count,
                DataItems = result
            };
        }

        public async Task<CardGroupDto> GetUserCardGroupAsync(Guid id)
        {
            var result = await _context.CardGroups.FirstOrDefaultAsync(x => x.Id == id);
            return _mapper.Map<CardGroupDto>(result);
        }

        public async Task<CardGroupDto> AddUserCardGroupAsync(CardGroupDto input)
        {
            var model = _mapper.Map<CardGroup>(input);
            var result = await _context.CardGroups.AddAsync(model);
            await _context.SaveChangesAsync();
            return _mapper.Map<CardGroupDto>(result.Entity);
        }


        public async Task DeleteCardGroupAsync(CardGroupDto input)
        {
            var entity = _mapper.Map<CardGroup>(input);
            _context.CardGroups.Remove(entity);
            await _context.SaveChangesAsync();
        }

        public async Task<Guid> CreateUserAsync(string oid)
        {
            var entity = await _context.Users.FirstOrDefaultAsync(x => x.Oid == oid);
            if (entity != null)
            {
                return entity.Id;
            }

            var user = new User
            {
                Oid = oid
            };
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();
            return user.Id;
        }

    }
}
