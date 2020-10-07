using System;
using System.Collections.Generic;
using System.Text;

namespace YgoCardEngine.Domain.Shared
{
    [AttributeUsage(AttributeTargets.Method|AttributeTargets.Class,AllowMultiple = false)]
    public class CustomAuthorizeAttribute:Attribute
    {

    }
}
