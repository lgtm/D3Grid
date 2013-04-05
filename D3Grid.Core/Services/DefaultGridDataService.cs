using System;
using System.Collections.Generic;
using System.Linq;

namespace D3Grid
{
	public class DefaultGridDataService : IGridDataService
	{
		protected static readonly IList<IGridDataFormatter> DataFormatters = new[]
		{
			new JsonGridDataFormatter()
		};

		public string GetData<TRow>(IEnumerable<TRow> currentPage, int totalRowCount, string contentType, string footerText = null)
			where TRow : class
		{
			if (String.IsNullOrWhiteSpace(contentType))
			{
				throw new ArgumentException("You must provide a contentType in order to output the data!", "contentType");
			}

			// use first formatter as default if no match
			var formatter = DataFormatters.FirstOrDefault(x => x.RespondsTo(contentType)) ?? DataFormatters.First();

			return formatter.GetData(currentPage, totalRowCount, footerText);
		}
	}
}