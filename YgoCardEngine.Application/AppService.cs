using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using YgoCardEngine.EntityFrameworkCore.EntityFrameworkCore;

namespace YgoCardEngine.Application
{
    public class AppService
    {
        public static Guid Id;
        protected readonly YgoCardEngineDbContext _context;

        public AppService(YgoCardEngineDbContext context)
        {
            _context = context;
        }
    }
}
