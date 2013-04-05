using System;
using System.Collections.Generic;
using System.Linq;

namespace D3Grid
{
	public interface IGridDataService
	{
		string GetData<TRow>(IEnumerable<TRow> currentPage, int totalRowCount, string dataFormat, string footerText = null)
			where TRow : class;
	}

	public class GridDataService : IGridDataService
	{
		private static readonly IEnumerable<IGridDataFormatter> DataFormatters = new[]
			{
				new JsonGridDataFormatter()
			};

		public string GetData<TRow>(IEnumerable<TRow> currentPage, int totalRowCount, string dataFormat, string footerText = null)
			where TRow : class
		{
			if (String.IsNullOrWhiteSpace(dataFormat))
			{
				throw new ArgumentException("data format cannot be null", "dataFormat");
			}

			// use first formatter as default if no match
			var formatter = DataFormatters.FirstOrDefault(x => x.RespondsTo(dataFormat)) ?? DataFormatters.First();

			return formatter.GetData(currentPage, totalRowCount, footerText);
		}
	}
}