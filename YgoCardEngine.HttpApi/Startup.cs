using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using YgoCardEngine.Application;
using YgoCardEngine.Application.Cards;
using YgoCardEngine.Application.Contracts.Cards;
using YgoCardEngine.Application.Contracts.Users;
using YgoCardEngine.Application.Users;
using YgoCardEngine.Domain.Shared;
using YgoCardEngine.EntityFrameworkCore.EntityFrameworkCore;
using YgoCardEngine.HttpApi.Middleware;

// ReSharper disable All

namespace YgoCardEngine
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddControllers();

            services.AddAutoMapper(typeof(YgoCardEngineApplicationAutoMapperProfile));

            services.AddDbContext<YgoCardEngineDbContext>(
                options =>
                    options.UseSqlite(Configuration.GetConnectionString("Sqlite")));
            services.AddSwaggerGen(options =>
            {
                options.SwaggerDoc("v1", new OpenApiInfo { Title = "ÀäÆø¿ª·Å", Version = "1.0" });
            });

            services.AddOptions();
            services.Configure<AESConfig>(Configuration.GetSection("AESConfig"));

            services.AddScoped<ICardAppService, CardAppService>();
            services.AddScoped<IUserCardAppService, UserCardAppService>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseHttpsRedirection();

            app.UseSwagger();

            app.UseSwaggerUI(options =>
            {
                options.SwaggerEndpoint("/swagger/v1/swagger.json", "ºß£¡");
            });

            app.UseRouting();

            app.UseCustomMiddleware();

            //app.UseAuthentication();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}
