using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Primitives;
using YgoCardEngine.Domain.Shared;

namespace YgoCardEngine.HttpApi.Middleware
{
    public class AuthorizeMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly AESConfig _aesConfig;

        public AuthorizeMiddleware(RequestDelegate next, IOptions<AESConfig> aesConfig)
        {
            _next = next ?? throw new ArgumentNullException(nameof(_next));
            _aesConfig = aesConfig.Value ?? throw new ArgumentNullException(nameof(_aesConfig));
        }

        public async Task Invoke(HttpContext httpContext)
        {
            var endPointMetaData = httpContext.GetEndpoint()?.Metadata;
            if (endPointMetaData == null)
                throw new ArgumentNullException(nameof(endPointMetaData));

            var hasCustomAuthorizeAttribute = endPointMetaData.Any(x => x is CustomAuthorizeAttribute);
            var hasAllowAnonymous = endPointMetaData.Any(x => x is AllowAnonymousAttribute);

            if (!hasCustomAuthorizeAttribute || hasAllowAnonymous)
            {
                await _next(httpContext);
                return;
            }

            var authentication = httpContext.Request.Headers["Authentication"];
            if (string.IsNullOrEmpty(authentication))
            {
                await Unauthorized(httpContext);
                return;
            }

            var uid = AuthentiocationHelper.Check(
                authentication,
                _aesConfig.Key,
                _aesConfig.Vector);


            if (string.IsNullOrEmpty(uid))
            {
                await Unauthorized(httpContext);
                return;
            }

            await _next(httpContext);
        }

        private async Task Unauthorized(HttpContext httpContext)
        {
            httpContext.Response.StatusCode = 401;
            httpContext.Response.ContentType = "text/html;charset=utf-8";
            await httpContext.Response.WriteAsync("呃，你是谁呀？(｡•ˇ‸ˇ•｡)");
        }

    }
}
