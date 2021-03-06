﻿using System.Collections.Generic;

namespace D3Grid
{
	public interface IGridDataService
	{
		string GetData<TRow>(IEnumerable<TRow> currentPage, int totalRowCount, string contentType, string footerText = null)
			where TRow : class;
	}
}