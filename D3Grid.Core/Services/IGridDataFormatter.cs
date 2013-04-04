using System;
using System.Collections.Generic;

namespace D3Grid.Core
{
	public interface IGridDataFormatter
	{
		bool RespondsTo(string format);

		string GetData<TRow>(IEnumerable<TRow> currentPage, int totalRowCount, string footerText = null)
			where TRow : class;
	}
}