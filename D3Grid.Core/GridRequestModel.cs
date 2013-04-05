using System;

namespace D3Grid
{
	public class GridRequestModel
	{
		public int PageIndex { get; set; }
		public int PageSize { get; set; }
		public string SortColumnName { get; set; }
		public SortOrder SortOrder { get; set; }

		public PagerSorter ToPagerSorter()
		{
			return new PagerSorter
			{
				PageNumber = PageIndex + 1,// how is our pager not zero based?
				PageSize = PageSize,
				SortColumn = SortColumnName,
				SortOrder = SortOrder
			};
		}
	}
}