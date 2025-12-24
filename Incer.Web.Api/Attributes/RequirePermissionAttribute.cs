using System;

namespace Incer.Web.Api.Attributes
{
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class)]
    public class RequirePermissionAttribute : Attribute
    {
        public string Resource { get; }
        public string Action { get; }

        public RequirePermissionAttribute(string resource, string action)
        {
            Resource = resource;
            Action = action;
        }
    }
}
