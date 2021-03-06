﻿using System;

namespace D3Grid
{
	[AttributeUsage(AttributeTargets.Field | AttributeTargets.Property, AllowMultiple = false, Inherited = false)]
	public sealed class GridIncludeAttribute : Attribute
	{
		public GridIncludeAttribute()
		{
			IncludeType = GridIncludeType.Column;
			Format = GridColumnFormat.PlainText;
		}

		public GridIncludeType IncludeType { get; set; }
		public GridColumnFormat Format { get; set; }
		public string Label { get; set; }
		public string SortColumnName { get; set; }
		public bool IsSortable { get; set; }
	}
}