using System;
using System.Collections.Generic;
using System.Web.Mvc;

namespace D3Grid.Mvc
{
	public static class ControllerExtensions
	{
		public static ActionResult GridRows<TGridRow>(this Controller controller, 
			IEnumerable<TGridRow> gridRows, 
			int totalRowCount) where TGridRow : class
		{
			return new GridActionResult<TGridRow>(gridRows, totalRowCount);
		}

		public static ActionResult GridRows<TGridRow>(this Controller controller, 
			IEnumerable<TGridRow> gridRows, 
			int totalRowCount, 
			string footerText) where TGridRow : class
		{
			return new GridActionResult<TGridRow>(gridRows, totalRowCount, footerText);
		}
	}
}