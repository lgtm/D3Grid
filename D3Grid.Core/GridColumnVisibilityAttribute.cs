using System;

namespace D3Grid
{
	[AttributeUsage(AttributeTargets.Field | AttributeTargets.Property, AllowMultiple = true, Inherited = true)]
	public abstract class GridColumnVisibilityAttribute : Attribute
	{
		public abstract bool IsVisible(object user);
	}
}