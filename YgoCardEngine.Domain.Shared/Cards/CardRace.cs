using System;
using System.Collections.Generic;
using System.Text;

namespace YgoCardEngine.Domain.Shared.Cards
{
   public enum CardRace
    {
        /// <summary>
        /// 战士族
        /// </summary>
        Warrior = 1,
        /// <summary>
        /// 魔法师族
        /// </summary>
        Spellcaster = 2,
        /// <summary>
        /// 天使族
        /// </summary>
        Fariy = 4,
        /// <summary>
        /// 恶魔族
        /// </summary>
        Fiend = 8,
        /// <summary>
        /// 不死族
        /// </summary>
        Zombie = 16,
        /// <summary>
        /// 机械族
        /// </summary>
        Machine = 32,
        /// <summary>
        /// 水族
        /// </summary>
        Aqua = 64,
        /// <summary>
        /// 炎族
        /// </summary>
        Pyro = 128,
        /// <summary>
        /// 岩石族
        /// </summary>
        Rock = 256,
        /// <summary>
        /// 鸟兽族
        /// </summary>
        WingedBeast = 512,
        /// <summary>
        /// 植物族
        /// </summary>
        Plant = 1024,
        /// <summary>
        /// 昆虫族
        /// </summary>
        Insect = 2048,
        /// <summary>
        /// 雷族
        /// </summary>
        Thunder = 4096,
        /// <summary>
        /// 龙族
        /// </summary>
        Dragon = 8192,
        /// <summary>
        /// 兽族
        /// </summary>
        Beast = 16384,
        /// <summary>
        /// 兽战士族
        /// </summary>
        BeastWarrior = 32768,
        /// <summary>
        /// 恐龙族
        /// </summary>
        Dinosaur = 65536,
        /// <summary>
        /// 鱼族
        /// </summary>
        Fish = 131072,
        /// <summary>
        /// 海龙族
        /// </summary>
        SeaSerpent = 262144,
        /// <summary>
        /// 爬虫类族
        /// </summary>
        Reptile = 524288,
        /// <summary>
        /// 念动力族
        /// </summary>
        Psychic = 1048576,
        /// <summary>
        /// 幻神兽族
        /// </summary>
        DivineBeast = 2097152,
        /// <summary>
        /// 创造神族
        /// </summary>
        CreatorGod = 4194304
    }
}
