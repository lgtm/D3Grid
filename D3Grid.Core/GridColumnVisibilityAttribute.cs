using System;

namespace D3Grid.Core
{
	public abstract class GridColumnVisibilityAttribute : Attribute
	{
		public abstract bool IsVisible(object user);
	}
}