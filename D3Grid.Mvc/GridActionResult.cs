using System;
using System.Collections.Generic;
using System.Web.Mvc;
using D3Grid.Core;

namespace D3Grid.Mvc
{
	public class GridActionResult<TGridRow> : ActionResult
		where TGridRow : class
	{
		private readonly IEnumerable<TGridRow> _currentPage;
		private readonly int _totalRowCount;
		private readonly string _footerText;

		private const string AcceptAllContentType = "*/*";
		private const string JsonContentType = "application/json";

		private static string GetDataFormat(ControllerContext context)
		{
			var format = context.HttpContext.Request.Headers["Accept"]; // we could also use Request.ContentType here, but that's input-based

			if (format == AcceptAllContentType)
				return JsonContentType;

			return format;
		}

		public GridActionResult(IEnumerable<TGridRow> currentPage, int totalRowCount)
		{
			_currentPage = currentPage;
			_totalRowCount = totalRowCount;
		}

		public GridActionResult(IEnumerable<TGridRow> currentPage, int totalRowCount, string footerText)
			: this(currentPage, totalRowCount)
		{
			_footerText = footerText;
		}

		public override void ExecuteResult(ControllerContext context)
		{
			var format = GetDataFormat(context);
			var gridDataService = DependencyResolver.Current.GetService<IGridDataService>();

			context.HttpContext.Response.ContentType = format;
			context.HttpContext.Response.Write(gridDataService.GetData(_currentPage, _totalRowCount, format, _footerText));
		}
	}
}