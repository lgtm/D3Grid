﻿namespace D3Grid
{
	public sealed class PagerSorter
	{
		public int PageSize { get; set; }
		public int PageNumber { get; set; }
		public string SortColumn { get; set; }
		public SortOrder SortOrder { get; set; }
		public int TotalRecordsInSet { get; set; }
	}
}