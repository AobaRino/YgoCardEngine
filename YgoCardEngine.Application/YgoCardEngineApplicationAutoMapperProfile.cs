using System;
using System.Collections.Generic;
using System.Text;
using AutoMapper;
using YgoCardEngine.Application.Contracts.Dtos;
using YgoCardEngine.Domain.Cards;
using YgoCardEngine.Domain.Users;

namespace YgoCardEngine.Application
{
    public class YgoCardEngineApplicationAutoMapperProfile:Profile
    {
        public YgoCardEngineApplicationAutoMapperProfile()
        {
            CreateMap<CardInfo,CardInfoDto>();
            CreateMap<CardGroup, CardGroupDto>();
            CreateMap<CardGroupDto, CardGroup>();
        }
    }
}
